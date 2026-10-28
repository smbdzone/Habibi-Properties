import { Request, Response } from "express";
import Blog from "../models/blogModel.js";

export const getAllBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { page = 1, limit = 6 } = req.query;

    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Blog.countDocuments();

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalBlogs: total,
      },
      message: "Blogs retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getBlogBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    // Increment views
    await Blog.findOneAndUpdate({ slug }, { $inc: { views: 1 } });

    const blog = await Blog.findOne({ slug });

    if (!blog) {
      res.status(404).json({
        success: false,
        message: "Blog not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: blog,
      message: "Blog retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getFilteredBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { filter, page = 1, limit = 6 } = req.query;

    let query: any = {};
    let sort: any = {};

    switch (filter) {
      case "latestarticles":
        sort = { createdAt: -1 };
        break;
      case "mostviewed":
        sort = { views: -1 };
        query.views = { $gt: 1000 };
        break;
      case "justforyou":
        query.category = "Personal Growth";
        break;
      default:
        sort = { createdAt: -1 };
    }

    const blogs = await Blog.find(query)
      .sort(sort)
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      data: blogs,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalBlogs: total,
      },
      message: "Filtered blogs retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching filtered blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getFeaturedBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const blogs = await Blog.find({ featured: true }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: blogs,
      message: "Featured blogs retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching featured blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getRelatedBlogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const currentBlog = await Blog.findOne({ slug });
    if (!currentBlog) {
      res.status(404).json({
        success: false,
        message: "Blog not found",
      });
      return;
    }

    const relatedBlogs = await Blog.find({
      category: currentBlog.category,
      slug: { $ne: slug },
    })
      .limit(3)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: relatedBlogs,
      message: "Related blogs retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching related blogs:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const createBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const adminId = req.user as string;

    // Handle image upload - support both uploadSingle (req.file) and uploadBlog (req.files)
    const files = req.files as { image?: Express.Multer.File[]; seoImage?: Express.Multer.File[] } | undefined;
    const imageFile = files?.image?.[0] || req.file;
    const seoImageFile = files?.seoImage?.[0];

    let imageUrl = req.body.image;
    if (imageFile) {
      const { uploadToCloudinary } = await import("../config/cloudinary.js");
      imageUrl = await uploadToCloudinary(
        { buffer: imageFile.buffer, mimetype: imageFile.mimetype },
        "habibi-properties/blogs"
      );
    }

    let seoImageUrl = req.body.seoImage;
    if (seoImageFile) {
      const { uploadToCloudinary } = await import("../config/cloudinary.js");
      seoImageUrl = await uploadToCloudinary(
        { buffer: seoImageFile.buffer, mimetype: seoImageFile.mimetype },
        "habibi-properties/blogs"
      );
    }

    // Content is stored as-is (raw HTML from Jodit editor)
    // No need to JSON parse - just use the content directly
    const content = req.body.content;

    const blogData = {
      ...req.body,
      image: imageUrl,
      content: content,
      author: adminId,
      featured: req.body.featured === "true" || req.body.featured === true,
      canonicalUrl: req.body.canonicalUrl || undefined,
      schemaMarkup: req.body.schemaMarkup || undefined,
      seoImage: seoImageUrl || undefined,
    };

    // Check if slug already exists
    const existingBlog = await Blog.findOne({ slug: blogData.slug });
    if (existingBlog) {
      res.status(400).json({
        success: false,
        message: "Blog with this slug already exists",
      });
      return;
    }

    const blog = new Blog(blogData);
    await blog.save();

    // Create notification
    const { createNotification } = await import("./notificationController.js");
    await createNotification(
      "blog",
      `New blog post created: ${blog.title}`,
      String(blog._id)
    );

    res.status(201).json({
      success: true,
      data: blog,
      message: "Blog created successfully",
    });
  } catch (error: any) {
    console.error("Error creating blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const getBlogById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);

    if (!blog) {
      res.status(404).json({
        success: false,
        message: "Blog not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: blog,
      message: "Blog retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      res.status(404).json({
        success: false,
        message: "Blog not found",
      });
      return;
    }

    // Handle image uploads - support both uploadSingle (req.file) and uploadBlog (req.files)
    const files = req.files as { image?: Express.Multer.File[]; seoImage?: Express.Multer.File[] } | undefined;
    const imageFile = files?.image?.[0] || req.file;
    const seoImageFile = files?.seoImage?.[0];

    let imageUrl = req.body.image;
    if (imageFile) {
      const { uploadToCloudinary } = await import("../config/cloudinary.js");
      imageUrl = await uploadToCloudinary(
        { buffer: imageFile.buffer, mimetype: imageFile.mimetype },
        "habibi-properties/blogs"
      );
    }

    let seoImageUrl: string | undefined;
    if (seoImageFile) {
      const { uploadToCloudinary } = await import("../config/cloudinary.js");
      seoImageUrl = await uploadToCloudinary(
        { buffer: seoImageFile.buffer, mimetype: seoImageFile.mimetype },
        "habibi-properties/blogs"
      );
    }

    // Content is stored as-is (raw HTML from Jodit editor)
    const content = req.body.content;

    const updateData: any = {
      ...req.body,
      content: content || blog.content,
      featured: req.body.featured === "true" || req.body.featured === true,
      canonicalUrl: req.body.canonicalUrl !== undefined ? req.body.canonicalUrl : blog.canonicalUrl,
      schemaMarkup: req.body.schemaMarkup !== undefined ? req.body.schemaMarkup : blog.schemaMarkup,
    };

    if (imageUrl) {
      updateData.image = imageUrl;
    }
    if (seoImageUrl !== undefined) {
      updateData.seoImage = seoImageUrl;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(blogId, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: updatedBlog,
      message: "Blog updated successfully",
    });
  } catch (error: any) {
    console.error("Error updating blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const deleteBlog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      res.status(404).json({
        success: false,
        message: "Blog not found",
      });
      return;
    }

    await Blog.findByIdAndDelete(blogId);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting blog:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get SEO metadata for blog by slug
export const getBlogSEO = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug }).select(
      "image seoTitle seoDescription seoImage canonicalUrl schemaMarkup title excerpt"
    );

    if (!blog) {
      res.status(404).json({
        success: false,
        message: "Blog not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        image: blog.image,
        seoImage: blog.seoImage,
        title: blog.seoTitle || blog.title,
        description: blog.seoDescription || blog.excerpt || "",
        canonicalUrl: blog.canonicalUrl,
        schemaMarkup: blog.schemaMarkup,
      },
      message: "Blog SEO metadata retrieved successfully",
    });
  } catch (error: any) {
    console.error("Error fetching blog SEO:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
