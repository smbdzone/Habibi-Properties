"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialStatus,
} from "@/services/testimonials";
import { Testimonial, TestimonialPayload } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/useToast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FileUpload } from "../ui";
import { validateFile } from "@/utils/fileValidation";

const PAGINATION_SIZE = 10;

const emptyForm: TestimonialPayload = {
    name: "",
    rating: 5,
    comment: "",
    position: "",
    company: "",
    video: "",
    featured: false,
    status: "active",
};

function Stars({ rating }: { rating: number }) {
    return (
        <span className="text-orange text-sm">
            {"★".repeat(rating)}
            <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
        </span>
    );
}

export default function TestimonialsPage() {
    const { token } = useAuth();
    const toast = useToast();
    const loadingRef = useRef(false);

    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // filters
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
    const [featuredFilter, setFeaturedFilter] = useState<"" | "true" | "false">("");
    const [pageNum, setPageNum] = useState(1);

    // selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [deletingSelected, setDeletingSelected] = useState(false);

    // form modal (create + edit share one modal)
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<TestimonialPayload>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    // view modal
    const [viewingTestimonial, setViewingTestimonial] = useState<Testimonial | null>(null);

    // delete modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [testimonialToDelete, setTestimonialToDelete] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const loadTestimonials = useCallback(async () => {
        if (!token || loadingRef.current) return;
        loadingRef.current = true;
        setLoading(true);
        setError(null);
        try {
            const response = await fetchTestimonials(token, {
                status: statusFilter || undefined,
                featured: featuredFilter ? featuredFilter === "true" : undefined,
            });
            setTestimonials(response.data ?? []);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to load testimonials.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, statusFilter, featuredFilter]);

    useEffect(() => {
        loadTestimonials();
    }, [loadTestimonials]);

    const filtered = useMemo(() => {
        if (!searchTerm.trim()) return testimonials;
        const term = searchTerm.toLowerCase();
        return testimonials.filter(
            (t) =>
                t.name.toLowerCase().includes(term) ||
                t.comment.toLowerCase().includes(term) ||
                (t.company ?? "").toLowerCase().includes(term)
        );
    }, [testimonials, searchTerm]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGINATION_SIZE));
    const paginated = useMemo(() => {
        const start = (pageNum - 1) * PAGINATION_SIZE;
        return filtered.slice(start, start + PAGINATION_SIZE);
    }, [filtered, pageNum]);

    useEffect(() => {
        setPageNum(1);
    }, [searchTerm, statusFilter, featuredFilter]);

    useEffect(() => {
        const maxPage = Math.max(1, Math.ceil(filtered.length / PAGINATION_SIZE));
        if (pageNum > maxPage) setPageNum(maxPage);
    }, [filtered.length, pageNum]);

    const summaryCards = useMemo(() => {
        const total = testimonials.length;
        const active = testimonials.filter((t) => t.status === "active").length;
        const featured = testimonials.filter((t) => t.featured).length;
        return [
            { label: "Total Testimonials", value: total },
            { label: "Active", value: active },
            { label: "Featured", value: featured, highlight: true },
        ];
    }, [testimonials]);

    // ---- form modal handlers ----
    const openCreateModal = () => {
        setEditingId(null);
        setFormData({ ...emptyForm });
        setVideoFile(null);
        setVideoPreview(null);
        setFormError(null);
        setShowFormModal(true);
    };

    const openEditModal = (t: Testimonial) => {
        setEditingId(t._id);

        setFormData({
            name: t.name,
            rating: t.rating,
            comment: t.comment,
            position: t.position ?? "",
            company: t.company ?? "",
            video: t.video ?? "",
            featured: t.featured,
            status: t.status,
        });

        setVideoFile(null);
        setVideoPreview(t.video as string);
        setFormError(null);
        setShowFormModal(true);
    };

    const closeFormModal = () => {
        if (saving) return;

        setShowFormModal(false);
        setEditingId(null);
        setFormData({ ...emptyForm });
        setVideoFile(null);
        setVideoPreview(null);
        setFormError(null);
    };

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData((prev) => ({ ...prev, [name]: checked }));
        } else if (name === "rating") {
            setFormData((prev) => ({ ...prev, rating: Number(value) }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("You must be logged in to manage testimonials.");
            return;
        }

        if (!formData.name.trim()) {
            setFormError("Name and comment are required.");
            return;
        }


        setSaving(true);
        setFormError(null);

        try {
            const submitForm = new FormData();

            submitForm.append("name", formData.name.trim());
            submitForm.append("rating", String(formData.rating));
            submitForm.append("comment", formData.comment.trim());
            submitForm.append("position", formData.position?.trim() || "");
            submitForm.append("company", formData.company?.trim() || "");
            submitForm.append("featured", String(!!formData.featured));
            submitForm.append("status", formData.status || "active");

            // Only send a new video when user selected one
            if (videoFile) {
                submitForm.append("video", videoFile, videoFile.name);
            }



            if (editingId) {
                await updateTestimonial(token, editingId, submitForm);
                toast.success("Testimonial updated successfully");
            } else {
                await createTestimonial(token, submitForm);
                toast.success("Testimonial created successfully");
            }

            setShowFormModal(false);
            setEditingId(null);
            setFormData(emptyForm);
            setVideoFile(null);
            setVideoPreview(null);

            await loadTestimonials();
        } catch (err) {
            setFormError(
                err instanceof Error
                    ? err.message
                    : "Failed to save testimonial."
            );
        } finally {
            setSaving(false);
        }
    };

    // ---- delete handlers ----
    const handleDeleteClick = useCallback((id: string, name: string) => {
        setTestimonialToDelete({ id, name });
        setShowDeleteModal(true);
    }, []);

    const handleDeleteCancel = useCallback(() => {
        setShowDeleteModal(false);
        setTestimonialToDelete(null);
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (!token || !testimonialToDelete) return;
        try {
            setDeletingId(testimonialToDelete.id);
            await deleteTestimonial(token, testimonialToDelete.id);
            await loadTestimonials();
            setShowDeleteModal(false);
            setTestimonialToDelete(null);
            toast.success("Testimonial deleted successfully");
        } catch (err) {
            toast.error(
                err instanceof Error ? err.message : "Failed to delete testimonial."
            );
        } finally {
            setDeletingId(null);
        }
    }, [token, testimonialToDelete, loadTestimonials, toast]);

    // ---- bulk delete ----
    const handleSelectAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                setSelectedIds(new Set(paginated.map((t) => t._id)));
            } else {
                setSelectedIds(new Set());
            }
        },
        [paginated]
    );

    const handleSelectOne = useCallback((id: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) next.add(id);
            else next.delete(id);
            return next;
        });
    }, []);

    const isAllSelected =
        paginated.length > 0 && paginated.every((t) => selectedIds.has(t._id));

    const handleBulkDeleteConfirm = useCallback(async () => {
        if (!token || selectedIds.size === 0) return;
        try {
            setDeletingSelected(true);
            await Promise.all(
                Array.from(selectedIds).map((id) => deleteTestimonial(token, id))
            );
            const count = selectedIds.size;
            setSelectedIds(new Set());
            setShowBulkDeleteModal(false);
            toast.success(
                `${count} ${count === 1 ? "testimonial" : "testimonials"} deleted successfully`
            );
            await loadTestimonials();
        } catch (err) {
            toast.error(
                err instanceof Error
                    ? err.message
                    : "Failed to delete selected testimonials."
            );
        } finally {
            setDeletingSelected(false);
        }
    }, [token, selectedIds, loadTestimonials, toast]);


    // ---- toggle status ----
    const handleToggleStatus = useCallback(
        async (id: string) => {
            if (!token) return;
            try {
                setTogglingId(id);
                const response = await toggleTestimonialStatus(token, id);
                setTestimonials((prev) =>
                    prev.map((t) => (t._id === id && response.data ? response.data : t))
                );
                toast.success(`Status updated to ${response.data?.status}`);
            } catch (err) {
                toast.error(
                    err instanceof Error ? err.message : "Failed to update status."
                );
            } finally {
                setTogglingId(null);
            }
        },
        [token, toast]
    );


    const handleVideoSelect = (file: File | null) => {
        if (!file) {
            setVideoFile(null);
            setVideoPreview(null);
            return;
        }

        const validation = validateFile(file, ["video"]);

        if (!validation.isValid) {
            setFormError(validation.error || "Invalid video file");
            return;
        }

        setVideoFile(file);
        setFormError(null);

        const videoUrl = URL.createObjectURL(file);
        setVideoPreview(videoUrl);
    };

    return (
        <div className="p-4 text-charcoal">
            <div className="max-w-[1300px] flex justify-between items-center mb-4">
                <h1 className="text-3xl font-semibold">Testimonials</h1>
                <button
                    onClick={openCreateModal}
                    className="bg-black font-medium text-white/90 cursor-pointer hover:bg-black rounded-lg px-4 py-2 flex justify-center items-center gap-2"
                >
                    <span className="text-2xl font-light leading-none">+</span> Add Testimonial
                </button>
            </div>

            {/* Filters */}
            <div className="max-w-[1300px] flex flex-wrap justify-between items-end bg-white shadow-sm px-3 py-3 my-3 rounded-lg gap-3">
                <input
                    placeholder="Search by name / comment / company"
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-lg min-w-[250px] flex-1 px-4 py-1.5 text-sm focus:outline-none"
                />
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-charcoal/90">Status</p>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                    >
                        <option value="">All statuses</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-semibold text-charcoal/90">Featured</p>
                    <select
                        value={featuredFilter}
                        onChange={(e) => setFeaturedFilter(e.target.value as any)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                    >
                        <option value="">All</option>
                        <option value="true">Featured</option>
                        <option value="false">Not featured</option>
                    </select>
                </div>
                <button
                    onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("");
                        setFeaturedFilter("");
                    }}
                    className="bg-gray-300 text-charcoal text-sm min-w-[90px] px-3 py-1.5 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors duration-200"
                >
                    Clear Filters
                </button>
            </div>

            {/* Summary cards */}
            <div className="flex gap-3 mb-4">
                {summaryCards.map((card, i) => (
                    <div
                        key={i}
                        className="bg-stone/25 text-charcoal flex flex-col gap-4 px-4 py-4 w-[200px] rounded-lg"
                    >
                        <p
                            className={`font-medium text-3xl ${card.highlight ? "text-orange" : "text-charcoal"
                                }`}
                        >
                            {card.value}
                        </p>
                        <p className="font-medium">{card.label}</p>
                    </div>
                ))}
            </div>

            {selectedIds.size > 0 && (
                <div className="mb-4 flex justify-end">
                    <button
                        onClick={() => setShowBulkDeleteModal(true)}
                        disabled={deletingSelected}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {deletingSelected
                            ? "Deleting..."
                            : `Delete Selected (${selectedIds.size})`}
                    </button>
                </div>
            )}

            {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-red-700">
                    {error}
                </div>
            ) : loading ? (
                <div className="rounded-2xl border border-[#BCD4CC] bg-white px-4 py-6 text-center text-[#002F45]">
                    <LoadingSpinner text="Loading testimonials..." />
                </div>
            ) : paginated.length === 0 ? (
                <div className="rounded-2xl border border-gray-200 bg-white px-4 py-10 text-center text-gray-500">
                    No testimonials found.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left text-gray-600">
                            <tr>
                                <th className="px-3 py-3">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                    />
                                </th>
                                <th className="px-3 py-3">Name</th>
                                <th className="px-3 py-3">Rating</th>
                                {/* <th className="px-3 py-3">Comment</th> */}
                                <th className="px-3 py-3">Company/Position</th>
                                {/* <th className="px-3 py-3">Featured</th> */}
                                <th className="px-3 py-3">Status</th>
                                {/* <th className="px-3 py-3">Date</th> */}
                                <th className="px-3 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginated.map((t) => (
                                <tr key={t._id} className="border-t border-gray-100 hover:bg-gray-50">
                                    <td className="px-3 py-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(t._id)}
                                            onChange={(e) => handleSelectOne(t._id, e.target.checked)}
                                        />
                                    </td>
                                    <td className="px-3 py-3 font-medium">{t.name}</td>
                                    <td className="px-3 py-3">
                                        <Stars rating={t.rating} />
                                    </td>
                                    {/* <td className="px-3 py-3 max-w-[280px] truncate text-gray-600">
                                        {t.comment}
                                    </td> */}
                                    <td className="px-3 py-3 text-gray-600">
                                        {[t.position, t.company].filter(Boolean).join(", ") || "—"}
                                    </td>
                                    {/* <td className="px-3 py-3">
                                        {t.featured ? (
                                            <span className="rounded-full bg-orange/10 px-2 py-0.5 text-xs font-medium text-orange">
                                                Featured
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs">—</span>
                                        )}
                                    </td> */}
                                    <td className="px-3 py-3">
                                        <button
                                            onClick={() => handleToggleStatus(t._id)}
                                            disabled={togglingId === t._id}
                                            className={`rounded-full px-2 py-0.5 text-xs font-medium disabled:opacity-50 ${t.status === "active"
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                                                }`}
                                            title="Click to toggle status"
                                        >
                                            {togglingId === t._id ? "..." : t.status}
                                        </button>
                                    </td>
                                    {/* <td className="px-3 py-3 text-gray-500">
                                        {new Date(t.createdAt).toLocaleDateString()}
                                    </td> */}
                                    <td className="px-3 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => setViewingTestimonial(t)}
                                                className="rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                                            >
                                                View
                                            </button>
                                            <button
                                                onClick={() => openEditModal(t)}
                                                className="rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(t._id, t.name)}
                                                disabled={deletingId === t._id}
                                                className="rounded-lg bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {deletingId === t._id ? "..." : "Delete"}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {totalPages > 1 && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4">
                    <p className="text-sm text-gray-600">
                        Showing {(pageNum - 1) * PAGINATION_SIZE + 1}–
                        {Math.min(pageNum * PAGINATION_SIZE, filtered.length)} of{" "}
                        {filtered.length} testimonials
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPageNum((p) => Math.max(1, p - 1))}
                            disabled={pageNum <= 1}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        <span className="flex items-center gap-1 flex-wrap">
                            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                                let page: number;
                                if (totalPages <= 10) page = i + 1;
                                else if (pageNum <= 5) page = i + 1;
                                else if (pageNum >= totalPages - 4) page = totalPages - 9 + i;
                                else page = pageNum - 5 + i;
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setPageNum(page)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium ${pageNum === page
                                            ? "bg-charcoal text-white"
                                            : "border border-gray-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </span>
                        <button
                            onClick={() => setPageNum((p) => Math.min(totalPages, p + 1))}
                            disabled={pageNum >= totalPages}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            {showFormModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !saving) closeFormModal();
                    }}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[#002F45]">
                                {editingId ? "Edit Testimonial" : "Add Testimonial"}
                            </h3>
                            <button
                                onClick={closeFormModal}
                                disabled={saving}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>

                        {formError && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {formError}
                            </div>
                        )}

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-charcoal">
                                    Name *
                                </label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    maxLength={100}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                                    placeholder="Client name"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-charcoal">
                                        Position
                                    </label>
                                    <input
                                        name="position"
                                        value={formData.position}
                                        onChange={handleFormChange}
                                        maxLength={100}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                                        placeholder="e.g. CEO"
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-charcoal">
                                        Company
                                    </label>
                                    <input
                                        name="company"
                                        value={formData.company}
                                        onChange={handleFormChange}
                                        maxLength={100}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                                        placeholder="e.g. Acme Inc."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-sm font-medium text-charcoal">
                                    Rating *
                                </label>
                                <select
                                    name="rating"
                                    value={formData.rating}
                                    onChange={handleFormChange}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20"
                                >
                                    {[5, 4, 3, 2, 1].map((r) => (
                                        <option key={r} value={r}>
                                            {r} star{r > 1 ? "s" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* <div>
                                <label className="mb-1 block text-sm font-medium text-charcoal">
                                    Comment * (10–500 characters)
                                </label>
                                <textarea
                                    name="comment"
                                    value={formData.comment}
                                    onChange={handleFormChange}
                                    minLength={10}
                                    maxLength={500}
                                    rows={4}
                                    required
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-charcoal/20 resize-none"
                                    placeholder="What did the client say?"
                                />
                                <p className="mt-1 text-right text-xs text-gray-400">
                                    {formData.comment.length}/500
                                </p>
                            </div> */}

                            <div>


                                <FileUpload
                                    label="Upload Video"
                                    onFileSelect={handleVideoSelect}
                                    allowedTypes={['video']}
                                    onValidationError={(error) => setError(error)}
                                />
                            </div>

                            <div className="flex items-center gap-6">
                                {/* <label className="flex items-center gap-2 text-sm text-charcoal">
                                    <input
                                        type="checkbox"
                                        name="featured"
                                        checked={!!formData.featured}
                                        onChange={handleFormChange}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    Featured
                                </label> */}
                                <div className="flex items-center gap-2">
                                    <label className="text-sm font-medium text-charcoal">
                                        Status
                                    </label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    disabled={saving}
                                    className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-70"
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingId
                                            ? "Update Testimonial"
                                            : "Add Testimonial"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewingTestimonial && (
                <div
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setViewingTestimonial(null);
                    }}
                >
                    <div
                        className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-white/20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200/50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md">
                            <h3 className="text-xl font-semibold text-[#002F45]">
                                Testimonial Overview
                            </h3>
                            <button
                                onClick={() => setViewingTestimonial(null)}
                                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-lg font-semibold text-gray-900">
                                    {viewingTestimonial.name}
                                </p>
                                <Stars rating={viewingTestimonial.rating} />
                            </div>
                            {(viewingTestimonial.position || viewingTestimonial.company) && (
                                <p className="text-sm text-gray-500">
                                    {[viewingTestimonial.position, viewingTestimonial.company]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>
                            )}
                            {/* <p className="text-base text-gray-800 leading-relaxed">
                                "{viewingTestimonial.comment}"
                            </p> */}
                            {viewingTestimonial.video && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Video
                                    </label>
                                    <p className="text-sm">
                                        <a
                                            href={viewingTestimonial.video}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-charcoal underline"
                                        >
                                            {viewingTestimonial.video}
                                        </a>
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                {/* <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Featured
                                    </label>
                                    <p className="text-base text-gray-900">
                                        {viewingTestimonial.featured ? "Yes" : "No"}
                                    </p>
                                </div> */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Status
                                    </label>
                                    <p className="text-base text-gray-900 capitalize">
                                        {viewingTestimonial.status}
                                    </p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Created
                                    </label>
                                    <p className="text-base text-gray-900">
                                        {new Date(viewingTestimonial.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">
                                        Last Updated
                                    </label>
                                    <p className="text-base text-gray-900">
                                        {new Date(viewingTestimonial.updatedAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        const t = viewingTestimonial;
                                        setViewingTestimonial(null);
                                        openEditModal(t);
                                    }}
                                    className="rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && testimonialToDelete && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && !deletingId) handleDeleteCancel();
                    }}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-[#002F45]">
                                Delete Testimonial
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                This action cannot be undone
                            </p>
                        </div>
                        <p className="mb-6 text-gray-700">
                            Are you sure you want to delete the testimonial from{" "}
                            <span className="font-semibold text-[#002F45]">
                                "{testimonialToDelete.name}"
                            </span>
                            ?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={deletingId === testimonialToDelete.id}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deletingId === testimonialToDelete.id}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {deletingId === testimonialToDelete.id
                                    ? "Deleting..."
                                    : "Delete Testimonial"}
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
                        if (e.target === e.currentTarget && !deletingSelected)
                            setShowBulkDeleteModal(false);
                    }}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-[#002F45]">
                                Delete Selected Testimonials
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                This action cannot be undone
                            </p>
                        </div>
                        <p className="mb-6 text-gray-700">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-[#002F45]">
                                {selectedIds.size}
                            </span>{" "}
                            {selectedIds.size === 1 ? "testimonial" : "testimonials"}?
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowBulkDeleteModal(false)}
                                disabled={deletingSelected}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkDeleteConfirm}
                                disabled={deletingSelected}
                                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                            >
                                {deletingSelected
                                    ? "Deleting..."
                                    : `Delete ${selectedIds.size} ${selectedIds.size === 1 ? "Testimonial" : "Testimonials"
                                    }`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
