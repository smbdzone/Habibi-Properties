"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { fetchEnquiries, getEnquiryById, deleteEnquiry } from "@/services/subscribers";
import { Enquiry } from "@/types/api";
import { Checkbox } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/useToast";

const textColor = "#002F45";
const headerBg = "bg-ivory";
const cardClasses =
  "bg-white shadow-lg shadow-[#002F45]/5 rounded-2xl overflow-hidden border border-[#002F45]/5";

export const EnquiriesTable: React.FC = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingEnquiry, setViewingEnquiry] = useState<Enquiry | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);

  // Sorting state for "Created At" column
  const [sortConfig, setSortConfig] = useState<{ key: 'createdAt'; direction: 'asc' | 'desc' }>({
    key: 'createdAt',
    direction: 'desc', // default: newest first
  });

  useEffect(() => {
    const loadEnquiries = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchEnquiries(token);
        // Store unsorted data; sorting will be applied via useMemo
        setEnquiries(response.data ?? []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load enquiries.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadEnquiries();
  }, [token]);

  // Memoized sorted enquiries based on sortConfig
  const sortedEnquiries = useMemo(() => {
    const sorted = [...enquiries];
    if (sortConfig.key === 'createdAt') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
    return sorted;
  }, [enquiries, sortConfig]);

  const handleSort = () => {
    setSortConfig(prev => ({
      key: 'createdAt',
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedEnquiries.map(e => e._id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleView = async (id: string) => {
    if (!token) return;
    try {
      const response = await getEnquiryById(token, id);
      if (response.success && response.data) {
        setViewingEnquiry(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load enquiry details";
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setEnquiryToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !enquiryToDelete) return;

    try {
      setDeletingId(enquiryToDelete.id);
      await deleteEnquiry(token, enquiryToDelete.id);
      setEnquiries(prev => prev.filter(e => e._id !== enquiryToDelete.id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(enquiryToDelete.id);
        return newSet;
      });
      setShowDeleteModal(false);
      setEnquiryToDelete(null);
      toast.success("Enquiry deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete enquiry";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setEnquiryToDelete(null);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (!token || selectedIds.size === 0) return;

    try {
      setDeletingSelected(true);
      const deletePromises = Array.from(selectedIds).map(id => deleteEnquiry(token, id));
      await Promise.all(deletePromises);
      setEnquiries(prev => prev.filter(e => !selectedIds.has(e._id)));
      const count = selectedIds.size;
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      toast.success(`${count} ${count === 1 ? 'enquiry' : 'enquiries'} deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete selected enquiries";
      toast.error(errorMessage);
    } finally {
      setDeletingSelected(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    setShowBulkDeleteModal(false);
  };

  // Download selected enquiries as CSV
  const handleDownloadSelected = () => {
    if (selectedIds.size === 0) return;

    const selectedEnquiries = enquiries.filter(e => selectedIds.has(e._id));
    const headers = [
      "First Name",
      "Email",
      "Phone",
      "Country",
      "Budget",
      "Property Type",
      "Created At"
    ];

    const rows = selectedEnquiries.map(e => [
      e.firstName || "",
      e.email || "",
      e.countryCode + e.phoneNumber || "",
      e.country || "",
      e.budget || "",
      e.propertyType || "",
      e.createdAt ? new Date(e.createdAt).toLocaleString() : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `enquiries_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isAllSelected = sortedEnquiries.length > 0 && selectedIds.size === sortedEnquiries.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < sortedEnquiries.length;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: textColor }}>
          Enquiries
        </h2>
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadSelected}
              className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-orange transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Selected ({selectedIds.size})
            </button>
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
          </div>
        )}
      </div>
      <div className={cardClasses}>
        <table className="w-full border-collapse text-[15px] text-[#01364C]">
          <thead className={`${headerBg} text-left text-sm font-semibold`}>
            <tr>
              <th className="px-4 py-3 w-12">
                <Checkbox
                  checked={isAllSelected}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  containerClassName="justify-center"
                />
              </th>
              <th className="px-4 py-3">First Name</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Budget</th>
              <th className="px-4 py-3">Property Type</th>
              {/* Created At column with sort icon */}
              <th className="px-4 py-3 cursor-pointer select-none" onClick={handleSort}>
                <span className="flex items-center gap-1">
                  Created At
                  <span className="inline-flex">
                    {sortConfig.direction === 'asc' ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </span>
                </span>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="border-t border-[#002F45]/10 px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <LoadingSpinner text="Loading enquiries..." />
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="border-t border-[#002F45]/10 px-4 py-4 text-center text-red-500">
                  {error}
                </td>
              </tr>
            ) : sortedEnquiries.length === 0 ? (
              <tr>
                <td colSpan={8} className="border-t border-[#002F45]/10 px-4 py-4 text-center text-gray-500">
                  No enquiries found.
                </td>
              </tr>
            ) : (
              sortedEnquiries.map((row) => (
                <tr key={row._id} className="border-t border-[#002F45]/10 hover:bg-[#F8FCFD]">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(row._id)}
                      onChange={(e) => handleSelectOne(row._id, e.target.checked)}
                      containerClassName="justify-center"
                    />
                  </td>
                  <td className="px-4 py-3">{row.firstName}</td>
                  <td className="px-4 py-3">{row.countryCode + row.phoneNumber}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">{row.budget}</td>
                  <td className="px-4 py-3 capitalize">{row.propertyType}</td>
                  <td className="px-4 py-3">
                    {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(row._id)}
                        className="p-1.5 rounded-full hover:bg-[#002F45]/10 text-[#002F45] transition-colors"
                        aria-label="View"
                        title="View Details"
                      >
                        <Image src="/icons/eye.svg" width={20} height={20} alt="view" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(row._id, `${row.firstName}`.trim())}
                        disabled={deletingId === row._id}
                        className="p-1.5 rounded-full hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                        aria-label="Delete"
                        title="Delete"
                      >
                        <Image src="/icons/delete.svg" width={20} height={20} alt="delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && enquiryToDelete && (
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
                  Delete Enquiry
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the enquiry from{" "}
                <span className="font-semibold text-[#002F45]">
                  "{enquiryToDelete.name}"
                </span>
                ? This will permanently remove the enquiry and all associated data.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deletingId === enquiryToDelete.id}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === enquiryToDelete.id}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId === enquiryToDelete.id ? (
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
                  "Delete Enquiry"
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
                <h3 className="text-lg font-semibold text-[#002F45]">
                  Delete Selected Enquiries
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold text-[#002F45]">{selectedIds.size}</span> {selectedIds.size === 1 ? 'enquiry' : 'enquiries'}? This will permanently remove {selectedIds.size === 1 ? 'it' : 'them'} and all associated data.
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
                  `Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'Enquiry' : 'Enquiries'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingEnquiry && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 transition-all">
            <div className="p-6 border-b border-gray-200/50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <h3 className="text-xl font-semibold text-[#002F45]">Enquiry Details</h3>
              <button
                onClick={() => setViewingEnquiry(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">First Name</label>
                <p className="text-base text-gray-900">{viewingEnquiry.firstName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base text-gray-900">{viewingEnquiry.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-base text-gray-900">{viewingEnquiry.phoneNumber}</p>
              </div>
              {viewingEnquiry.country && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Country</label>
                  <p className="text-base text-gray-900">{viewingEnquiry.country}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Budget</label>
                <p className="text-base text-gray-900">{viewingEnquiry.budget}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Property Type</label>
                <p className="text-base text-gray-900 capitalize">{viewingEnquiry.propertyType}</p>
              </div>
              {viewingEnquiry.createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-base text-gray-900">
                    {new Date(viewingEnquiry.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};