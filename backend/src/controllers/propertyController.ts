// controllers/propertyController.js
import { Request, Response } from 'express';
import mongoose, { PipelineStage } from 'mongoose';
import Property, { IProperty } from '../models/Property.js';
import { createNotification } from './notificationController.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { generateUniqueSlug } from '../utils/slugGenerator.js';
import getGoogleMapEmbedUrl, { isValidCoordinates, resolveMapQuery } from '../utils/getGoogleMapEmbedUrl.js';
import { optimizeCloudinaryImage } from '../utils/optimizeCloudinaryImage.js';

interface FilterQuery {
  category?: string;
  type?: string | { $in: string[] };
  location?: { $regex: string; $options: string };
  bedrooms?: number | { $gte?: number; $eq?: number };
  price?: { $lt?: number; $lte?: number; $gte?: number; $gt?: number };
}

type PropertyInput = Omit<IProperty, keyof mongoose.Document>;

export const getProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      type,
      category,
      location,
      bedrooms,
      subtype,
      price: priceParamRaw,
      page = 1,
      limit = 12
    } = req.query;

    // Normalize price param (can be string or array from query)
    const price = Array.isArray(priceParamRaw) ? priceParamRaw[0] : priceParamRaw;

    let filter: FilterQuery = {};

    // Category filter
    if (category) {
      filter.category = category as string;
    }

    // Type filter
    if (subtype) {
      filter.type = subtype as string;
    } else if (type) {
      if (category === 'residential') {
        filter.type = { $in: ['apartment', 'villa', 'townhouse'] };
      } else if (category === 'commercial') {
        filter.type = { $in: ['retail', 'office'] };
      }
    }

    // Location filter
    if (location) {
      filter.location = { $regex: location as string, $options: 'i' };
    }

    // Bedrooms filter
    if (bedrooms) {
      const bedNum = parseInt(bedrooms as string);
      if (bedrooms === '4+') {
        filter.bedrooms = { $gte: 4 };
      } else {
        filter.bedrooms = bedNum;
      }
    }

    // Price filter - use direct range (price is stored as number in schema)
    // 450000 must NOT appear when filtering 500k-1M
    if (price) {
      const priceParam = String(price).trim();
      if (priceParam === 'below-50000') filter.price = { $lt: 50000 };
      else if (priceParam === '50000-100000') filter.price = { $gte: 50000, $lte: 100000 };
      else if (priceParam === 'above-100000') filter.price = { $gt: 100000 };
      else if (priceParam === 'below-500000') filter.price = { $lt: 500000 };
      else if (priceParam === '500000-1000000') filter.price = { $gte: 500000, $lte: 1000000 };
      else if (priceParam === '1000000-2000000') filter.price = { $gte: 1000000, $lte: 2000000 };
      else if (priceParam === '2000000-5000000') filter.price = { $gte: 2000000, $lte: 5000000 };
      else if (priceParam === 'above-5000000') filter.price = { $gt: 5000000 };
    }

    // Use aggregation to ensure price filter is applied (find() can have issues with mixed filters)
    const pipeline: PipelineStage[] = [
      { $match: filter },
      { $sort: { createdAt: -1 } },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) * 1 }
    ];

    const [countResult, propertiesResult] = await Promise.all([
      Property.countDocuments(filter),
      Property.aggregate(pipeline)
    ]);

    const total = countResult;
    const properties = propertiesResult;

    res.status(200).json({
      success: true,
      data: properties,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalProperties: total,
      },
      message: "Properties retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

export const getPropertyById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    console.log('getPropertyById called with id:', id);

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Property identifier is required'
      });
      return;
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      const readyStateMessages: Record<number, string> = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      const stateMessage = readyStateMessages[mongoose.connection.readyState] || 'unknown';
      console.error('❌ Database not connected. ReadyState:', mongoose.connection.readyState, `(${stateMessage})`);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: `Database is not connected. Status: ${stateMessage}`,
          readyState: mongoose.connection.readyState
        });
      }
      return;
    }

    let property = null;

    try {
      // Try to find by slug first (convert to lowercase to match schema)
      const slugToSearch = id?.toLowerCase().trim();
      console.log('Searching for property with slug:', slugToSearch);
      property = await Property.findOne({ slug: slugToSearch }).lean();

      // If not found by slug and id looks like a MongoDB ObjectId, try findById
      if (!property && mongoose.Types.ObjectId.isValid(id as string)) {
        console.log('Slug not found, trying ObjectId:', id);
        try {
          property = await Property.findById(id).lean();
        } catch (findByIdError: any) {
          // If findById fails (invalid ObjectId format), ignore and continue
          console.log('findById failed:', findByIdError?.message);
        }
      }
    } catch (queryError: any) {
      console.error('Database query error:', queryError);
      throw queryError;
    }

    if (!property) {
      console.log('Property not found for id:', id);
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    console.log('Property found:', property._id || property.id);

    // Property is already a plain object due to .lean(), but ensure it's serializable
    res.status(200).json({
      success: true,
      data: property,
      message: "Property retrieved successfully"
    });
  } catch (error: any) {
    console.error('❌ Error fetching property:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Request params:', req.params);
    console.error('Database readyState:', mongoose.connection.readyState);

    // Ensure we always send a valid JSON response
    let errorMessage = 'Unknown server error';

    if (error?.message) {
      errorMessage = String(error.message);
    } else if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.toString) {
      errorMessage = error.toString();
    }

    // Check if database is the issue
    if (mongoose.connection.readyState !== 1) {
      errorMessage = 'Database is not connected. Please check your MongoDB connection.';
    }

    const errorResponse = {
      success: false,
      message: 'Server error',
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          type: error?.constructor?.name,
          code: error?.code,
          stack: error?.stack
        }
      })
    };

    // Make sure response hasn't been sent already
    if (!res.headersSent) {
      try {
        res.status(500).json(errorResponse);
      } catch (sendError) {
        console.error('Failed to send error response:', sendError);
      }
    } else {
      console.error('⚠️ Response already sent, cannot send error response');
    }
  }
};

