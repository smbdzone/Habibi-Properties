"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchBlogs, deleteBlog, fetchBlogById, updateBlogWithFile } from "@/services/blogs";
import { Blog } from "@/types/api";
import { Input, FileUpload, RichTextEditor, Checkbox } from "@/components/ui";
import { useToast } from "@/hooks/useToast";
import { toast as sonnerToast } from "sonner";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const textColor = "#002F45";
const headerBg = "bg-ivory";
const cardClasses =
  "bg-white shadow-lg shadow-[#002F45]/5 rounded-2xl overflow-hidden border border-[#002F45]/5";
const actionIcon =
  "p-2 rounded-full hover:bg-[#002F45]/10 text-charcoal transition-colors";

export default function ManageBlogsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const toast = useToast();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<{ id: string; title: string } | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
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
  const [editSelectedImage, setEditSelectedImage] = useState<File | null>(null);
  const [editSelectedSeoImage, setEditSelectedSeoImage] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);
  const [fetchingBlog, setFetchingBlog] = useState(false);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);
  const [editFileValidationError, setEditFileValidationError] = useState<string | null>(null);

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBlogs();
      setBlogs(response.data ?? []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch blog records.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadBlogs();
  }, []);

  const handleView = useCallback(async (blog: Blog) => {
    if (!token) {
      toast.error("You must be logged in to view blog details");
      return;
    }
    try {
      const response = await fetchBlogById(token, blog._id);
      if (response.success && response.data) {
        setViewingBlog(response.data);
        setShowPreview(true);
      } else {
        // Fallback to using the blog data we already have
        setViewingBlog(blog);
        setShowPreview(true);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load blog details";
      toast.error(errorMessage);
      // Fallback to using the blog data we already have
      setViewingBlog(blog);
      setShowPreview(true);
    }
  }, [token, toast]);

  // Helper function to extract excerpt from HTML content
  const extractExcerpt = (html: string, maxLength: number = 150): string => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Helper function to get content as HTML string
  const contentToHtml = (content: any): string => {
    // Content is now stored as raw HTML string
    if (typeof content === 'string') return content;
    return '';
  };

  const handleEdit = useCallback(async (blogId: string) => {
    if (!token) {
      toast.error("You must be logged in to edit a blog.");
      return;
    }

    try {
      setFetchingBlog(true);
      setEditError(null);
      const response = await fetchBlogById(token, blogId);
      const blog = response.data;

      if (!blog) {
        setEditError("Blog not found");
        toast.error("Blog not found");
        return;
      }

      setEditingBlog(blog);
      setEditFormData({
        blogTitle: blog.title || "",
        category: blog.category || "",
        content: contentToHtml(blog.content),
        excerpt: blog.excerpt || "",
        seoTitle: blog.seoTitle || "",
        seoDescription: blog.seoDescription || "",
        canonicalUrl: blog.canonicalUrl || "",
        schemaMarkup: blog.schemaMarkup || "",
        featured: blog.featured || false,
      });
      setEditSelectedImage(null);
      setEditSelectedSeoImage(null);
      setEditFileValidationError(null);
      setShowEditModal(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch blog";
      setEditError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setFetchingBlog(false);
    }
  }, [token, toast]);

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditContentChange = (value: string) => {
    setEditFormData((prev) => ({
      ...prev,
      content: value,
      excerpt: prev.excerpt || extractExcerpt(value, 150),
    }));
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !editingBlog) {
      setEditError("You must be logged in to update a blog");
      return;
    }

    // Validation
    if (!editFormData.blogTitle.trim()) {
      setEditError("Blog title is required");
      return;
    }
    if (!editFormData.category.trim()) {
      setEditError("Category is required");
      return;
    }
    if (!editFormData.content.trim()) {
      setEditError("Content is required");
      return;
    }
    if (editFileValidationError) {
      setEditError(editFileValidationError);
      return;
    }
    if (!editFormData.excerpt.trim()) {
      setEditError("Excerpt is required");
      return;
    }

    try {
      setEditLoading(true);
      setEditError(null);
      setEditSuccess(null);

      // Show loading toast for upload if image is being updated
      const loadingMessage = editSelectedImage 
        ? "Uploading image to Cloudinary and updating blog..." 
        : "Updating blog...";
      const loadingToast = sonnerToast.loading(loadingMessage);

      // Generate slug from title
      const generateSlug = (text: string): string => {
        return text
          .toString()
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
          .replace(/\-\-+/g, '-')
          .replace(/^-+/, '')
          .replace(/-+$/, '');
      };

      const slug = generateSlug(editFormData.blogTitle);

      // Create FormData for file upload
      // Content is sent as raw HTML string from Jodit editor
      const formDataToSend = new FormData();
      formDataToSend.append('title', editFormData.blogTitle);
      formDataToSend.append('slug', slug);
      formDataToSend.append('date', editingBlog.date || new Date().toISOString().split('T')[0]);
      formDataToSend.append('category', editFormData.category);
      formDataToSend.append('excerpt', editFormData.excerpt);
      formDataToSend.append('featured', editFormData.featured.toString());
      formDataToSend.append('content', editFormData.content);
      if (editFormData.seoTitle) formDataToSend.append('seoTitle', editFormData.seoTitle);
      if (editFormData.seoDescription) formDataToSend.append('seoDescription', editFormData.seoDescription);
      if (editFormData.canonicalUrl) formDataToSend.append('canonicalUrl', editFormData.canonicalUrl);
      if (editFormData.schemaMarkup) formDataToSend.append('schemaMarkup', editFormData.schemaMarkup);
      if (editSelectedImage) {
        formDataToSend.append('image', editSelectedImage);
      } else {
        formDataToSend.append('image', editingBlog.image);
      }
      if (editSelectedSeoImage) formDataToSend.append('seoImage', editSelectedSeoImage);

      await updateBlogWithFile(token, editingBlog._id, formDataToSend);

      // Dismiss loading toast and show success
      sonnerToast.dismiss(loadingToast);
      const successMessage = editSelectedImage 
        ? "Blog updated successfully! Image uploaded to Cloudinary." 
        : "Blog updated successfully!";
      toast.success(successMessage);
      setEditSuccess("Blog updated successfully!");

      // Reload blogs and close modal after 1.5 seconds
      setTimeout(() => {
                setShowEditModal(false);
                setEditingBlog(null);
                setEditSelectedImage(null);
                setEditSelectedSeoImage(null);
                setEditFileValidationError(null);
        void loadBlogs();
      }, 1500);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update blog";
      setEditError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = useCallback((id: string, title: string) => {
    setBlogToDelete({ id, title });
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!token || !blogToDelete) return;

    try {
      setDeletingId(blogToDelete.id);
      await deleteBlog(token, blogToDelete.id);
      setBlogs(prev => prev.filter(b => b._id !== blogToDelete.id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(blogToDelete.id);
        return newSet;
      });
      setShowDeleteModal(false);
      setBlogToDelete(null);
      toast.success("Blog deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete blog";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setBlogToDelete(null);
  };

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(blogs.map(b => b._id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [blogs]);

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  }, [selectedIds]);

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedIds.size === 0) return;
    setShowBulkDeleteModal(true);
  }, [selectedIds.size]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (!token || selectedIds.size === 0) return;

    try {
      setDeletingSelected(true);
      const deletePromises = Array.from(selectedIds).map(id => deleteBlog(token, id));
      await Promise.all(deletePromises);
      setBlogs(prev => prev.filter(b => !selectedIds.has(b._id)));
      const count = selectedIds.size;
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      toast.success(`${count} ${count === 1 ? 'blog' : 'blogs'} deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete selected blogs";
      toast.error(errorMessage);
    } finally {
      setDeletingSelected(false);
    }
  }, [token, selectedIds, toast]);

  const handleBulkDeleteCancel = useCallback(() => {
    setShowBulkDeleteModal(false);
  }, []);

  const isAllSelected = blogs.length > 0 && selectedIds.size === blogs.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < blogs.length;

  const tableBody = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td
            colSpan={5}
            className="border-t border-orange/35 px-4 py-12 text-center"
          >
            <div className="flex flex-col items-center justify-center">
              <LoadingSpinner text="Loading blogs..." />
            </div>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td
            colSpan={5}
            className="border-t border-[#002F45]/10 px-4 py-4 text-center text-red-500"
          >
            {error}
          </td>
        </tr>
      );
    }

    if (blogs.length === 0) {
      return (
        <tr>
          <td
            colSpan={5}
            className="border-t border-[#002F45]/10 px-4 py-4 text-center text-gray-500"
          >
            No blogs have been created yet.
          </td>
        </tr>
      );
    }

    return blogs.map((blog) => (
      <tr
        key={blog._id}
        className="border-t border-[#002F45]/10 hover:bg-[#F8FCFD]"
      >
        <td className="px-3 py-2.5">
          <Checkbox
            checked={selectedIds.has(blog._id)}
            onChange={(e) => handleSelectOne(blog._id, e.target.checked)}
            containerClassName="justify-center"
          />
        </td>
        <td className="px-4 py-3">
          <p className="font-medium text-charcoal">{blog.title}</p>
        </td>
        <td className="px-4 py-3 capitalize">{blog.category}</td>
        <td className="px-4 py-3">
          {new Date(blog.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-1.5 flex-nowrap">
            <button
              onClick={() => handleView(blog)}
              className="p-1.5 rounded-full hover:bg-[#002F45]/10 text-charcoal transition-colors flex-shrink-0"
              aria-label="View"
              title="View Details"
            >
              <Image src="/icons/eye.svg" width={18} height={18} alt="view" />
            </button>
            <button
              onClick={() => handleEdit(blog._id)}
              className="p-1.5 rounded-full hover:bg-[#002F45]/10 text-charcoal transition-colors flex-shrink-0"
              aria-label="Edit"
              title="Edit Blog"
            >
              <Image src="/icons/edit.svg" width={18} height={18} alt="edit" />
            </button>
            <button
              onClick={() => handleDeleteClick(blog._id, blog.title)}
              disabled={deletingId === blog._id}
              className="p-1.5 rounded-full hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50 flex-shrink-0"
              aria-label="Delete"
              title="Delete"
            >
              <Image src="/icons/delete.svg" width={18} height={18} alt="delete" />
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [blogs, deletingId, error, loading, selectedIds, handleView, handleEdit, handleDeleteClick, handleSelectOne]);

  return (
    <>
      <div className="min-h-screen bg-ivory py-10 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-charcoal">Manage Blogs</h1>
            {selectedIds.size > 0 && (
              <button
                onClick={handleBulkDeleteClick}
                disabled={deletingSelected}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingSelected ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete Selected ({selectedIds.size})
                  </>
                )}
              </button>
            )}
          </div>

          <div className={cardClasses}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-[14px] text-[#01364C] table-fixed">
                <thead className={`${headerBg} text-left text-sm font-semibold`}>
                  <tr>
                    <th className="px-3 py-2.5 w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        containerClassName="justify-center"
                      />
                    </th>
                    <th className="px-3 py-2.5">Title</th>
                    <th className="px-3 py-2.5 w-[120px]">Category</th>
                    <th className="px-3 py-2.5 w-[130px]">Date Created</th>
                    <th className="px-3 py-2.5 w-[120px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>{tableBody}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Blog Modal */}
      {showEditModal && editingBlog && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={(e) => {
            // Don't close if clicking on Jodit editor popups/dialogs or any Jodit elements
            const target = e.target as HTMLElement;

            // Check if any Jodit dialogs are currently open in the DOM
            const joditDialogs = document.querySelectorAll('.jodit-dialog, .jodit-popup');
            if (joditDialogs.length > 0) {
              e.stopPropagation();
              return;
            }

            // Check if click is on Jodit elements (popups are rendered outside modal)
            if (
              target.closest('.jodit-dialog') ||
              target.closest('.jodit-popup') ||
              target.closest('.jodit-container') ||
              target.closest('.jodit') ||
              target.classList.contains('jodit-dialog') ||
              target.classList.contains('jodit-popup') ||
              target.classList.contains('jodit') ||
              // Check parent elements for Jodit classes
              target.parentElement?.classList.contains('jodit-dialog') ||
              target.parentElement?.classList.contains('jodit-popup')
            ) {
              e.stopPropagation();
              return;
            }

            // Only close if clicking directly on the backdrop (not on any child elements)
            if (target === e.currentTarget && !editLoading) {
                setShowEditModal(false);
                setEditingBlog(null);
                setEditSelectedImage(null);
                setEditSelectedSeoImage(null);
                setEditFileValidationError(null);
              setEditError(null);
              setEditSuccess(null);
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto my-8"
            onClick={(e) => {
              e.stopPropagation();
              // Also stop propagation for Jodit elements that might be inside
              const target = e.target as HTMLElement;
              if (
                target.closest('.jodit') ||
                target.closest('.jodit-dialog') ||
                target.closest('.jodit-popup') ||
                target.closest('.jodit-container')
              ) {
                e.stopPropagation();
              }
            }}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-charcoal">Edit Blog</h2>
              <button
                onClick={() => {
                  if (!editLoading) {
                setShowEditModal(false);
                setEditingBlog(null);
                setEditSelectedImage(null);
                setEditSelectedSeoImage(null);
                setEditFileValidationError(null);
                    setEditError(null);
                    setEditSuccess(null);
                  }
                }}
                disabled={editLoading}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="w-6 h-6"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {fetchingBlog ? (
                <div className="text-center py-8 text-gray-500">Loading blog data...</div>
              ) : (
                <form onSubmit={handleUpdateBlog} className="space-y-6">
                  {/* Blog Title and Category - Parallel Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Blog Title"
                      name="blogTitle"
                      value={editFormData.blogTitle}
                      onChange={handleEditInputChange}
                      placeholder="Blog Title"
                      required
                    />
                    <Input
                      label="Category"
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditInputChange}
                      placeholder="Category"
                      required
                    />
                  </div>

                  {/* Featured Image */}
                  <div>
                    <FileUpload
                      label="Featured Image"
                      onFileSelect={(file) => {
                        setEditSelectedImage(file);
                        setEditFileValidationError(null);
                        setEditError(null);
                        if (file) {
                          toast.success("Image selected successfully!");
                        }
                      }}
                      allowedTypes={['image']}
                      onValidationError={(error) => {
                        setEditFileValidationError(error);
                        setEditSelectedImage(null);
                        toast.error(error);
                      }}
                    />
                    {editFileValidationError && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {editFileValidationError}
                      </div>
                    )}
                    {!editSelectedImage && editingBlog.image && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 mb-2">Current image:</p>
                        <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                          <Image
                            src={editingBlog.image}
                            alt={editingBlog.title}
                            fill
                            className="object-cover"
                          />
                        </div>
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
                      value={editFormData.excerpt}
                      onChange={(e) =>
                        setEditFormData((prev) => ({
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
                      {editFormData.excerpt.length}/500 characters
                    </p>
                  </div>

                  {/* Featured Checkbox */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={editFormData.featured}
                      onChange={handleEditInputChange}
                      className="w-4 h-4 border-2 border-[#002F45] rounded-sm accent-[#002F45]"
                    />
                    <label className="text-sm font-medium text-charcoal">
                      Mark as Featured
                    </label>
                  </div>

                  {/* Content with Rich Text Editor */}
                  <RichTextEditor
                    label="Content"
                    value={editFormData.content}
                    onChangeAction={handleEditContentChange}
                    placeholder="Enter blog content..."
                  />

                  {/* SEO Fields */}
                  <div className="space-y-6 border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-semibold text-charcoal">SEO Settings</h2>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-charcoal">
                        SEO Title
                      </label>
                      <input
                        type="text"
                        name="seoTitle"
                        value={editFormData.seoTitle}
                        onChange={handleEditInputChange}
                        placeholder="Enter SEO title (recommended: 50-60 characters)"
                        maxLength={60}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        {editFormData.seoTitle.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-charcoal">
                        SEO Description
                      </label>
                      <textarea
                        name="seoDescription"
                        value={editFormData.seoDescription}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
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
                        {editFormData.seoDescription.length}/300 characters
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-charcoal">
                        Canonical URL
                      </label>
                      <input
                        type="url"
                        name="canonicalUrl"
                        value={editFormData.canonicalUrl}
                        onChange={handleEditInputChange}
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
                        value={editFormData.schemaMarkup}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            schemaMarkup: e.target.value,
                          }))
                        }
                        placeholder='{"@context":"https://schema.org","@type":"Article",...}'
                        rows={5}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 font-mono focus:border-[#002F45] focus:outline-none focus:ring-2 focus:ring-[#002F45]/20 resize-none"
                      />
                    </div>

                    <div>
                      <FileUpload
                        label="SEO Image (for Open Graph / Twitter cards)"
                        onFileSelect={(file) => {
                          setEditSelectedSeoImage(file);
                          setEditError(null);
                          if (file) toast.success("SEO image selected");
                        }}
                        allowedTypes={["image"]}
                        onValidationError={(error) => {
                          toast.error(error);
                          setEditSelectedSeoImage(null);
                        }}
                      />
                      {!editSelectedSeoImage && editingBlog.seoImage && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600 mb-2">Current SEO image:</p>
                          <div className="relative w-32 h-32 border rounded-lg overflow-hidden">
                            <Image
                              src={editingBlog.seoImage}
                              alt="SEO"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {editError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                      {editError}
                    </div>
                  )}

                  {/* Success Message */}
                  {editSuccess && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
                      {editSuccess}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                setShowEditModal(false);
                setEditingBlog(null);
                setEditSelectedImage(null);
                setEditSelectedSeoImage(null);
                setEditFileValidationError(null);
                        setEditError(null);
                        setEditSuccess(null);
                      }}
                      disabled={editLoading}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={editLoading}
                      className="px-8 py-2 bg-[#002F45] text-white rounded-lg hover:bg-black transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {editLoading ? "Updating..." : "Update Blog"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && blogToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deletingId) {
              handleDeleteCancel();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-charcoal">
                  Delete Blog
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the blog{" "}
                <span className="font-semibold text-charcoal">
                  "{blogToDelete.title}"
                </span>
                ? This will permanently remove the blog and all associated data.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deletingId === blogToDelete.id}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === blogToDelete.id}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId === blogToDelete.id ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete Blog"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !deletingSelected) {
              handleBulkDeleteCancel();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-charcoal">
                  Delete Selected Blogs
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold text-charcoal">{selectedIds.size}</span> {selectedIds.size === 1 ? 'blog' : 'blogs'}? This will permanently remove {selectedIds.size === 1 ? 'it' : 'them'} and all associated data.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleBulkDeleteCancel}
                disabled={deletingSelected}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDeleteConfirm}
                disabled={deletingSelected}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingSelected ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  `Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'Blog' : 'Blogs'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Blog Preview Modal */}
      {showPreview && viewingBlog && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-charcoal">Blog Details</h3>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setViewingBlog(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <span className="text-sm font-semibold text-charcoal">
                  #{viewingBlog.slug || viewingBlog._id.slice(-6)}
                </span>
                <span className="px-3 py-1 bg-[#F4FBFD] text-charcoal rounded-full text-sm">
                  {viewingBlog.category}
                </span>
                <span className="text-sm text-gray-600">
                  {new Date(viewingBlog.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-charcoal">
                {viewingBlog.title}
              </h3>
              <BlogSamplePreview blog={viewingBlog} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const BlogSamplePreview = ({ blog }: { blog: Blog }) => {
  // Content is now stored as raw HTML string
  const contentHtml = typeof blog.content === 'string' ? blog.content : '';

  return (
    <div className="space-y-8">
      <div className="rounded-2xl overflow-hidden border border-[#002F45]/10 bg-[#F4FBFD]">
        <div className="relative w-full h-[280px]">
          <Image
            src={blog.image}
            alt={blog.title}
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-x-6 bottom-6 text-white space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              Sample preview
            </p>
            <h4 className="text-2xl font-semibold">{blog.title}</h4>
            <p className="text-sm text-white/80">{blog.date}</p>
          </div>
        </div>
        <div className="p-6 space-y-4 bg-white/80 backdrop-blur">
          <p className="text-gray-600">{blog.excerpt}</p>
          {(blog.seoTitle || blog.seoDescription || blog.canonicalUrl || blog.seoImage) && (
            <div className="pt-3 border-t border-[#002F45]/10 space-y-1">
              <p className="text-xs font-semibold text-charcoal uppercase tracking-wide">SEO</p>
              {blog.seoTitle && <p className="text-sm text-gray-600"><span className="font-medium">Title:</span> {blog.seoTitle}</p>}
              {blog.seoDescription && <p className="text-sm text-gray-600"><span className="font-medium">Description:</span> {blog.seoDescription}</p>}
              {blog.canonicalUrl && <p className="text-sm text-gray-600 break-all"><span className="font-medium">Canonical:</span> {blog.canonicalUrl}</p>}
              {blog.seoImage && <p className="text-sm text-gray-600 break-all"><span className="font-medium">SEO Image:</span> {blog.seoImage}</p>}
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="px-3 py-1 rounded-full border border-[#002F45]/20 text-charcoal bg-white">
              {blog.category}
            </span>
            <span className="px-3 py-1 rounded-full border border-[#002F45]/20 text-charcoal/80 bg-white">
              {blog.author}
            </span>
            {typeof blog.views === "number" && (
              <span className="px-3 py-1 rounded-full border border-[#002F45]/20 text-charcoal/80 bg-white">
                {blog.views.toLocaleString()} views
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Blog Content - Render raw HTML */}
      <div
        className="prose max-w-none blog-content text-[#1E1E1E] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
};