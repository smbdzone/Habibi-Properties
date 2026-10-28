"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardCard from "@/components/dashboard/DashboardCard";
import DashboardTable from "@/components/dashboard/DashboardTable";
import { useAuth } from "@/context/AuthContext";
import { fetchDashboardOverview } from "@/services/dashboard";
import { deleteProperty } from "@/services/properties";
import { DashboardOverview } from "@/types/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function Home() {
  const router = useRouter();
  const { token } = useAuth();
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; title: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);
  const loadingRef = useRef(false);

  const loadOverview = useCallback(async () => {
    if (!token || loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const response = await fetchDashboardOverview(token);
      setOverview(response.data ?? null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]); // Only depend on token to prevent infinite loops

  const handleEdit = (id: string) => {
    router.push(`/add-property?id=${id}`);
  };

  const handleDeleteClick = useCallback((id: string, title: string) => {
    setPropertyToDelete({ id, title });
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!token || !propertyToDelete) return;

    try {
      setDeletingId(propertyToDelete.id);
      await deleteProperty(token, propertyToDelete.id);
      await loadOverview();
      setShowDeleteModal(false);
      setPropertyToDelete(null);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Unable to delete the property. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPropertyToDelete(null);
  };

  const tableData = useMemo(() => {
    if (!overview || loading) return [];
    return overview.latestProperties.map((property) => ({
      id: property._id,
      title: property.title,
      type: property.type,
      price: property.price,
      location: property.location,
    }));
  }, [overview, loading]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(tableData.map(p => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [tableData]);

  const handleSelectOne = useCallback((id: string, checked: boolean) => {
    setSelectedIds(prev => {
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
      const deletePromises = Array.from(selectedIds).map(id => deleteProperty(token, id));
      await Promise.all(deletePromises);
      const count = selectedIds.size;
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      await loadOverview();
      alert(`${count} ${count === 1 ? 'property' : 'properties'} deleted successfully`);
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to delete selected properties. Please try again."
      );
    } finally {
      setDeletingSelected(false);
    }
  }, [token, selectedIds, loadOverview]);

  const handleBulkDeleteCancel = useCallback(() => {
    setShowBulkDeleteModal(false);
  }, []);

  const isAllSelected = tableData.length > 0 && selectedIds.size === tableData.length;

  const cards = useMemo(
    () => [
      {
        label: "Total Properties",
        value: overview?.stats.properties ?? 0,
        bgColor: "#242424",
        textColor: "#B18336",
        arrowBgColor: "#303030",
        href: "/properties/Residential/Apartment",
      },
      {
        label: "Blog Posts",
        value: overview?.stats.blogs ?? 0,
        bgColor: "#d8d2c8",
        textColor: "#242424",
        arrowBgColor: "#303030",
        href: "/manage-blogs",
      },
      {
        label: "Enquiries",
        value: overview?.stats.enquiries ?? 0,
        bgColor: "#d8d2c8",
        textColor: "#242424",
        arrowBgColor: "#303030",
        href: "/subscribers/enquiries",
      },
      {
        label: "Subscribers",
        value: overview?.stats.subscribers ?? 0,
        bgColor: "#d8d2c8",
        textColor: "#242424",
        arrowBgColor: "#303030",
        href: "/subscribers/newsletter",
      },
    ],
    [overview]
  );

  if (loading && !overview) {
    return (
      <div className="flex min-h-screen items-center justify-center text-primary">
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-primary">
        <p className="text-lg font-semibold">{error}</p>
        <button
          onClick={loadOverview}
          className="rounded-full bg-[#002F45] px-6 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-primary">
      <h1 className="mb-4 text-2xl font-semibold">Dashboard</h1>
      <div className="flex flex-wrap gap-3">
        {cards.map((card) => (
          <DashboardCard key={card.label} {...card} />
        ))}
      </div>

      <div className="mt-8 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-2xl font-semibold text-primary">
          Recent Properties
        </h3>
        <Link
          href="/add-property"
          className="flex items-center gap-2 rounded-full bg-black px-6 py-3 text-base font-semibold text-ivory transition hover:bg-black shadow-sm"
        >
          <span className="text-3xl font-light">+</span> Add Property
        </Link>
      </div>

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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected ({selectedIds.size})
              </>
            )}
          </button>
        </div>
      )}

      <DashboardTable
        data={tableData}
        onEdit={handleEdit}
        onDelete={(id) => {
          const property = overview?.latestProperties.find(p => p._id === id);
          if (property) {
            handleDeleteClick(id, property.title);
          }
        }}
        isLoading={loading || deletingId !== null}
        emptyMessage="No properties found."
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
        isAllSelected={isAllSelected}
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#002F45]">
              Recent Enquiries
            </h4>
            <Link
              href="/subscribers/enquiries"
              className="text-sm font-semibold text-black"
            >
              View all
            </Link>
          </div>
          <ul className="space-y-4">
            {overview && overview.recentEnquiries.length > 0 ? (
              overview.recentEnquiries.map((enquiry) => (
                <li
                  key={enquiry._id}
                  className="rounded-2xl border border-[#BCD4CC] px-4 py-3"
                >
                  <p className="font-semibold text-[#002F45]">
                    {enquiry.firstName} {enquiry.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{enquiry.email}</p>
                  <p className="text-sm text-gray-500">
                    {enquiry.propertyType} • {enquiry.budget}
                  </p>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">No enquiries yet.</p>
            )}
          </ul>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h4 className="text-lg font-semibold text-[#002F45]">
              Latest Contacts
            </h4>
            <Link
              href="/subscribers/contact"
              className="text-sm font-semibold text-black"
            >
              View all
            </Link>
          </div>
          <ul className="space-y-4">
            {overview && overview.recentContacts.length > 0 ? (
              overview.recentContacts.map((contact) => (
                <li
                  key={contact._id}
                  className="rounded-2xl border border-[#BCD4CC] px-4 py-3"
                >
                  <p className="font-semibold text-[#002F45]">
                    {contact.firstName} {contact.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{contact.email}</p>
                  <p className="text-sm text-gray-500">{contact.subject}</p>
                </li>
              ))
            ) : (
              <p className="text-sm text-gray-500">No contact messages yet.</p>
            )}
          </ul>
        </div>
      </div>

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
                Are you sure you want to delete the property{" "}
                <span className="font-semibold text-[#002F45]">
                  "{propertyToDelete.title}"
                </span>
                ? This will permanently remove the property and all associated data.
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
                Are you sure you want to delete <span className="font-semibold text-[#002F45]">{selectedIds.size}</span> {selectedIds.size === 1 ? 'property' : 'properties'}? This will permanently remove {selectedIds.size === 1 ? 'it' : 'them'} and all associated data.
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
                  `Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'Property' : 'Properties'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
