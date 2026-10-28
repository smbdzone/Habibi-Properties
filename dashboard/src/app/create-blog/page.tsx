"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, FileUpload, RichTextEditor } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/lib/config";
import { useToast } from "@/hooks/useToast";
import { toast as sonnerToast } from "sonner";

// Helper function to generate slug from title
const generateSlug = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

// Helper function to extract excerpt from HTML content
const extractExcerpt = (html: string, maxLength: number = 150): string => {
  // Remove HTML tags and get plain text
  const text = html.replace(/<[^>]*>/g, "").trim();
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// Helper function to parse HTML content into blog content structure
const parseContent = (html: string) => {
  // Create a temporary div to parse HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Extract intro paragraphs (first few paragraphs) - preserve HTML including links
  const paragraphs = Array.from(tempDiv.querySelectorAll("p")).map(
    (p) => p.innerHTML || ""
  );
  const intro = paragraphs.slice(0, 2).filter((p) => p.trim().length > 0);

  // Extract sections (headings and their content)
  const sections: any[] = [];
  let currentSection: any = null;

  Array.from(tempDiv.childNodes).forEach((node) => {
    if (node.nodeType === 1) {
      // Element node
      const element = node as HTMLElement;
      const tagName = element.tagName?.toLowerCase();

      if (tagName === "h1" || tagName === "h2" || tagName === "h3") {
        // Save previous section if exists
        if (currentSection) {
          sections.push(currentSection);
        }
        // Start new section
        currentSection = {
          heading: element.textContent || "",
          paragraphs: [],
        };
      } else if (tagName === "p" && currentSection) {
        // Preserve HTML content including links
        const htmlContent = element.innerHTML || "";
        if (htmlContent.trim()) {
          currentSection.paragraphs.push(htmlContent);
        }
      } else if (tagName === "ul" && currentSection) {
        // Preserve HTML content in list items including links
        const listItems = Array.from(element.querySelectorAll("li")).map(
          (li) => li.innerHTML || ""
        );
        currentSection.list = listItems;
      }
    }
  });

  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // If no sections found, create a default one
  if (sections.length === 0 && paragraphs.length > 0) {
    sections.push({
      heading: "Content",
      paragraphs: paragraphs.slice(2), // Skip intro paragraphs
    });
  }

  return {
    intro: intro.length > 0 ? intro : [paragraphs[0] || ""],
    sections:
      sections.length > 0
        ? sections
        : [
            {
              heading: "Content",
              paragraphs: paragraphs.slice(1),
            },
          ],
  };
};

export default function CreateBlogPage() {
  const router = useRouter();
  const { token } = useAuth();
  const toast = useToast();
  const [formData, setFormData] = useState({
    blogTitle: "",
    category: "",
    content: "",
    excerpt: "",
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
    schemaMarkup: "",
    featured: false,
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selectedSeoImage, setSelectedSeoImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileValidationError, setFileValidationError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContentChange = (value: string) => {
    console.log({ value });

    setFormData((prev) => ({
      ...prev,
      content: value,
      // Auto-generate excerpt if empty
      // excerpt: prev.excerpt || extractExcerpt(value, 150),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("You must be logged in to create a blog");
      return;
    }

    // Validation
    if (!formData.blogTitle.trim()) {
      setError("Blog title is required");
      return;
    }
    if (!formData.category.trim()) {
      setError("Category is required");
      return;
    }
    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }
    if (!selectedImage) {
      setError("Featured image is required");
      return;
    }
    if (fileValidationError) {
      setError(fileValidationError);
      return;
    }
    if (!formData.excerpt.trim()) {
      setError("Excerpt is required");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Show loading toast for upload
      const loadingToast = sonnerToast.loading("Uploading image and creating blog...");

      // Generate slug from title
      const slug = generateSlug(formData.blogTitle);

      // Parse content into required structure
      // const parsedContent = parseContent(formData.content);
      console.log({ content: formData?.content });

      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.blogTitle);
      formDataToSend.append("slug", slug);
      formDataToSend.append("date", new Date().toISOString().split("T")[0]);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("featured", formData.featured.toString());
      formDataToSend.append("content", formData.content);
      if (formData.seoTitle)
        formDataToSend.append("seoTitle", formData.seoTitle);
      if (formData.seoDescription)
        formDataToSend.append("seoDescription", formData.seoDescription);
      if (formData.canonicalUrl)
        formDataToSend.append("canonicalUrl", formData.canonicalUrl);
      if (formData.schemaMarkup)
        formDataToSend.append("schemaMarkup", formData.schemaMarkup);
      formDataToSend.append("image", selectedImage);
      if (selectedSeoImage)
        formDataToSend.append("seoImage", selectedSeoImage);

      // For FormData, we need to use fetch directly instead of apiClient
      if (!API_BASE_URL) {
        setError("NEXT_PUBLIC_API_BASE_URL environment variable is not set");
        toast.error("NEXT_PUBLIC_API_BASE_URL environment variable is not set");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/blogs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create blog");
      }

      // Dismiss loading toast and show success
      sonnerToast.dismiss(loadingToast);
      toast.success("Blog created successfully! Image uploaded to Cloudinary.");
      setSuccess("Blog created successfully!");

      // Redirect to manage blogs page after 1.5 seconds
      setTimeout(() => {
        router.push("/manage-blogs");
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create blog";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-ivory rounded-lg shadow-sm p-6 sm:p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-charcoal mb-8">Create Blog</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Blog Title and Category - Parallel Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Blog Title"
              name="blogTitle"
              value={formData.blogTitle}
              onChange={handleInputChange}
              placeholder="Blog Title"
              required
            />
            <Input
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="Category"
              required
            />
          </div>

          {/* Featured Image */}
          <div>
            <FileUpload
              label="Featured Image"
              onFileSelect={(file) => {
                setSelectedImage(file);
                setFileValidationError(null);
                setError(null);
                if (file) {
                  toast.success("Image selected successfully!");
                }
              }}
              allowedTypes={['image']}
              onValidationError={(error) => {
                setFileValidationError(error);
                setSelectedImage(null);
                toast.error(error);
              }}
            />
            {fileValidationError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {fileValidationError}
              </div>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Allowed formats: JPEG, PNG, GIF, WebP, SVG, BMP, TIFF | Max size: 10MB
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-2 block text-sm font-medium text-charcoal">
              Excerpt <span className="text-red-500">*</span>
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  excerpt: e.target.value,
                }))
              }
              placeholder="Enter a brief excerpt (max 500 characters)"
              maxLength={500}
              rows={3}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20 resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.excerpt.length}/500 characters
            </p>
          </div>

          {/* Featured Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="w-4 h-4 border-2 border-[#002F45] rounded-sm accent-[#002F45]"
            />
            <label className="text-sm font-medium text-charcoal">
              Mark as Featured
            </label>
          </div>

          {/* Content with Rich Text Editor */}
          <RichTextEditor
            label="Content"
            value={formData.content}
            onChangeAction={handleContentChange}
            placeholder="Enter blog content..."
          />

          {/* SEO Fields */}
          <div className="space-y-6 border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold text-charcoal">
              SEO Settings
            </h2>

            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                SEO Title
              </label>
              <input
                type="text"
                name="seoTitle"
                value={formData.seoTitle}
                onChange={handleInputChange}
                placeholder="Enter SEO title (recommended: 50-60 characters)"
                maxLength={60}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.seoTitle.length}/60 characters
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                SEO Description
              </label>
              <textarea
                name="seoDescription"
                value={formData.seoDescription}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seoDescription: e.target.value,
                  }))
                }
                placeholder="Enter SEO description (max 300 characters)"
                maxLength={300}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20 resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.seoDescription.length}/300 characters
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-charcoal">
                Canonical URL
              </label>
              <input
                type="url"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleInputChange}
                placeholder="https://yoursite.com/blogs/your-post-slug"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20"
              />
            </div>

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
                placeholder='{"@context":"https://schema.org","@type":"Article",...}'
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 font-mono focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20 resize-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional. Paste valid JSON-LD for Article or BlogPosting schema.
              </p>
            </div>

            <div>
              <FileUpload
                label="SEO Image (for Open Graph / Twitter cards)"
                onFileSelect={(file) => {
                  setSelectedSeoImage(file);
                  if (file) toast.success("SEO image selected");
                }}
                allowedTypes={["image"]}
                onValidationError={(error) => {
                  toast.error(error);
                  setSelectedSeoImage(null);
                }}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional. Overrides featured image for social sharing previews.
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-start pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#002F45] text-white rounded-lg hover:bg-black transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Create Blog"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