export const getLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const locations = await Property.distinct('location');

    if (!locations.length) {
      res.status(404).json({
        success: false,
        message: 'Locations not found'
      });
      return;
    }

    const filteredLocations = [
      ...new Set(
        locations
          .map((location) => location.trim().toLowerCase())
          .filter(Boolean)
      )
    ];

    const locationWithLabel = filteredLocations.map((location) => ({
      label: location.toUpperCase(),
      value: location
    }));

    res.status(200).json({
      success: true,
      message: 'Locations with properties',
      data: locationWithLabel
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Get property by slug only
export const getPropertyBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    let { slug } = req.params;

    // Decode URL-encoded slug
    if (slug) {
      slug = decodeURIComponent(slug as string);
    }

    console.log('getPropertyBySlug called with slug:', slug);

    if (!slug) {
      res.status(400).json({
        success: false,
        message: 'Property slug is required'
      });
      return;
    }

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      const readyStateMessages: Record<number, string> = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
      };
      const stateMessage = readyStateMessages[mongoose.connection.readyState] || 'unknown';
      console.error('❌ Database not connected. ReadyState:', mongoose.connection.readyState, `(${stateMessage})`);

      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Database connection error',
          error: `Database is not connected. Status: ${stateMessage}`,
          readyState: mongoose.connection.readyState
        });
      }
      return;
    }

    // Normalize slug: lowercase and trim
    const slugToSearch = slug.toLowerCase().trim();
    console.log('Searching for property with normalized slug:', slugToSearch);

    const property = await Property.findOne({ slug: slugToSearch }).lean();

    if (!property) {
      console.log('Property not found for slug:', slugToSearch);
      res.status(404).json({
        success: false,
        message: 'Property not found',
        slug: slugToSearch
      });
      return;
    }

    // console.log('✅ Property found by slug:', property._id || property.id, 'Title:', property.title);
    // console.log('📸 Property images count:', property.images?.length || 0);
    // if (property.images && property.images.length > 0) {
    //   console.log('📸 Images:', property.images);
    // }

    // const properties= {...property, mapUrl:'https://maps.app.goo.gl/QHfjkJuCFJaPRwiz5'}
    let coordinateMap: string | undefined;

    if (!property.mapQuery) {
      coordinateMap = await resolveMapQuery(property, property.location);

      if (coordinateMap && isValidCoordinates(coordinateMap)) {
        await Property.findByIdAndUpdate(property._id, {
          mapQuery: coordinateMap,
        });
      }
    }

    const mapCor = property.mapQuery || coordinateMap;

    const formatedResponse = {
      ...property,
      mapQuery: mapCor,
      coverImage: optimizeCloudinaryImage(property?.coverImage ?? "", {
        width: 1600,
        quality: "auto:best",
        format: "webp",
      }),
      images: property.images.map((i) =>
        optimizeCloudinaryImage(i, {
          width: 1600,
          quality: "auto:best",
          format: "webp",
        })
      ),
    };
    res.status(200).json({
      success: true,
      data: formatedResponse,
      message: "Property retrieved successfully"
    });
  } catch (error: any) {
    console.error('❌ Error fetching property by slug:', error);
    console.error('Error type:', error?.constructor?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Request params:', req.params);
    console.error('Database readyState:', mongoose.connection.readyState);

    let errorMessage = 'Unknown server error';

    if (error?.message) {
      errorMessage = String(error.message);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Check if database is the issue
    if (mongoose.connection.readyState !== 1) {
      errorMessage = 'Database is not connected. Please check your MongoDB connection.';
    }

    const errorResponse = {
      success: false,
      message: 'Server error',
      error: errorMessage,
      ...(process.env.NODE_ENV === 'development' && {
        details: {
          type: error?.constructor?.name,
          code: error?.code,
          stack: error?.stack,
          slug: req.params.slug
        }
      })
    };

    if (!res.headersSent) {
      try {
        res.status(500).json(errorResponse);
      } catch (sendError) {
        console.error('Failed to send error response:', sendError);
      }
    } else {
      console.error('⚠️ Response already sent, cannot send error response');
    }
  }
};

export const getSimilarProperties = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, type } = req.params;

    if (!id || !type) {
      res.status(400).json({
        success: false,
        message: 'Property identifier and type are required'
      });
      return;
    }

    let currentProperty = null;

    // Find the current property by slug first (convert to lowercase)
    const slugToSearch = (id as string).toLowerCase().trim();
    currentProperty = await Property.findOne({ slug: slugToSearch });

    // If not found by slug and id looks like a MongoDB ObjectId, try findById
    if (!currentProperty && mongoose.Types.ObjectId.isValid(id as string)) {
      try {
        currentProperty = await Property.findById(id);
      } catch (findByIdError) {
        console.log('findById failed in getSimilarProperties, continuing with slug search only');
      }
    }

    if (!currentProperty) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    const properties = await Property.find({
      type,
      _id: { $ne: currentProperty._id }
    }).limit(6).lean(); // Increased limit to 6 for better UX, .lean() for proper serialization

    res.status(200).json({
      success: true,
      data: properties,
      message: "Similar properties retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching similar properties:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      params: req.params
    });
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Get similar properties by slug
export const getSimilarPropertiesBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    let { slug, type } = req.params;

    // Decode URL-encoded slug
    if (slug) {
      slug = decodeURIComponent(slug as string);
    }

    if (!slug) {
      res.status(400).json({
        success: false,
        message: 'Property slug and type are required'
      });
      return;
    }

    // Find the current property by slug (normalize to lowercase)
    const slugToSearch = slug.toLowerCase().trim();
    const currentProperty = await Property.findOne({ slug: slugToSearch }).lean();

    if (!currentProperty) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    // Find similar properties based on multiple criteria
    const properties = await Property.find({
      _id: { $ne: currentProperty._id },
      type: currentProperty.type,
      $or: [
        { location: currentProperty.location },
        { category: currentProperty.category },
        { propertyType: currentProperty.propertyType }
      ]
    }).limit(3).lean();

    res.status(200).json({
      success: true,
      data: properties,
      message: "Similar properties retrieved successfully"
    });
  } catch (error) {
    console.error('Error fetching similar properties by slug:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

export const createProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const adminId = (req as any).user as string;


    // Parse amenities from JSON string if needed
    let amenities = [];
    if (req.body.amenities) {
      if (typeof req.body.amenities === 'string') {
        amenities = JSON.parse(req.body.amenities);
      } else {
        amenities = req.body.amenities;
      }
    }

    let amenityIconIndexes: number[] = [];
    if (req.body.amenityIconIndexes) {
      if (typeof req.body.amenityIconIndexes === 'string') {
        amenityIconIndexes = JSON.parse(req.body.amenityIconIndexes);
      } else if (Array.isArray(req.body.amenityIconIndexes)) {
        amenityIconIndexes = req.body.amenityIconIndexes;
      }
    }

    // Process amenity icons if files are uploaded
    if (req.files && typeof req.files === 'object' && 'amenityIcons' in req.files) {
      const amenityIconFiles = req.files.amenityIcons as Express.Multer.File[];

      for (let fileIndex = 0; fileIndex < amenityIconFiles.length; fileIndex++) {
        const iconFile = amenityIconFiles[fileIndex];
        const amenityIndex = amenityIconIndexes[fileIndex];
        if (
          iconFile &&
          typeof amenityIndex === 'number' &&
          amenities[amenityIndex]
        ) {
          try {
            const iconUrl = await uploadToCloudinary({
              buffer: iconFile.buffer,
              mimetype: iconFile.mimetype,
              originalname: iconFile.originalname
            }, 'habibi-properties/amenities');
            amenities[amenityIndex].icon = iconUrl;
          } catch (uploadError) {
            console.error(`Error uploading icon for amenity ${amenityIndex}:`, uploadError);
            amenities[amenityIndex].icon = amenities[amenityIndex].icon || '';
          }
        }
      }
    }

    // Ensure all amenities have icon field (even if empty string) - icon is now optional
    amenities.forEach((amenity: any) => {
      if (!amenity.hasOwnProperty('icon') || amenity.icon === null || amenity.icon === undefined) {
        amenity.icon = '';
      }
    });

    // Process property images/videos/files if uploaded
    // IMPORTANT: Cover image and additional images are kept separate
    let coverImageUrl: string | undefined = undefined;
    let additionalImageUrls: string[] = [];

    if (req.files && typeof req.files === 'object') {
      // Handle single cover image/video/file (from "Upload Cover Image/Video" field)
      if ('image' in req.files && req.files.image) {
        const coverFile = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
        coverImageUrl = await uploadToCloudinary({
          buffer: coverFile.buffer,
          mimetype: coverFile.mimetype,
          originalname: coverFile.originalname
        }, 'habibi-properties/properties');
      }

      // Handle multiple additional images/videos/files (from "Additional Images/Videos" field)
      // These should NEVER become the cover image
      if ('images' in req.files && req.files.images) {
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        // Limit to 10 files
        const limitedFiles = files.slice(0, 10);
        const fileUrls = await Promise.all(
          limitedFiles.map(file => uploadToCloudinary({
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname
          }, 'habibi-properties/properties'))
        );
        additionalImageUrls = fileUrls; // Store separately, don't mix with cover
      }

      // Handle SEO image
      if ('seoImage' in req.files && req.files.seoImage) {
        const seoFile = Array.isArray(req.files.seoImage) ? req.files.seoImage[0] : req.files.seoImage;
        req.body.seoImage = await uploadToCloudinary({
          buffer: seoFile.buffer,
          mimetype: seoFile.mimetype,
          originalname: seoFile.originalname
        }, 'habibi-properties/properties');
      }
    }

    // Build final images array: cover image first, then additional images
    let images: string[] = [];
    if (coverImageUrl) {
      images.push(coverImageUrl); // Cover image is always first
    }
    images.push(...additionalImageUrls); // Additional images come after

    // Generate unique slug from title
    const slug = await generateUniqueSlug(
      req.body.title || 'property',
      async (slugToCheck: string) => {
        const existing = await Property.findOne({ slug: slugToCheck });
        return !!existing;
      }
    );

    // Parse price as number
    const priceNumber = typeof req.body.price === 'string'
      ? parseFloat(req.body.price.replace(/[^0-9.]/g, '')) || 0
      : Number(req.body.price) || 0;

    // Ensure at least one image is provided
    if (images.length === 0) {
      res.status(400).json({
        success: false,
        message: 'At least one image is required for the property',
        error: 'Please upload at least one image (cover image or additional images)'
      });
      return;
    }

    // Set coverImage - only from the cover image field, not from additional images
    // If no cover image was uploaded, coverImage remains undefined
    const coverImage = coverImageUrl || undefined;

    // Ensure amenities have valid structure (name is required, icon is optional)
    const validatedAmenities = amenities
      .map((amenity: any) => ({
        name: String(amenity.name || '').trim(),
        icon: amenity.icon ? String(amenity.icon).trim() : '' // Icon is optional, default to empty string
      }))
      .filter((amenity: any) => amenity.name.length > 0); // Remove amenities with empty names

    // Convert bedrooms and bathrooms to numbers
    const bedrooms = typeof req.body.bedrooms === 'string'
      ? parseInt(req.body.bedrooms) || 0
      : Number(req.body.bedrooms) || 0;

    const bathrooms = typeof req.body.bathrooms === 'string'
      ? parseInt(req.body.bathrooms) || 0
      : Number(req.body.bathrooms) || 0;

    let paymentPlans;
    let propertGroups = [];
    if (req.body.propertygroups) {
      propertGroups = JSON.parse(req.body.propertygroups);
    }

    if (req.body?.paymentplans) {
      paymentPlans = JSON.parse(req.body?.paymentplans)
    }
    let unitImageIndexes: number[] = [];
    if (req.body.unitImageIndexes) {
      if (typeof req.body.unitImageIndexes === 'string') {
        unitImageIndexes = JSON.parse(req.body.unitImageIndexes);
      } else if (Array.isArray(req.body.unitImageIndexes)) {
        unitImageIndexes = req.body.unitImageIndexes;
      }
    }

    // Flatten all units for easy indexing
    const allUnits: any[] = [];
    propertGroups.forEach((group: any) => {
      if (group.units) {
        group.units.forEach((unit: any) => {
          allUnits.push(unit);
        });
      }
    });

    if (req.files && typeof req.files === 'object' && 'unitImages' in req.files) {
      const unitImageFiles = req.files.unitImages as Express.Multer.File[];
      for (let i = 0; i < unitImageFiles.length; i++) {
        const file = unitImageFiles[i];
        const unitIndex = unitImageIndexes[i];
        if (file && typeof unitIndex === 'number' && allUnits[unitIndex]) {
          try {
            const imageUrl = await uploadToCloudinary({
              buffer: file.buffer,
              mimetype: file.mimetype,
              originalname: file.originalname
            }, 'habibi-properties/properties/units');
            allUnits[unitIndex].floreImage = imageUrl;
          } catch (uploadError) {
            console.error(`Error uploading unit image for unit ${unitIndex}:`, uploadError);
            // Keep existing or leave empty
          }
        }
      }
    }
    let ytVideos;
    if (req.body.ytvideos) {
      ytVideos = JSON.parse(req.body.ytvideos)
    }



    const propertyData: PropertyInput = {
      paymentPlans: paymentPlans,
      ytVideos: ytVideos,
      propertGroups: propertGroups,
      dld: req.body.dld,
      handOver: req.body.handOver,
      paymentInstalment: req.body.paymentInstalment,
      title: req.body.title,
      category: req.body.category,
      type: req.body.type,
      propertyType: req.body.propertyType,
      description: req.body.description,
      location: req.body.location,
      area: req.body.area,
      bedrooms: bedrooms,
      bathrooms: bathrooms,
      slug: slug,
      price: priceNumber,
      forSaleLabel: req.body.forSaleLabel || 'For Sale',
      mapUrl: req.body.mapUrl || '',
      timeAgo: req.body.timeAgo || 'Recently added',
      seoTitle: req.body.seoTitle || '',
      seoDescription: req.body.seoDescription || '',
      canonicalUrl: req.body.canonicalUrl || undefined,
      schemaMarkup: req.body.schemaMarkup || undefined,
      seoImage: req.body.seoImage || undefined,
      amenities: validatedAmenities,
      coverImage: coverImage, // Set cover image for preview on cards
      images: images,
      createdBy: adminId
    };

    let mapQuery: string | undefined;

    mapQuery = await resolveMapQuery(propertyData, propertyData.location);

    // Don't save invalid coordinates
    if (mapQuery && !isValidCoordinates(mapQuery)) {
      mapQuery = undefined;
    }

    const property = new Property({ ...propertyData, mapQuery: mapQuery ? mapQuery : null });
    await property.save();

    // Create notification - FIX: Type assertion for _id
    await createNotification(
      'property',
      `New property added: ${propertyData.title} (${propertyData.category} - ${propertyData.type})`,
      (property._id as mongoose.Types.ObjectId).toString()
    );

    res.status(201).json({
      success: true,
      data: property,
      message: "Property created successfully"
    });
  } catch (error: any) {
    console.error('Error creating property:', error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors: Record<string, string> = {};
      Object.keys(error.errors || {}).forEach((key) => {
        validationErrors[key] = error.errors[key].message;
      });

      res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
        validationErrors: validationErrors
      });
      return;
    }

    // Handle other errors
    res.status(400).json({
      success: false,
      message: 'Error creating property',
      error: error.message || 'Unknown error occurred',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const updateProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // ─── Parse amenities ───────────────────────────────────────────
    let amenities = [];
    if (req.body.amenities) {
      if (typeof req.body.amenities === 'string') {
        amenities = JSON.parse(req.body.amenities);
      } else {
        amenities = req.body.amenities;
      }
    }

    let amenityIconIndexes: number[] = [];
    if (req.body.amenityIconIndexes) {
      if (typeof req.body.amenityIconIndexes === 'string') {
        amenityIconIndexes = JSON.parse(req.body.amenityIconIndexes);
      } else if (Array.isArray(req.body.amenityIconIndexes)) {
        amenityIconIndexes = req.body.amenityIconIndexes;
      }
    }

    // Process amenity icons
    if (req.files && typeof req.files === 'object' && 'amenityIcons' in req.files) {
      const amenityIconFiles = req.files.amenityIcons as Express.Multer.File[];
      for (let fileIndex = 0; fileIndex < amenityIconFiles.length; fileIndex++) {
        const iconFile = amenityIconFiles[fileIndex];
        const amenityIndex = amenityIconIndexes[fileIndex];
        if (iconFile && typeof amenityIndex === 'number' && amenities[amenityIndex]) {
          try {
            const iconUrl = await uploadToCloudinary({
              buffer: iconFile.buffer,
              mimetype: iconFile.mimetype,
              originalname: iconFile.originalname
            }, 'habibi-properties/amenities');
            amenities[amenityIndex].icon = iconUrl;
          } catch (uploadError) {
            console.error(`Error uploading icon for amenity ${amenityIndex}:`, uploadError);
            amenities[amenityIndex].icon = amenities[amenityIndex].icon || '';
          }
        }
      }
    }

    amenities.forEach((amenity: any) => {
      if (!amenity.hasOwnProperty('icon') || amenity.icon === null || amenity.icon === undefined) {
        amenity.icon = '';
      }
    });

    // ─── Process images ──────────────────────────────────────────
    let newCoverImageUrl: string | undefined = undefined;
    let newAdditionalImageUrls: string[] = [];

    if (req.files && typeof req.files === 'object') {
      if ('image' in req.files && req.files.image) {
        const coverFile = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
        newCoverImageUrl = await uploadToCloudinary({
          buffer: coverFile.buffer,
          mimetype: coverFile.mimetype,
          originalname: coverFile.originalname
        }, 'habibi-properties/properties');
      }

      if ('images' in req.files && req.files.images) {
        const files = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
        const limitedFiles = files.slice(0, 10);
        const fileUrls = await Promise.all(
          limitedFiles.map(file => uploadToCloudinary({
            buffer: file.buffer,
            mimetype: file.mimetype,
            originalname: file.originalname
          }, 'habibi-properties/properties'))
        );
        newAdditionalImageUrls = fileUrls;
      }

      if ('seoImage' in req.files && req.files.seoImage) {
        const seoFile = Array.isArray(req.files.seoImage) ? req.files.seoImage[0] : req.files.seoImage;
        req.body.seoImage = await uploadToCloudinary({
          buffer: seoFile.buffer,
          mimetype: seoFile.mimetype,
          originalname: seoFile.originalname
        }, 'habibi-properties/properties');
      }
    }

    const existingProperty = await Property.findById(id);

    let finalImages: string[] = [];
    let finalCoverImage: string | undefined = undefined;

    if (newCoverImageUrl) {
      finalCoverImage = newCoverImageUrl;
      finalImages.push(newCoverImageUrl);
    } else if (req.body.existingCoverImage) {
      finalCoverImage = req.body.existingCoverImage;
      finalImages.push(req.body.existingCoverImage);
    } else if (existingProperty && existingProperty.images && existingProperty.images.length > 0) {
      finalCoverImage = existingProperty.coverImage || existingProperty.images[0];
      finalImages.push(existingProperty.images[0]);
    }

    if (req.body.existingImages) {
      let existingImages: string[] = [];
      if (typeof req.body.existingImages === 'string') {
        existingImages = JSON.parse(req.body.existingImages);
      } else if (Array.isArray(req.body.existingImages)) {
        existingImages = req.body.existingImages;
      }
      finalImages.push(...existingImages);
    } else if (existingProperty && existingProperty.images && existingProperty.images.length > 1 && !newCoverImageUrl && !req.body.existingCoverImage) {
      finalImages.push(...existingProperty.images.slice(1));
    }

    finalImages.push(...newAdditionalImageUrls);
    const images = finalImages;

    // ─── Parse payment plans (MISSING in original) ──────────────
    let paymentPlans = [];
    if (req.body.paymentplans) {
      if (typeof req.body.paymentplans === 'string') {
        paymentPlans = JSON.parse(req.body.paymentplans);
      } else if (Array.isArray(req.body.paymentplans)) {
        paymentPlans = req.body.paymentplans;
      }
    }

    // ─── Parse property groups ──────────────────────────────────
    let propertGroups = [];
    if (req.body.propertygroups) {
      if (typeof req.body.propertygroups === 'string') {
        propertGroups = JSON.parse(req.body.propertygroups);
      } else if (Array.isArray(req.body.propertygroups)) {
        propertGroups = req.body.propertygroups;
      }
    }

    // ─── Handle unit floor images ───────────────────────────────
    let unitImageIndexes: number[] = [];
    if (req.body.unitImageIndexes) {
      if (typeof req.body.unitImageIndexes === 'string') {
        unitImageIndexes = JSON.parse(req.body.unitImageIndexes);
      } else if (Array.isArray(req.body.unitImageIndexes)) {
        unitImageIndexes = req.body.unitImageIndexes;
      }
    }

    const allUnits: any[] = [];
    propertGroups.forEach((group: any) => {
      if (group.units) {
        group.units.forEach((unit: any) => {
          allUnits.push(unit);
        });
      }
    });

    if (req.files && typeof req.files === 'object' && 'unitImages' in req.files) {
      const unitImageFiles = req.files.unitImages as Express.Multer.File[];
      for (let i = 0; i < unitImageFiles.length; i++) {
        const file = unitImageFiles[i];
        const unitIndex = unitImageIndexes[i];
        if (file && typeof unitIndex === 'number' && allUnits[unitIndex]) {
          try {
            const imageUrl = await uploadToCloudinary({
              buffer: file.buffer,
              mimetype: file.mimetype,
              originalname: file.originalname
            }, 'habibi-properties/properties/units');
            allUnits[unitIndex].floreImage = imageUrl;
          } catch (uploadError) {
            console.error(`Error uploading unit image for unit ${unitIndex}:`, uploadError);
          }
        }
      }
    }


    // ─── Build update data ──────────────────────────────────────
    // Exclude fields that are handled separately
    const { amenities: _, images: __, ...restBody } = req.body;
    const updateData: any = { ...restBody };


    if (req.body.ytvideos) {
      let ytVideos = JSON.parse(req.body.ytvideos)
      updateData.ytVideos = ytVideos
    }

    // Convert types
    if (updateData.bedrooms !== undefined) {
      updateData.bedrooms = typeof updateData.bedrooms === 'string'
        ? parseInt(updateData.bedrooms) || 0
        : updateData.bedrooms;
    }
    if (updateData.bathrooms !== undefined) {
      updateData.bathrooms = typeof updateData.bathrooms === 'string'
        ? parseInt(updateData.bathrooms) || 0
        : updateData.bathrooms;
    }
    if (updateData.price !== undefined) {
      updateData.price = typeof updateData.price === 'string'
        ? parseFloat(updateData.price.replace(/[^0-9.]/g, '')) || 0
        : Number(updateData.price) || 0;
    }

    // Set amenities
    updateData.amenities = amenities;

    // Set images and coverImage
    if (images.length > 0) {
      updateData.images = images;
      updateData.coverImage = finalCoverImage || (images.length > 0 ? images[0] : undefined);
    } else if (existingProperty && existingProperty.images && existingProperty.images.length > 0) {
      updateData.coverImage = existingProperty.coverImage || existingProperty.images[0];
    }

    // Set payment plans and property groups
    updateData.paymentPlans = paymentPlans;
    updateData.propertGroups = propertGroups;


    // Handle slug update if title changed
    if (existingProperty && req.body.title && req.body.title !== existingProperty.title) {
      const slug = await generateUniqueSlug(
        req.body.title,
        async (slugToCheck: string) => {
          const existing = await Property.findOne({ slug: slugToCheck, _id: { $ne: id } });
          return !!existing;
        }
      );
      updateData.slug = slug;
    }

    let mapQuery: string | undefined;

    if (req.body.mapUrl) {
      mapQuery = await resolveMapQuery(updateData, updateData.location);

      if (mapQuery && isValidCoordinates(mapQuery)) {
        updateData.mapQuery = mapQuery;
      } else {
        updateData.mapQuery = null;
      }
    }

    // ─── Update property ────────────────────────────────────────
    const property = await Property.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: property,
      message: "Property updated successfully"
    });
  } catch (error) {
    console.error('Error updating property:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating property',
      error: (error as Error).message
    });
  }
};

export const deleteProperty = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await Property.findByIdAndDelete(id);

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: (error as Error).message
    });
  }
};

// Get SEO metadata for property by slug
export const getPropertySEO = async (req: Request, res: Response): Promise<void> => {
  try {
    let { slug } = req.params;

    // Decode URL-encoded slug
    if (slug) {
      slug = decodeURIComponent(slug as string);
    }

    // Normalize slug: lowercase and trim
    const slugToSearch = slug.toLowerCase().trim();

    const property = await Property.findOne({ slug: slugToSearch })
      .select('images seoTitle seoDescription title description')
      .lean();

    if (!property) {
      res.status(404).json({
        success: false,
        message: 'Property not found'
      });
      return;
    }

    // Get the first image as the main/featured image
    const mainImage = property.images && property.images.length > 0 ? property.images[0] : '';

    res.status(200).json({
      success: true,
      data: {
        image: mainImage, // Main/featured image (first image from images array)
        title: property.seoTitle || property.title, // SEO title or fallback to regular title
        description: property.seoDescription || property.description || '' // SEO description or fallback
      },
      message: "Property SEO metadata retrieved successfully"
    });
  } catch (error: any) {
    console.error("Error fetching property SEO:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};