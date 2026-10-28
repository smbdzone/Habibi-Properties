"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Input,
  Select,
  FileUpload,
  RichTextEditor,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import {
  createPropertyWithFiles,
  fetchPropertyById,
  updatePropertyWithFiles,
} from "@/services/properties";
import { Property } from "@/types/api";
import { validateFile } from "@/utils/fileValidation";
import { ALL_AMENITIES, getDefaultAmenityIconUrl } from "@/data/amenities";
import { format } from "path/posix";
import { formatPrice, parsePrice } from "@/utils/priceFormat";

const residentialTypes = [
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "townhouse", label: "Townhouse" },
];

const commercialTypes = [
  { value: "retail", label: "Retail" },
  { value: "office", label: "Office" },
];

interface FormState {
  title: string;
  category: "residential" | "commercial";
  type: "apartment" | "villa" | "townhouse" | "retail" | "office";
  propertyType?: string;
  description: string;
  location: string;
  area: string;
  bedrooms: string;
  bathrooms?: string;
  price: string;
  forSaleLabel?: "For Sale" | "For Rent";
  mapUrl: string;
  timeAgo: string;
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  schemaMarkup: string;
  dld?: string;
  handOver?: string;
  paymentInstalment?: string
}

export default function AddPropertyPage() {
  const router = useRouter();
  const params = useSearchParams();
  const propertyId = params.get("id");
  const { token } = useAuth();

  const [formData, setFormData] = useState<FormState>({
    title: "",
    category: "residential",
    type: "apartment",
    propertyType: "",
    description: "",
    location: "",
    area: "",
    bedrooms: "",
    bathrooms: "",
    price: "",
    forSaleLabel: "For Sale",
    mapUrl: "",
    timeAgo: "Recently added",
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    schemaMarkup: "",
    dld: '',
    handOver: '',
    paymentInstalment: ''
  });

  // Convert price into best format
  const [priceRaw, setPriceRaw] = useState('');
  const [displayPrice, setDisplayPrice] = useState('');

  useEffect(() => {
    setDisplayPrice(formatPrice(priceRaw));
  }, [priceRaw]);

  useEffect(() => {
    setPriceRaw(formData.price);
  }, [formData.price]);


  const [paymentPlans, setPaymentPlans] = useState<any[]>([])
  const [propertyGroups, setPropertyGroups] = useState<any[]>([]);
  const [seoImageFile, setSeoImageFile] = useState<File | null>(null);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [existingCoverImageUrl, setExistingCoverImageUrl] = useState<string | null>(null);
  const [existingAdditionalImageUrls, setExistingAdditionalImageUrls] = useState<string[]>([]);
  const [amenityIconFiles, setAmenityIconFiles] = useState<Map<string, File>>(new Map());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const additionalImagesInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(!!propertyId);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set());
  const [amenityIcons, setAmenityIcons] = useState<Map<string, string>>(new Map()); // Map of amenity name to icon URL
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [amenitySearchQuery, setAmenitySearchQuery] = useState("");
  const INITIAL_AMENITIES_COUNT = 32; // Show first 32 amenities initially

  const [ytVideos, setYtVideos] = useState<any[]>([])

  const handleAddVideo = () => {
    setYtVideos((prev) => [
      ...prev, {
        id: Date.now(),
        link: ''
      }
    ])
  }

  const handleRemoveVideo = (id: number) => {
    setYtVideos((prev) =>
      prev.filter((video) => video.id !== id)
    )
  }

  const handleChangeVideo = ({ id, link }: { id: number, link: string }) => {
    setYtVideos((prev) =>
      prev.map((video) =>
        video.id === id ? {
          ...video,
          link: link
        } : video
      )
    )
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Property Units 
  const handleAddPropertyGroup = () => {
    setPropertyGroups((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        units: [],
      },
    ]);
  };

  const handleRemovePropertyGroup = (groupId: number) => {
    setPropertyGroups((prev) =>
      prev.filter((group) => group.id !== groupId)
    );
  };

  const handleAddUnit = (groupId: number) => {
    setPropertyGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
            ...group,
            units: [
              ...group.units,
              {
                id: Date.now(),
                type: "",
                area: "",
                price: "",
                floreImage: "",        // URL string (for existing or newly uploaded)
                floreImageFile: null,  // File object for new upload
                existingFloreImage: "", // Existing URL to preserve when editing
              },
            ],
          }
          : group
      )
    );
  };

  const handleRemoveUnit = (
    groupId: number,
    unitId: number
  ) => {
    setPropertyGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
            ...group,
            units: group.units.filter(
              (unit: any) => unit.id !== unitId
            ),
          }
          : group
      )
    );
  };

  const handleGroupNameChange = (
    groupId: number,
    value: string
  ) => {
    setPropertyGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
            ...group,
            name: value,
          }
          : group
      )
    );
  };

  const handleUnitChange = (
    groupId: number,
    unitId: number,
    field: "type" | "area" | "price" | "floreImage",
    value: string
  ) => {
    let newValue = value;
    if (field === "price") {
      newValue = parsePrice(value); // store raw digits only
    }
    setPropertyGroups(prev =>
      prev.map(group =>
        group.id === groupId
          ? {
            ...group,
            units: group.units.map((unit: any) =>
              unit.id === unitId ? { ...unit, [field]: newValue } : unit
            ),
          }
          : group
      )
    );
  };
  // Payment Plans 
  const handleAddPlan = () => {
    setPaymentPlans((prev) => [
      ...prev,
      {
        id: Date.now(),
        planName: "",
        parts: [],
      },
    ]);
  };

  const handleAddPart = (planId: number) => {
    setPaymentPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
            ...plan,
            parts: [
              ...plan.parts,
              {
                id: Date.now(),
                partName: "",
                percentage: 0,
              },
            ],
          }
          : plan
      )
    );
  };

  const handlePlanNameChange = (
    planId: number,
    value: string
  ) => {
    setPaymentPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? { ...plan, planName: value }
          : plan
      )
    );
  };

  const handlePartChange = (
    planId: number,
    partId: number,
    field: "partName" | "percentage",
    value: string | number
  ) => {
    setPaymentPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
            ...plan,
            parts: plan.parts.map((part: any) =>
              part.id === partId
                ? {
                  ...part,
                  [field]: value,
                }
                : part
            ),
          }
          : plan
      )
    );
  };

  const handleRemovePlan = (planId: number) => {
    setPaymentPlans((prev) =>
      prev.filter((plan) => plan.id !== planId)
    );
  };

  const handleRemovePart = (planId: number, partId: number) => {
    setPaymentPlans((prev) =>
      prev.map((plan) =>
        plan.id === planId
          ? {
            ...plan,
            parts: plan.parts.filter(
              (part: any) => part.id !== partId
            ),
          }
          : plan
      )
    );
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove any non-numeric characters (including "AED", commas, spaces)
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    const raw = parsePrice(e.target.value);
    const formatted = formatPrice(raw);
    setFormData(prev => ({ ...prev, price: raw }));
    // Update local raw value (optional)
    setPriceRaw(raw);
  };

  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = parsePrice(e.target.value);
    const formatted = formatPrice(raw);
    setPriceRaw(raw);
    setDisplayPrice(formatted);
    setFormData(prev => ({ ...prev, price: raw }));
  };

  const handleDescriptionChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      description: value,
    }));
  };

  const handleCoverImageSelect = (file: File | null) => {
    if (file) {
      const validation = validateFile(file, ['image', 'video']);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file type');
        return;
      }
    }
    setCoverImageFile(file);

    // Create preview for cover image
    if (file) {
      if (file.type.startsWith('video/')) {
        const videoUrl = URL.createObjectURL(file);
        setCoverImagePreview(videoUrl);
      } else {
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setCoverImagePreview(null);
    }
  };

  const handleAdditionalImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const MAX_FILES = 10;
    const currentCount = additionalImageFiles.length;
    const remainingSlots = MAX_FILES - currentCount;

    if (remainingSlots <= 0) {
      alert(`You have reached the maximum of ${MAX_FILES} files.`);
      if (additionalImagesInputRef.current) {
        additionalImagesInputRef.current.value = '';
      }
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of newFiles) {
      const validation = validateFile(file, ['image', 'video']);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        setError(`${file.name}: ${validation.error || 'Invalid file type'}`);
      }
    }

    // Limit valid files to remaining slots
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (validFiles.length > remainingSlots) {
      alert(`You can only add ${remainingSlots} more file(s). Maximum is ${MAX_FILES} files.`);
    }

    // Append new files to existing ones
    setAdditionalImageFiles(prev => [...prev, ...filesToAdd]);

    // Reset input to allow selecting the same files again
    if (additionalImagesInputRef.current) {
      additionalImagesInputRef.current.value = '';
    }
  };


  // Drag and drop handlers for reordering images
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Convert actualIndex back to index within additionalImageFiles
    const existingCount = existingAdditionalImageUrls.length;
    let draggedFileIndex: number;
    let dropFileIndex: number;

    // If draggedIndex/dropIndex includes existing images, subtract the count
    draggedFileIndex = draggedIndex >= existingCount ? draggedIndex - existingCount : draggedIndex;
    dropFileIndex = dropIndex >= existingCount ? dropIndex - existingCount : dropIndex;

    // Only reorder if both indices are valid within additionalImageFiles
    if (draggedFileIndex >= 0 && dropFileIndex >= 0 &&
      draggedFileIndex < additionalImageFiles.length &&
      dropFileIndex < additionalImageFiles.length) {
      const newFiles = [...additionalImageFiles];
      const draggedItem = newFiles[draggedFileIndex];
      newFiles.splice(draggedFileIndex, 1);
      newFiles.splice(dropFileIndex, 0, draggedItem);
      setAdditionalImageFiles(newFiles);
    }

    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleToggleAmenity = (amenityName: string) => {
    setSelectedAmenities((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(amenityName)) {
        newSet.delete(amenityName);
        // Remove icon when amenity is deselected
        setAmenityIcons((prevIcons) => {
          const newIcons = new Map(prevIcons);
          newIcons.delete(amenityName);
          return newIcons;
        });
        setAmenityIconFiles((prevFiles) => {
          const newFiles = new Map(prevFiles);
          newFiles.delete(amenityName);
          return newFiles;
        });
      } else {
        newSet.add(amenityName);
      }
      return newSet;
    });
  };

  const handleAmenityIconUpload = (amenityName: string, file: File | null) => {
    if (file) {
      const validation = validateFile(file, ['image']);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid file type for amenity icon');
        return;
      }
      setAmenityIconFiles((prev) => new Map(prev).set(amenityName, file));
    } else {
      setAmenityIconFiles((prev) => {
        const newMap = new Map(prev);
        newMap.delete(amenityName);
        return newMap;
      });
      setAmenityIcons((prev) => {
        const newMap = new Map(prev);
        newMap.delete(amenityName);
        return newMap;
      });
    }
  };

  // Filter amenities based on search query
  const filteredAmenities = useMemo(() => {
    if (!amenitySearchQuery.trim()) {
      return ALL_AMENITIES;
    }
    const query = amenitySearchQuery.toLowerCase();
    return ALL_AMENITIES.filter((amenity) =>
      amenity.name.toLowerCase().includes(query)
    );
  }, [amenitySearchQuery]);

  // Get visible amenities (for initial display or all if expanded)
  const visibleAmenities = useMemo(() => {
    if (showAllAmenities) {
      return filteredAmenities;
    }
    return filteredAmenities.slice(0, INITIAL_AMENITIES_COUNT);
  }, [showAllAmenities, filteredAmenities]);

  const remainingAmenitiesCount = filteredAmenities.length - INITIAL_AMENITIES_COUNT;

  const loadProperty = useCallback(async () => {
    if (!propertyId) {
      console.log('No propertyId found');
      return;
    }
    console.log('Loading property with ID:', propertyId);
    setLoading(true);
    setError(null);
    try {
      // Token is optional for public route, but pass it if available
      const response = await fetchPropertyById(propertyId, token || undefined);
      console.log('Property response:', response);
      const property = (response.data ?? null) as Property | null;
      if (!property) {
        console.log('No property data in response');
        setError("Property not found");
        return;
      }
      console.log('Property loaded:', property);

      // Handle price - could be number or string from API
      const priceValue = property.price as string | number;
      const priceString = typeof priceValue === 'number'
        ? priceValue.toString()
        : String(priceValue || '');
      const cleanedPrice = priceString.replace(/[^0-9]/g, '') || '';

      // Handle forSaleLabel - ensure it's one of the allowed values
      const forSaleLabel = (property.forSaleLabel === "For Rent" || property.forSaleLabel === "For Sale")
        ? property.forSaleLabel
        : "For Sale";

      setFormData({
        title: property.title,
        category: property.category,
        type: property.type,
        propertyType: property?.propertyType,
        description: property.description,
        location: property.location,
        area: property.area,
        bedrooms: property.bedrooms.toString(),
        bathrooms: property?.bathrooms.toString() || '',
        price: cleanedPrice,
        forSaleLabel: forSaleLabel,
        mapUrl: property.mapUrl ?? "",
        timeAgo: property.timeAgo ?? "Recently added",
        seoTitle: property.seoTitle ?? "",
        seoDescription: property.seoDescription ?? "",
        canonicalUrl: property.canonicalUrl ?? "",
        schemaMarkup: property.schemaMarkup ?? "",
        dld: property.dld ?? '',
        handOver: property.handOver ?? '',
        paymentInstalment: property.paymentInstalment ?? ''
      });

      if (property.paymentPlans && property.paymentPlans.length > 0) {
        const plansWithId = property.paymentPlans.map((plan: any) => ({
          ...plan,
          id: plan.id || Date.now() + Math.random(),
          parts: plan.parts?.map((part: any) => ({
            ...part,
            id: part.id || Date.now() + Math.random(),
          })) || [],
        }));
        setPaymentPlans(plansWithId);
      } else {
        setPaymentPlans([]);
      }

      if (property.ytVideos && property.ytVideos.length > 0) {
        const withId = property.ytVideos.map((video: any) => ({
          id: Date.now() + Math.random(),
          link: video
        }))
        setYtVideos(withId)
      } else {
        setYtVideos([])
      }

      if (property.propertGroups && property.propertGroups.length > 0) {
        // Inside loadProperty, after setting propertyGroups:
        const groupsWithId = property.propertGroups.map((group: any) => ({
          ...group,
          id: group.id || Date.now() + Math.random(),
          units: group.units?.map((unit: any) => ({
            ...unit,
            id: unit.id || Date.now() + Math.random(),
            floreImageFile: null,
            existingFloreImage: unit.floreImage || '', // store existing URL
          })) || [],
        }));
        setPropertyGroups(groupsWithId);
      } else {
        setPropertyGroups([]);
      }

      // Load selected amenities
      const selected = new Set(property.amenities.map((a) => a.name));
      setSelectedAmenities(selected);

      // Load amenity icons (only custom uploaded icons, not defaults)
      const icons = new Map<string, string>();
      property.amenities.forEach((amenity) => {
        // Only store custom icons (not react-icon identifiers or default CDN icons)
        // Custom icons are from Cloudinary, react-icon: prefix means default icon
        if (amenity.icon && !amenity.icon.startsWith('react-icon:') && !amenity.icon.includes('cdn.jsdelivr.net')) {
          icons.set(amenity.name, amenity.icon);
        }
      });
      setAmenityIcons(icons);

      // Load existing images
      if (property.images && property.images.length > 0) {
        // First image is the cover image
        setExistingCoverImageUrl(property.images[0]);
        // Remaining images are additional images
        if (property.images.length > 1) {
          setExistingAdditionalImageUrls(property.images.slice(1));
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load property details."
      );
    } finally {
      setLoading(false);
    }
  }, [propertyId, token]);

  useEffect(() => {
    console.log('useEffect triggered, propertyId:', propertyId);
    if (propertyId) {
      console.log('Calling loadProperty with propertyId:', propertyId);
      loadProperty();
    } else {
      console.log('No propertyId, skipping load');
    }
  }, [loadProperty, propertyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert("You must be logged in to manage properties.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const formDataToSend = new FormData();


      if (ytVideos.length > 0) {
        const withoutId = ytVideos.map((video) =>
          video.link
        )
        formDataToSend.append('ytvideos', JSON.stringify(withoutId))
      }

      // Payment Plans (unchanged)
      if (paymentPlans.length > 0) {
        const withoutID = paymentPlans.map((p) => ({
          planName: p.planName,
          parts: p.parts.map((part: any) => ({
            partName: part.partName,
            percentage: part.percentage,
          })),
        }));
        formDataToSend.append("paymentplans", JSON.stringify(withoutID));
      }

      // ─── Property Groups with Unit Floor Images ───
      if (propertyGroups.length > 0) {
        const unitImageFiles: File[] = [];
        const unitImageIndexes: number[] = [];
        let unitIndex = 0;

        const groupsPayload = propertyGroups.map((group) => ({
          name: group.name,
          units: group.units.map((unit: any) => {
            // If this unit has a new file, collect it with its global index
            if (unit.floreImageFile) {
              unitImageFiles.push(unit.floreImageFile);
              unitImageIndexes.push(unitIndex);
            }
            unitIndex++;
            return {
              type: unit.type,
              area: unit.area,
              price: unit.price,
              floreImage: unit.floreImage || '', // existing URL or empty
            };
          }),
        }));

        formDataToSend.append("propertygroups", JSON.stringify(groupsPayload));

        // Append the actual image files and their index mapping
        unitImageFiles.forEach((file) => {
          formDataToSend.append("unitImages", file);
        });
        if (unitImageIndexes.length > 0) {
          formDataToSend.append("unitImageIndexes", JSON.stringify(unitImageIndexes));
        }
      }

      // ─── All other fields (unchanged) ─────────────────────────────
      formDataToSend.append("title", formData.title);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("type", formData.type);
      if (formData.propertyType) {
        formDataToSend.append("propertyType", formData.propertyType);
      }
      formDataToSend.append("description", formData.description);
      formDataToSend.append("location", formData.location);
      formDataToSend.append("area", formData.area);
      formDataToSend.append("bedrooms", formData.bedrooms);
      if (formData.bathrooms) {
        formDataToSend.append("bathrooms", formData.bathrooms);
      }
      const priceNumber = formData.price.toString().replace(/[^0-9]/g, '');
      formDataToSend.append("price", priceNumber || "0");
      if (formData.forSaleLabel) {
        formDataToSend.append("forSaleLabel", formData.forSaleLabel);
      }
      formDataToSend.append("mapUrl", formData.mapUrl);
      formDataToSend.append("timeAgo", formData.timeAgo);
      formDataToSend.append("seoTitle", formData.seoTitle);
      formDataToSend.append("seoDescription", formData.seoDescription);
      if (formData.canonicalUrl) formDataToSend.append("canonicalUrl", formData.canonicalUrl);
      if (formData.schemaMarkup) formDataToSend.append("schemaMarkup", formData.schemaMarkup);
      if (seoImageFile) formDataToSend.append("seoImage", seoImageFile);
      if (formData.dld) formDataToSend.append("dld", formData.dld);
      if (formData.handOver) formDataToSend.append("handOver", formData.handOver);
      if (formData.paymentInstalment) formDataToSend.append('paymentInstalment', formData.paymentInstalment);

      // Cover image
      if (coverImageFile) {
        formDataToSend.append("image", coverImageFile);
      } else if (existingCoverImageUrl && propertyId) {
        formDataToSend.append("existingCoverImage", existingCoverImageUrl);
      }

      // Additional images
      additionalImageFiles.forEach((file) => {
        formDataToSend.append("images", file);
      });
      if (propertyId && existingAdditionalImageUrls.length > 0) {
        formDataToSend.append("existingImages", JSON.stringify(existingAdditionalImageUrls));
      }

      // Amenities
      const amenitiesPayload: Array<{ name: string; icon: string }> = [];
      const amenityIconIndexes: number[] = [];
      Array.from(selectedAmenities).forEach((amenityName) => {
        const customIconUrl = amenityIcons.get(amenityName);
        const iconFile = amenityIconFiles.get(amenityName);
        const defaultIconUrl = getDefaultAmenityIconUrl(amenityName);
        const iconUrl = customIconUrl || defaultIconUrl;
        amenitiesPayload.push({ name: amenityName, icon: iconUrl });
        if (iconFile) {
          const currentIndex = amenitiesPayload.length - 1;
          formDataToSend.append("amenityIcons", iconFile);
          amenityIconIndexes.push(currentIndex);
        }
      });
      formDataToSend.append("amenities", JSON.stringify(amenitiesPayload));
      if (amenityIconIndexes.length > 0) {
        formDataToSend.append("amenityIconIndexes", JSON.stringify(amenityIconIndexes));
      }

      // Submit
      if (propertyId) {
        await updatePropertyWithFiles(token, propertyId, formDataToSend);
      } else {
        await createPropertyWithFiles(token, formDataToSend);
      }

      router.push("/properties/Residential/Apartment");
    } catch (err: any) {
      console.error('Error saving property:', err);
      let errorMessage = "Failed to save property.";
      if (err?.response?.data) {
        const apiError = err.response.data;
        if (apiError.message) errorMessage = apiError.message;
        else if (apiError.error) errorMessage = apiError.error;
        if (apiError.validationErrors) {
          const validationMessages = Object.values(apiError.validationErrors).join(', ');
          errorMessage += ` ${validationMessages}`;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleUnitFileChange = (groupId: number, unitId: number, file: File) => {
    setPropertyGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
            ...group,
            units: group.units.map((unit: any) =>
              unit.id === unitId
                ? {
                  ...unit,
                  floreImageFile: file,
                  floreImage: '', // clear URL; will be replaced on submit
                  existingFloreImage: '', // clear existing because we're replacing
                }
                : unit
            ),
          }
          : group
      )
    );
  };

  const handleUnitFileRemove = (groupId: number, unitId: number) => {
    setPropertyGroups((prev) =>
      prev.map((group) =>
        group.id === groupId
          ? {
            ...group,
            units: group.units.map((unit: any) =>
              unit.id === unitId
                ? {
                  ...unit,
                  floreImageFile: null,
                  // Keep existingFloreImage if it was there, else set floreImage to ''
                  floreImage: unit.existingFloreImage || '',
                }
                : unit
            ),
          }
          : group
      )
    );
  };

  const typeOptions =
    formData.category === "residential" ? residentialTypes : commercialTypes;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-ivory p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-charcoal sm:text-3xl">
            {propertyId ? "Edit Property" : "Add Property"}
          </h1>
          <button
            onClick={() => router.back()}
            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-300"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Property Title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter property title"
            required
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={(event) => {
                const category = event.target.value as "residential" | "commercial";
                setFormData((prev) => ({
                  ...prev,
                  category,
                  type: category === "residential" ? "apartment" : "retail",
                }));
              }}
              options={[
                { value: "residential", label: "Residential" },
                { value: "commercial", label: "Commercial" },
              ]}
            />
            <Select
              label="Type"
              name="type"
              value={formData.type}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  type: event.target.value as FormState["type"],
                }))
              }
              options={typeOptions}
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <FileUpload
                label="Upload Cover Image"
                onFileSelect={handleCoverImageSelect}
                allowedTypes={['image']}
                onValidationError={(error) => setError(error)}
              />
              <p className="text-xs text-gray-500 mt-2">
                This image will be used as the preview on property cards and listings.
              </p>
              {coverImageFile && coverImagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Cover image preview:</p>
                  <div className="relative w-full h-48 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                    {coverImageFile.type.startsWith('video/') ? (
                      <video
                        src={coverImagePreview}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={coverImagePreview}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute top-2 left-2 bg-charcoal text-white px-2 py-1 rounded text-xs font-semibold">
                      Cover Image
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImageFile(null);
                        setCoverImagePreview(null);
                        if (coverImagePreview.startsWith('blob:')) {
                          URL.revokeObjectURL(coverImagePreview);
                        }
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity"
                      aria-label="Remove cover image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              {existingCoverImageUrl && !coverImageFile && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Current cover image:</p>
                  <div className="relative w-full h-48 border border-gray-200 rounded-lg overflow-hidden">
                    {existingCoverImageUrl.includes('video') || existingCoverImageUrl.endsWith('.mp4') || existingCoverImageUrl.endsWith('.webm') || existingCoverImageUrl.endsWith('.mov') ? (
                      <video
                        src={existingCoverImageUrl}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={existingCoverImageUrl}
                        alt="Current cover"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setExistingCoverImageUrl(null)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        className="w-4 h-4"
                      >
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Upload a new file to replace this image</p>
                </div>
              )}
            </div>

            {/* Add youtube videos */}
            <div>
              <div className="relative flex items-center justify-between gap-2 border rounded-[10px] border-gray-200 p-4 mb-2">

                <p className="mb-2 block text-sm font-medium text-charcoal">Add Youtube Video</p>
                <button type="button" onClick={handleAddVideo} className="rounded-lg bg-charcoal px-6 py-2 font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">Add Video</button>
              </div>
              {/* Add video ui */}
              <div>
                {ytVideos.map((video) => (
                  <div key={video.id} className="border rounded-[10px] border-gray-200 p-4 mb-2">
                    <div className="flex items-end justify-between gap-4">
                      {/* video link */}
                      <Input

                        label="Video Link"
                        name="link"
                        type="text"
                        placeholder="Video Link"
                        value={video.link}
                        onChange={(e) =>
                          handleChangeVideo({ id: video.id, link: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveVideo(video.id)}
                        className="mt-2 rounded-lg bg-red-600 w-40 px-6 py-2 font-medium text-white transition-colors hover:opacity-90 "
                      >
                        Remove Video
                      </button>
                    </div>


                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Additional Images/Videos */}
          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              Additional Images (Max 10)
            </label>
            <input
              ref={additionalImagesInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleAdditionalImagesSelect}
              disabled={additionalImageFiles.length >= 10}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-charcoal file:text-white hover:file:bg-charcoal/90"
            />
            {additionalImageFiles.length >= 10 && (
              <p className="mt-2 text-sm text-orange-600">
                Maximum of 10 files reached. Remove some files to add more.
              </p>
            )}
            {/* Display existing additional images */}
            {existingAdditionalImageUrls.length > 0 && additionalImageFiles.length === 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  {existingAdditionalImageUrls.length} existing image(s)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingAdditionalImageUrls.map((url, index) => {
                    const isVideo = url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm');
                    return (
                      <div
                        key={`existing-${index}`}
                        className="relative group border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {isVideo ? (
                          <video
                            src={url}
                            className="w-full h-32 object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newUrls = existingAdditionalImageUrls.filter((_, i) => i !== index);
                            setExistingAdditionalImageUrls(newUrls);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="text-xs text-gray-600 p-2 truncate">
                          Existing {index + 1}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {additionalImageFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  {additionalImageFiles.length} new file(s) selected
                  {additionalImageFiles.length >= 10 && (
                    <span className="ml-2 text-orange-600">(Maximum reached)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500 mb-2">💡 Drag images to reorder them.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {additionalImageFiles.map((file, index) => {
                    const isVideo = file.type.startsWith('video/');
                    const previewUrl = URL.createObjectURL(file);
                    return (
                      <div
                        key={`${file.name}-${index}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, index);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDragOver(e);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          handleDragEnter(e, index);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDrop(e, index);
                        }}
                        onDragEnd={(e) => {
                          e.stopPropagation();
                          handleDragEnd();
                        }}
                        className={`relative group border-2 rounded-lg overflow-hidden cursor-move transition-all ${draggedIndex === index
                          ? 'border-[#002F45] opacity-50 scale-95'
                          : draggedIndex !== null
                            ? 'border-gray-200 hover:border-[#002F45]'
                            : 'border-gray-200 hover:border-[#002F45]/50'
                          }`}
                      >
                        {isVideo ? (
                          <video
                            src={previewUrl}
                            className="w-full h-32 object-cover pointer-events-none"
                            muted
                            draggable={false}
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt={file.name}
                            className="w-full h-32 object-cover pointer-events-none"
                            draggable={false}
                          />
                        )}
                        <div className="absolute top-1 left-1 bg-charcoal text-white px-2 py-0.5 rounded text-xs font-semibold">
                          {index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const newFiles = additionalImageFiles.filter((_, i) => i !== index);
                            setAdditionalImageFiles(newFiles);
                            URL.revokeObjectURL(previewUrl);
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                          className="absolute bottom-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          aria-label="Remove file"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="text-xs text-gray-600 p-2 truncate" title={file.name}>
                          {file.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Display both existing and new images together */}
            {existingAdditionalImageUrls.length > 0 && additionalImageFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-gray-700">
                  {existingAdditionalImageUrls.length} existing + {additionalImageFiles.length} new image(s)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {/* Existing images */}
                  {existingAdditionalImageUrls.map((url, index) => {
                    const isVideo = url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm');
                    return (
                      <div
                        key={`existing-${index}`}
                        className="relative group border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {isVideo ? (
                          <video
                            src={url}
                            className="w-full h-32 object-cover"
                            muted
                          />
                        ) : (
                          <img
                            src={url}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newUrls = existingAdditionalImageUrls.filter((_, i) => i !== index);
                            setExistingAdditionalImageUrls(newUrls);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove image"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="text-xs text-gray-600 p-2 truncate">
                          Existing {index + 1}
                        </p>
                      </div>
                    );
                  })}
                  {/* New files */}
                  {additionalImageFiles.map((file, index) => {
                    const isVideo = file.type.startsWith('video/');
                    const previewUrl = URL.createObjectURL(file);
                    const actualIndex = existingAdditionalImageUrls.length + index;
                    return (
                      <div
                        key={`${file.name}-${index}`}
                        draggable={true}
                        onDragStart={(e) => {
                          e.stopPropagation();
                          handleDragStart(e, actualIndex);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDragOver(e);
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          handleDragEnter(e, actualIndex);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDrop(e, actualIndex);
                        }}
                        onDragEnd={(e) => {
                          e.stopPropagation();
                          handleDragEnd();
                        }}
                        className={`relative group border-2 rounded-lg overflow-hidden cursor-move transition-all ${draggedIndex === actualIndex
                          ? 'border-[#002F45] opacity-50 scale-95'
                          : draggedIndex !== null
                            ? 'border-gray-200 hover:border-[#002F45]'
                            : 'border-gray-200 hover:border-[#002F45]/50'
                          }`}
                      >
                        {isVideo ? (
                          <video
                            src={previewUrl}
                            className="w-full h-32 object-cover pointer-events-none"
                            muted
                            draggable={false}
                          />
                        ) : (
                          <img
                            src={previewUrl}
                            alt={file.name}
                            className="w-full h-32 object-cover pointer-events-none"
                            draggable={false}
                          />
                        )}
                        <div className="absolute top-1 left-1 bg-charcoal text-white px-2 py-0.5 rounded text-xs font-semibold">
                          {actualIndex + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = additionalImageFiles.filter((_, i) => i !== index);
                            setAdditionalImageFiles(newFiles);
                            URL.revokeObjectURL(previewUrl);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove file"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="w-4 h-4"
                          >
                            <path d="M18 6L6 18M6 6l12 12" />
                          </svg>
                        </button>
                        <p className="text-xs text-gray-600 p-2 truncate" title={file.name}>
                          {file.name}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <RichTextEditor
            label="Description"
            value={formData.description}
            onChangeAction={handleDescriptionChange}
            placeholder="Enter property description..."
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location"
              required
            />
            <Input
              label="Starting Area (Sq ft)"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              placeholder="e.g., 1500 sq ft"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="Starting Number of Bedrooms"
              name="bedrooms"
              type="number"
              value={formData.bedrooms}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
            />

            <div>
              <Input
                label="Map URL"
                name="mapUrl"
                value={formData.mapUrl}
                onChange={handleInputChange}
                placeholder="Paste any Google Maps URL here"
                required
              />
            </div>
            {/* <Input
              label="Number of Bathrooms"
              name="bathrooms"
              type="number"
              value={formData.bathrooms}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
              required
            /> */}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div className="relative">
              <Input
                label="Starting Price"
                name="price"
                type="text"  // change from 'number' to 'text' to allow commas
                value={displayPrice}
                onChange={handlePriceInputChange}
                placeholder="950,000"
                required
              />
              <span className="absolute right-4 top-[38px] text-gray-500 font-medium">AED</span>
            </div>

            <Input
              label="Payment Instalment"
              name="paymentInstalment"
              type="text"
              value={formData.paymentInstalment}
              onChange={handleInputChange}
              placeholder="e.g. 30/50"
              min="0"
            />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="DLD"
              name="dld"
              type="text"
              value={formData.dld}
              onChange={handleInputChange}
              placeholder="e.g. 4% DLD"
              min="0"
            />
            <Input
              label="Hand Over"
              name="handOver"
              type="text"
              value={formData.handOver}
              onChange={handleInputChange}
              placeholder="e.g. Q4 2028"
              min="0"
            />
          </div>


          <div className="relative flex items-center justify-between gap-2 border rounded-[10px] border-gray-200 p-4 mb-2">

            <p className="mb-2 block text-sm font-medium text-charcoal">Add Payment Plans</p>
            <button type="button" onClick={handleAddPlan} className="rounded-lg bg-charcoal px-6 py-2 font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">Add Plan</button>

          </div>
          {/* Payment Plans ui */}
          <div>
            {paymentPlans.map((plan) => (
              <div key={plan.id} className="border rounded-[10px] border-gray-200 p-4 mb-2">
                <div className="flex items-end justify-between gap-4">
                  {/* Plan Name */}
                  <Input

                    label="Plan Name"
                    name="planName"
                    type="text"
                    placeholder="Plan Name"
                    value={plan.planName}
                    onChange={(e) =>
                      handlePlanNameChange(plan.id, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePlan(plan.id)}
                    className="mt-2 rounded-lg bg-red-600 w-60 px-6 py-2 font-medium text-white transition-colors hover:opacity-90 "
                  >
                    Remove Plan
                  </button>
                </div>

                {/* Parts */}
                {plan.parts.map((part: any) => (
                  <div key={part.id} className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-2">
                    <Input
                      type="text"
                      label="Instalments"
                      placeholder="e.g. Down Payment"
                      value={part.partName}
                      onChange={(e) =>
                        handlePartChange(
                          plan.id,
                          part.id,
                          "partName",
                          e.target.value
                        )
                      }
                    />

                    <Input

                      label="Value in % "
                      type="number"
                      placeholder="Percentage"
                      value={part.percentage}
                      onChange={(e) =>
                        handlePartChange(
                          plan.id,
                          part.id,
                          "percentage",
                          Number(e.target.value)
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        handleRemovePart(plan.id, part.id)
                      }
                      className="mt-1 md:mt-6 h-12 rounded-lg bg-red-600 w-60 px-6 py-2 font-medium text-white transition-colors hover:opacity-90"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {/* Add Part */}
                <button type="button" onClick={() => handleAddPart(plan.id)} className="mt-2 rounded-lg bg-charcoal px-6 py-2 font-medium text-white transition-colors hover:opacity-90 ">
                  Add Part
                </button>
              </div>
            ))}
          </div>

          {/* Property Groups Header */}
          <div className="relative border rounded-[10px] border-gray-200 p-4 mb-2 flex items-center justify-between gap-2">
            <p className="mb-2 block text-sm font-medium text-charcoal">
              Add Property Groups
            </p>

            <button
              type="button"
              onClick={handleAddPropertyGroup}
              className="rounded-lg bg-charcoal px-6 py-2 font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              Add Group
            </button>
          </div>

          {/* Property Groups UI */}
          <div>
            {propertyGroups.map((group) => (
              <div
                key={group.id}
                className="border rounded-[10px] border-gray-200 p-4 mb-2"
              >
                {/* Group Name */}
                <div className="flex items-end justify-between gap-4">
                  <Input
                    label="Group Name"
                    name="groupName"
                    type="text"
                    placeholder="e.g. Apartments"
                    value={group.name}
                    onChange={(e) =>
                      handleGroupNameChange(
                        group.id,
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleRemovePropertyGroup(group.id)
                    }
                    className="mt-2 rounded-lg bg-red-600 w-50 px-6 py-2 font-medium text-white transition-colors hover:opacity-90"
                  >
                    Remove Group
                  </button>
                </div>

                {/* Units */}
                {group.units.map((unit: any) => (
                  <div
                    key={unit.id}
                    className="grid grid-cols-1 gap-6 md:grid-cols-4 mt-2"
                  >
                    {/* <Input
                      type="text"
                      label="Type"
                      placeholder="e.g. Type A"
                      value={unit.type}
                      onChange={(e) =>
                        handleUnitChange(
                          group.id,
                          unit.id,
                          "type",
                          e.target.value
                        )
                      }
                    /> */}

                    <Input
                      type="text"
                      label="Starting Area (Sq ft)"
                      placeholder="e.g. 2,289"
                      value={unit.area}
                      onChange={(e) =>
                        handleUnitChange(
                          group.id,
                          unit.id,
                          "area",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      type="text"
                      label="Starting Price"
                      placeholder="e.g. 50,00,000"
                      value={formatPrice(unit.price)}   // display formatted
                      onChange={(e) =>
                        handleUnitChange(
                          group.id,
                          unit.id,
                          "price",
                          e.target.value  // raw digits extracted inside handleUnitChange
                        )
                      }
                    />

                    {/* Floor Image: file input + preview */}
                    <div>
                      <label className="mb-1 block text-xs font-medium text-charcoal">
                        Floor Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          if (file) {
                            const validation = validateFile(file, ['image']);
                            if (!validation.isValid) {
                              setError(validation.error || 'Invalid image file');
                              return;
                            }
                            // Update the unit: set floreImageFile, and clear any existing URL
                            handleUnitFileChange(group.id, unit.id, file);
                          }
                        }}
                        className="w-full rounded-lg border border-gray-300 px-2 py-1 text-xs text-gray-700 focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-charcoal file:text-white hover:file:bg-charcoal/90"
                      />
                      {/* Preview of current image */}
                      {(unit.floreImageFile || unit.existingFloreImage) && (
                        <div className="mt-1 relative w-full h-16 border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          {unit.floreImageFile ? (
                            <img
                              src={URL.createObjectURL(unit.floreImageFile)}
                              alt="New floor"
                              className="w-full h-full object-cover"
                            />
                          ) : unit.existingFloreImage ? (
                            <img
                              src={unit.existingFloreImage}
                              alt="Existing floor"
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                          <button
                            type="button"
                            onClick={() => {
                              // Remove the file or reset to existing
                              handleUnitFileRemove(group.id, unit.id);
                            }}
                            className="absolute top-0 right-0 p-0.5 bg-red-500 text-white rounded-full opacity-75 hover:opacity-100 transition-opacity"
                            aria-label="Remove image"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                              <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 mt-0.5">Upload floor plan image</p>
                    </div>


                    {/* <Input
                      type="text"
                      label="Floor Image"
                      placeholder="Image URL"
                      value={unit.floreImage}
                      onChange={(e) =>
                        handleUnitChange(
                          group.id,
                          unit.id,
                          "floreImage",
                          e.target.value
                        )
                      }
                    /> */}

                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveUnit(group.id, unit.id)
                      }
                      className="mt-1 md:mt-6 h-12 rounded-lg bg-red-600 w-30 px-6 py-2 font-medium text-white transition-colors hover:opacity-90"
                    >
                      Remove
                    </button>
                  </div>
                ))}


                {/* Add Unit */}
                <button
                  type="button"
                  onClick={() => handleAddUnit(group.id)}
                  className="mt-2 rounded-lg bg-charcoal px-6 py-2 font-medium text-white transition-colors hover:opacity-90"
                >
                  Add Unit
                </button>
              </div>
            ))}
          </div>


          <div>
            <label className="mb-4 block text-lg font-semibold text-charcoal">
              Amenities
            </label>

            {/* Search Bar (shown when expanded) */}
            {showAllAmenities && (
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search amenities..."
                  value={amenitySearchQuery}
                  onChange={(e) => setAmenitySearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20"
                />
              </div>
            )}

            {/* Amenities Grid */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {visibleAmenities.map((amenity) => {
                  const isSelected = selectedAmenities.has(amenity.name);
                  return (
                    <label
                      key={amenity.name}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleAmenity(amenity.name)}
                        className="w-4 h-4 text-charcoal border-gray-300 rounded focus:ring-[#002F45]"
                      />
                      <span className="text-sm text-gray-700">{amenity.name}</span>
                    </label>
                  );
                })}
              </div>

              {!showAllAmenities && remainingAmenitiesCount > 0 && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setShowAllAmenities(true)}
                    className="text-sm text-charcoal hover:underline font-medium"
                  >
                    See More ({remainingAmenitiesCount} more)
                  </button>
                </div>
              )}

              {showAllAmenities && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAllAmenities(false);
                      setAmenitySearchQuery("");
                    }}
                    className="text-sm text-charcoal hover:underline font-medium"
                  >
                    Show Less
                  </button>
                </div>
              )}
            </div>

            {/* Selected Amenities with Icon Upload */}
            {/* {selectedAmenities.size > 0 && (
              <div className="mt-4 space-y-3">
                <label className="block text-sm font-medium text-charcoal">
                  Upload Icons for Selected Amenities (Optional)
                </label>
                <div className="space-y-2">
                  {Array.from(selectedAmenities).map((amenityName) => {
                    const iconFile = amenityIconFiles.get(amenityName);
                    const iconUrl = amenityIcons.get(amenityName);
                    return (
                      <div
                        key={amenityName}
                        className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                      >
                        <span className="flex-1 text-sm font-medium text-gray-700">
                          {amenityName}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAmenity(amenityName)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-red-600 hover:bg-red-100 transition-colors flex-shrink-0"
                            aria-label={`Remove ${amenityName}`}
                            title="Remove"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-4 w-4"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                            </svg>
                          </button>
                          {iconUrl && !iconFile && (
                            <a
                              href={iconUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-charcoal underline"
                            >
                              View icon
                            </a>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] ?? null;
                              handleAmenityIconUpload(amenityName, file);
                            }}
                            className="text-xs text-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-charcoal file:text-white hover:file:bg-charcoal/90"
                          />
                          {iconFile && (
                            <span className="text-xs text-gray-600">
                              {iconFile.name}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )} */}
          </div>

          {/* Show message when no amenities match search */}
          {showAllAmenities && filteredAmenities.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
              <p className="text-center text-gray-500 py-4">
                No amenities found matching "{amenitySearchQuery}"
              </p>
            </div>
          )}

          <div className="space-y-4 rounded-xl border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-charcoal">SEO Settings</h3>
            <Input
              label="SEO Title"
              name="seoTitle"
              value={formData.seoTitle}
              onChange={handleInputChange}
              placeholder="Enter SEO title (50-60 characters)"
              maxLength={60}
            />
            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                SEO Description (max 300 characters)
              </label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription || ""}
                onChange={(e) => {
                  const value = e.target.value.slice(0, 300);

                  setFormData((prev) => ({
                    ...prev,
                    seoDescription: value,
                  }));
                }}
                placeholder="Enter SEO description (max 300 characters)"
                maxLength={300}
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20"
              />

              <p className="mt-1 text-xs text-gray-500">
                {(formData.seoDescription || "").length}/300 characters
              </p>

            </div>

            <Input
              label="Canonical URL"
              name="canonicalUrl"
              value={formData.canonicalUrl}
              onChange={handleInputChange}
              placeholder="https://yoursite.com/properties/property-slug"
            />

            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                JSON-LD Schema Markup
              </label>
              <textarea
                name="schemaMarkup"
                value={formData.schemaMarkup}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    schemaMarkup: e.target.value,
                  }))
                }
                placeholder='{"@context":"https://schema.org","@type":"Product",...}'
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 font-mono focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20 resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional. Paste valid JSON-LD for Product/RealEstateListing schema.
              </p>
            </div>

            <div>
              <FileUpload
                label="SEO Image (for Open Graph / Twitter cards)"
                onFileSelect={(file) => setSeoImageFile(file)}
                allowedTypes={["image"]}
                onValidationError={(error) => setError(error)}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional. Overrides cover image for social sharing previews.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg bg-gray-200 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || loading}
              className="rounded-lg bg-charcoal px-6 py-2 font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving..." : propertyId ? "Update Property" : "Add Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
