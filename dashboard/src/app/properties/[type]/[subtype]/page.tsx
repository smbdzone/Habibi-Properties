"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import ResidentialTable from "@/components/properties/ResidentialTable";
import CommercialTable from "@/components/properties/CommercialTable";
import Dropdown from "@/components/properties/Dropdown";
import {
  fetchProperties,
  deleteProperty,
  fetchPropertyById,
} from "@/services/properties";
import { Property } from "@/types/api";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import { AmenityIcon } from "@/components/AmenityIcon";
import { useToast } from "@/hooks/useToast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatPrice } from "@/utils/priceFormat";

const subtypes: Record<"Residential" | "Commercial", string[]> = {
  Residential: ["Apartment", "Villa", "Townhouse"],
  Commercial: ["Retail", "Office"],
};

const DEFAULT_CARD_COPY = [
  { label: "Total Listings" },
  { label: "Available" },
  { label: "Recently Updated", highlight: true },
];

const PAGINATION_SIZE = 10;

interface TableRow {
  id: string;
  title: string;
  type: string;
  bedrooms: number;
  area: string;
  price: string;
  location: string;
  dateAdded: string;
  slug?: string;
}

export default function PropertyPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const toast = useToast();
  const [selectedType, setSelectedType] = useState<
    "Residential" | "Commercial" | ""
  >("");
  const [selectedSubType, setSelectedSubType] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const loadingRef = useRef(false);

  const [type, subtype] = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    const t = segments[1] as "Residential" | "Commercial";
    const s = segments[2] || "Apartment";
    return [
      t === "Residential" || t === "Commercial" ? t : "Residential",
      s,
    ] as const;
  }, [pathname]);

  // Sync search term from URL (e.g. from navbar search)
  useEffect(() => {
    const searchFromUrl = searchParams.get("search");
    if (searchFromUrl !== null) {
      setSearchTerm(searchFromUrl);
    }
  }, [searchParams]);

  // Sync dropdowns with URL on load - only update if they actually changed
  useEffect(() => {
    if (selectedType !== type) {
      setSelectedType(type);
    }
  }, [type]); // Only depend on type

  useEffect(() => {
    if (selectedSubType !== subtype) {
      setSelectedSubType(subtype);
    }
  }, [subtype]); // Only depend on subtype

  // Ensure valid URL
  useEffect(() => {
    if (!["Residential", "Commercial"].includes(type)) {
      router.replace("/properties/Residential/Apartment");
    } else if (!subtypes[type].includes(subtype)) {
      router.replace(`/properties/${type}/${subtypes[type][0]}`);
    }
  }, [type, subtype, router]);

  // Handle tab clicks
  const handleTypeClick = (newType: "Residential" | "Commercial") => {
    setSelectedType(newType);
    setSelectedSubType(subtypes[newType][0]);
    router.push(`/properties/${newType}/${subtypes[newType][0]}`);
  };

  const handleSubtypeClick = (newSubtype: string) => {
    setSelectedSubType(newSubtype);
    router.push(`/properties/${type}/${newSubtype}`);
  };

  // Handle Apply Filters
  const handleApplyFilters = () => {
    const finalType = selectedType || type;
    const finalSubType = selectedSubType || subtypes[finalType][0];
    router.push(`/properties/${finalType}/${finalSubType}`);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedType("Residential");
    setSelectedSubType("Apartment");
    setSelectedCity("");
    router.push("/properties/Residential/Apartment");
  };

  const effectiveType = selectedType || type;
  const normalizedCategory = useMemo(
    () => (effectiveType === "Residential" ? "residential" : "commercial"),
    [effectiveType]
  );
  const activeSubtype = useMemo(
    () => selectedSubType || subtype,
    [selectedSubType, subtype]
  );

  const loadProperties = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchProperties({
        category: normalizedCategory,
        subtype: activeSubtype.toLowerCase(),
        location: selectedCity || undefined,
      });
      setProperties(response.data ?? []);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load properties.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedCategory, activeSubtype, selectedCity]); // Remove toast from dependencies

  useEffect(() => {
    if (token) {
      loadProperties();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, subtype, selectedCity, token]); // Only depend on actual URL params and filters

  const tableData = useMemo((): TableRow[] => {
    let filtered = properties;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p._id.toLowerCase().includes(term)
      );
    }

    return filtered.map((p): TableRow => ({
      id: p._id,
      title: p.title,
      type: p.type,
      bedrooms: p.bedrooms,
      area: p.area,
      price: formatPrice(p.price),
      location: p.location,
      dateAdded: new Date(p.createdAt).toLocaleDateString(),
      slug: (p as { slug?: string }).slug,
    }));
  }, [properties, searchTerm]);

  // Pagination: show 10 per page
  const totalPages = Math.max(1, Math.ceil(tableData.length / PAGINATION_SIZE));
  const paginatedTableData = useMemo(() => {
    const start = (pageNum - 1) * PAGINATION_SIZE;
    return tableData.slice(start, start + PAGINATION_SIZE);
  }, [tableData, pageNum]);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setPageNum(1);
  }, [searchTerm, selectedCity, normalizedCategory, activeSubtype]);

  // Reset to page 1 if current page is empty (e.g. after deletions)
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(tableData.length / PAGINATION_SIZE));
    if (pageNum > maxPage) setPageNum(maxPage);
  }, [tableData.length, pageNum]);

  const summaryCards = useMemo(
    () =>
      DEFAULT_CARD_COPY.map((card, index) => ({
        ...card,
        value:
          index === 0
            ? properties.length
            : Math.max(
              0,
              Math.round(properties.length * (index === 1 ? 0.8 : 0.3))
            ),
      })),
    [properties.length]
  );

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/add-property?id=${id}`);
    },
    [router]
  );

  const handleDeleteClick = useCallback((id: string, title: string) => {
    setPropertyToDelete({ id, title });
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!token || !propertyToDelete) {
      return;
    }

    try {
      setDeletingId(propertyToDelete.id);
      await deleteProperty(token, propertyToDelete.id);
      // Reload properties after deletion
      await loadProperties();
      setShowDeleteModal(false);
      setPropertyToDelete(null);
      toast.success("Property deleted successfully");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete property. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  }, [token, propertyToDelete, loadProperties, toast]);

  const handleDeleteCancel = useCallback(() => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  }, []);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(paginatedTableData.map((p) => p.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [paginatedTableData]
  );

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(id);
      } else {
        newSelected.delete(id);
      }
      return newSelected;
    });
  }, []);

  const handleBulkDeleteClick = useCallback(() => {
    if (selectedIds.size === 0) return;
    setShowBulkDeleteModal(true);
  }, [selectedIds.size]);

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (!token || selectedIds.size === 0) return;

    try {
      setDeletingSelected(true);
      const deletePromises = Array.from(selectedIds).map((id) =>
        deleteProperty(token, id)
      );
      await Promise.all(deletePromises);
      setProperties((prev) => prev.filter((p) => !selectedIds.has(p._id)));
      const count = selectedIds.size;
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      toast.success(
        `${count} ${count === 1 ? "property" : "properties"
        } deleted successfully`
      );
      await loadProperties();
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete selected properties";
      toast.error(errorMessage);
    } finally {
      setDeletingSelected(false);
    }
  }, [token, selectedIds, toast, loadProperties]);

  const handleBulkDeleteCancel = useCallback(() => {
    setShowBulkDeleteModal(false);
  }, []);

  const isAllSelected =
    paginatedTableData.length > 0 &&
    paginatedTableData.every((p) => selectedIds.has(p.id));

  const handleView = useCallback(
    async (id: string) => {
      try {
        setLoadingProperty(true);
        const response = await fetchPropertyById(id);
        if (response.success && response.data) {
          setViewingProperty(response.data);
        } else {
          toast.error("Failed to load property details");
        }
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load property details"
        );
      } finally {
        setLoadingProperty(false);
      }
    },
    [toast]
  );

  return (
    <div className="p-4 text-charcoal">
      <h1 className="text-3xl font-semibold mb-6">{type}</h1>
      {/* Type tabs */}
      <div className="max-w-[1300px] flex justify-between items-center mb-4">
        <div className="flex gap-3">
          {["Residential", "Commercial"].map((t) => (
            <button
              key={t}
              className={`px-6 py-1.5 rounded-lg font-medium cursor-pointer ${type === t
                  ? "bg-charcoal text-white"
                  : "border border-gray-300 text-gray-700 hover:bg-charcoal hover:text-white/90 transition-all duration-300"
                }`}
              onClick={() => handleTypeClick(t as "Residential" | "Commercial")}
            >
              {t}
            </button>
          ))}
        </div>
        <Link
          href="/add-property"
          className="bg-black font-medium text-white/90 cursor-pointer hover:bg-black rounded-lg px-4 flex justify-center items-center gap-2"
        >
          <span className="text-3xl font-light">+</span> Add Property
        </Link>
      </div>
      {/* Filters */}
      <div className="max-w-[1300px] flex flex-wrap justify-between items-end bg-white shadow-sm px-3 py-3 my-3 rounded-lg gap-1">
        <input
          placeholder="Search by Title / Project / ID"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-lg min-w-[250px] flex-1 px-4 py-1.5 text-sm focus:outline-none"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-charcoal/90">Type</p>
          <Dropdown
            label="All types"
            options={["Residential", "Commercial"]}
            selected={selectedType}
            onSelect={(val) => {
              setSelectedType(val as "Residential" | "Commercial");
              setSelectedSubType(""); // reset subtype when type changes
            }}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-charcoal/90">Sub Type</p>
          <Dropdown
            label="All sub types"
            options={selectedType ? subtypes[selectedType] : []}
            selected={selectedSubType}
            onSelect={setSelectedSubType}
          />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-charcoal/90">Location</p>
          <Dropdown
            label="All Locations"
            options={["Dubai", "Abu Dhabi", "Sharjah"]}
            selected={selectedCity}
            onSelect={setSelectedCity}
          />
        </div>
        <button
          className="bg-charcoal text-white/90 text-sm min-w-[90px] px-3 py-1.5 rounded-lg hover:bg-charcoal/90 cursor-pointer transition-colors duration-200"
          onClick={handleApplyFilters}
        >
          Apply Range
        </button>
        <button
          onClick={handleClearFilters}
          className="bg-gray-300 text-charcoal text-sm min-w-[90px] px-3 py-1.5 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors duration-200"
        >
          Clear Range
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
      {/* Subtype tabs */}
      <div className="flex gap-2 mb-6">
        {subtypes[type].map((sub) => (
          <button
            key={sub}
            className={`px-3 py-1 rounded-lg font-medium cursor-pointer ${subtype === sub
                ? "bg-charcoal text-white/90"
                : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-charcoal hover:text-white/90 transition-all duration-300"
              }`}
            onClick={() => handleSubtypeClick(sub)}
          >
            {sub}s
          </button>
        ))}
      </div>
      {/* Show table dynamically */}
      {selectedIds.size > 0 && (
        <div className="mb-4 flex justify-end">
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
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete Selected ({selectedIds.size})
              </>
            )}
          </button>
        </div>
      )}
      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-red-700">
          {error}
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-[#BCD4CC] bg-white px-4 py-6 text-center text-[#002F45]">
          <LoadingSpinner text="Loading properties..." />
        </div>
      ) : type === "Residential" ? (
        <>
          <ResidentialTable
            data={paginatedTableData}
            onEdit={handleEdit}
            onDelete={(id) => {
              const property = paginatedTableData.find((p) => p.id === id);
              handleDeleteClick(id, property?.title || "this property");
            }}
            onView={handleView}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            isAllSelected={isAllSelected}
          />
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">
                Showing {(pageNum - 1) * PAGINATION_SIZE + 1}–
                {Math.min(pageNum * PAGINATION_SIZE, tableData.length)} of{" "}
                {tableData.length} properties
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
                    if (totalPages <= 10) {
                      page = i + 1;
                    } else if (pageNum <= 5) {
                      page = i + 1;
                    } else if (pageNum >= totalPages - 4) {
                      page = totalPages - 9 + i;
                    } else {
                      page = pageNum - 5 + i;
                    }
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
        </>
      ) : (
        <>
          <CommercialTable
            data={paginatedTableData}
            onEdit={handleEdit}
            onDelete={(id) => {
              const property = paginatedTableData.find((p) => p.id === id);
              handleDeleteClick(id, property?.title || "this property");
            }}
            onView={handleView}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            isAllSelected={isAllSelected}
          />
          {totalPages > 1 && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-4">
              <p className="text-sm text-gray-600">
                Showing {(pageNum - 1) * PAGINATION_SIZE + 1}–
                {Math.min(pageNum * PAGINATION_SIZE, tableData.length)} of{" "}
                {tableData.length} properties
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
                    if (totalPages <= 10) {
                      page = i + 1;
                    } else if (pageNum <= 5) {
                      page = i + 1;
                    } else if (pageNum >= totalPages - 4) {
                      page = totalPages - 9 + i;
                    } else {
                      page = pageNum - 5 + i;
                    }
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
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && propertyToDelete && (
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
                <h3 className="text-lg font-semibold text-[#002F45]">
                  Delete Property
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#002F45]">
                  "{propertyToDelete.title}"
                </span>
                ? This will permanently remove the property and all associated
                data.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deletingId === propertyToDelete.id}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === propertyToDelete.id}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId === propertyToDelete.id ? (
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
                  "Delete Property"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Property Modal */}
      {viewingProperty && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all"
          onClick={(e) => {
            // Only close if clicking directly on the backdrop
            if (e.target === e.currentTarget) {
              setViewingProperty(null);
            }
          }}
        >
          <div
            className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8 border border-white/20 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200/50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <h3 className="text-xl font-semibold text-[#002F45]">
                Property Overview
              </h3>
              <button
                onClick={() => setViewingProperty(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              {loadingProperty ? (
                <div className="text-center py-8">
                  <LoadingSpinner text="Loading property details..." />
                </div>
              ) : (
                <>
                  {/* Property Image */}
                  {viewingProperty.images &&
                    viewingProperty.images.length > 0 && (
                      <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
                        <img
                          src={viewingProperty.images[0]}
                          alt={viewingProperty.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        ID
                      </label>
                      <p className="text-base text-gray-900 font-semibold">
                        #{viewingProperty._id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Title
                      </label>
                      <p className="text-base text-gray-900 font-semibold">
                        {viewingProperty.title}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Price
                      </label>
                      <p className="text-base text-gray-900 font-semibold">
                        {formatPrice(viewingProperty.price)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Location
                      </label>
                      <p className="text-base text-gray-900">
                        {viewingProperty.location}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Category
                      </label>
                      <p className="text-base text-gray-900 capitalize">
                        {viewingProperty.category}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Type
                      </label>
                      <p className="text-base text-gray-900 capitalize">
                        {viewingProperty.type}
                      </p>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Srarting Area (Sq ft)
                      </label>
                      <p className="text-base text-gray-900">
                        {viewingProperty.area}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Bedrooms
                      </label>
                      <p className="text-base text-gray-900">
                        {viewingProperty.bedrooms}
                      </p>
                    </div>

                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Description
                    </label>
                    <div
                      className="text-base text-gray-900 mt-2 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: viewingProperty.description,
                      }}
                    />
                  </div>

                  {/* Amenities */}
                  {viewingProperty.amenities &&
                    viewingProperty.amenities.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">
                          Amenities
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {viewingProperty.amenities.map((amenity, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              {amenity.icon && (
                                <AmenityIcon
                                  customIconUrl={amenity.icon}
                                  amenityName={amenity.name}
                                  size={20}
                                  className="flex-shrink-0"
                                />
                              )}
                              <span className="text-sm text-gray-700">
                                {amenity.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* ====== NEW SECTIONS ADDED ====== */}
                  {/* Map URL */}
                  {viewingProperty.mapUrl && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Map URL
                      </label>
                      <a
                        href={viewingProperty.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-base block"
                      >
                        View on map
                      </a>
                    </div>
                  )}

                  {/* DLD, Handover, Payment Instalment */}
                  {(viewingProperty.dld ||
                    viewingProperty.handOver ||
                    viewingProperty.paymentInstalment) && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {viewingProperty.dld && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              DLD
                            </label>
                            <p className="text-base text-gray-900">
                              {viewingProperty.dld}
                            </p>
                          </div>
                        )}
                        {viewingProperty.handOver && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Handover
                            </label>
                            <p className="text-base text-gray-900">
                              {viewingProperty.handOver}
                            </p>
                          </div>
                        )}
                        {viewingProperty.paymentInstalment && (
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Payment Instalment
                            </label>
                            <p className="text-base text-gray-900">
                              {viewingProperty.paymentInstalment}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Payment Plans */}
                  {viewingProperty.paymentPlans &&
                    viewingProperty.paymentPlans.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">
                          Payment Plans
                        </label>
                        <div className="space-y-3">
                          {viewingProperty.paymentPlans.map((plan, idx) => (
                            <div
                              key={idx}
                              className="border border-gray-200 rounded-lg p-3"
                            >
                              {plan.planName && (
                                <p className="font-semibold text-gray-800">
                                  {plan.planName}
                                </p>
                              )}
                              {plan.parts && plan.parts.length > 0 && (
                                <ul className="mt-1 space-y-1">
                                  {plan.parts.map((part, pIdx) => (
                                    <li
                                      key={pIdx}
                                      className="text-sm text-gray-700 flex justify-between"
                                    >
                                      <span>{part.partName}</span>
                                      <span>{part.percentage}%</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Property Groups */}
                  {viewingProperty.propertGroups &&
                    viewingProperty.propertGroups.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">
                          Property Groups
                        </label>
                        <div className="space-y-3">
                          {viewingProperty.propertGroups.map((group, idx) => (
                            <div
                              key={idx}
                              className="border border-gray-200 rounded-lg p-3"
                            >
                              {group.name && (
                                <p className="font-semibold text-gray-800">
                                  {group.name}
                                </p>
                              )}
                              {group.units && group.units.length > 0 && (
                                <div className="mt-2 overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Type
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Area
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                          Price
                                        </th>
                                        {group.units.some(
                                          (u) => u.floreImage
                                        ) && (
                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                              Floor Image
                                            </th>
                                          )}
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {group.units.map((unit, uIdx) => (
                                        <tr key={uIdx}>
                                          <td className="px-3 py-2 whitespace-nowrap">
                                            {unit.type}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap">
                                            {unit.area}
                                          </td>
                                          <td className="px-3 py-2 whitespace-nowrap">
                                            {formatPrice(unit.price)}
                                          </td>
                                          {group.units.some(
                                            (u) => u.floreImage
                                          ) && (
                                              <td className="px-3 py-2 whitespace-nowrap">
                                                {unit.floreImage ? (
                                                  <img
                                                    src={unit.floreImage}
                                                    alt="Floor"
                                                    className="h-10 w-10 object-cover rounded"
                                                  />
                                                ) : (
                                                  "-"
                                                )}
                                              </td>
                                            )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* YouTube Videos */}
                  {viewingProperty.ytVideos &&
                    viewingProperty.ytVideos.length > 0 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">
                          Videos
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {viewingProperty.ytVideos.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-sm"
                            >
                              Video {idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  {/* ====== END NEW SECTIONS ====== */}

                  {/* Images */}
                  {viewingProperty.images &&
                    viewingProperty.images.length > 1 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 mb-2 block">
                          Additional Images ({viewingProperty.images.length})
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {viewingProperty.images
                            .slice(1, 4)
                            .map((img, index) => (
                              <div
                                key={index}
                                className="relative w-full h-24 rounded-lg overflow-hidden"
                              >
                                <img
                                  src={img}
                                  alt={`${viewingProperty.title} - Image ${index + 2
                                    }`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                  {/* Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Created
                      </label>
                      <p className="text-base text-gray-900">
                        {new Date(viewingProperty.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Updated
                      </label>
                      <p className="text-base text-gray-900">
                        {new Date(viewingProperty.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </>
              )}
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
                <h3 className="text-lg font-semibold text-[#002F45]">
                  Delete Selected Properties
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-[#002F45]">
                  {selectedIds.size}
                </span>{" "}
                {selectedIds.size === 1 ? "property" : "properties"}? This will
                permanently remove {selectedIds.size === 1 ? "it" : "them"} and
                all associated data.
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
                  `Delete ${selectedIds.size} ${selectedIds.size === 1 ? "Property" : "Properties"
                  }`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}