"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import { Checkbox } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { fetchSubscribers, getSubscriberById, deleteSubscriber } from "@/services/subscribers";
import { Subscriber } from "@/types/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/useToast";

const textColor = "#002F45";
const headerBg = "bg-ivory";
const cardClasses =
  "bg-white shadow-lg shadow-[#002F45]/5 rounded-2xl overflow-hidden border border-[#002F45]/5";

export const NewsletterTable: React.FC = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingSubscriber, setViewingSubscriber] = useState<Subscriber | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<{ id: string; email: string } | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: 'email' | 'source' | 'subscribedAt'; direction: 'asc' | 'desc' }>({
    key: 'subscribedAt',
    direction: 'desc', // newest first
  });

  useEffect(() => {
    const loadSubscribers = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchSubscribers(token);
        const subscribersData = response.data?.data ?? response.data ?? [];
        setSubscribers(Array.isArray(subscribersData) ? subscribersData : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load subscribers.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadSubscribers();
  }, [token]);

  // Memoized sorted subscribers
  const sortedSubscribers = useMemo(() => {
    const sorted = [...subscribers];
    if (sortConfig.key === 'subscribedAt') {
      sorted.sort((a, b) => {
        const dateA = new Date(a.subscribedAt).getTime();
        const dateB = new Date(b.subscribedAt).getTime();
        return sortConfig.direction === 'asc' ? dateA - dateB : dateB - dateA;
      });
    } else if (sortConfig.key === 'email') {
      sorted.sort((a, b) => {
        const emailA = a.email.toLowerCase();
        const emailB = b.email.toLowerCase();
        return sortConfig.direction === 'asc' ? emailA.localeCompare(emailB) : emailB.localeCompare(emailA);
      });
    } else if (sortConfig.key === 'source') {
      sorted.sort((a, b) => {
        const sourceA = (a.source ?? 'website').toLowerCase();
        const sourceB = (b.source ?? 'website').toLowerCase();
        return sortConfig.direction === 'asc' ? sourceA.localeCompare(sourceB) : sourceB.localeCompare(sourceA);
      });
    }
    return sorted;
  }, [subscribers, sortConfig]);

  const handleSort = (key: 'email' | 'source' | 'subscribedAt') => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(sortedSubscribers.map(s => s._id)));
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
      const response = await getSubscriberById(token, id);
      if (response.success && response.data) {
        setViewingSubscriber(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load subscriber details";
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (id: string, email: string) => {
    setSubscriberToDelete({ id, email });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !subscriberToDelete) return;

    try {
      setDeletingId(subscriberToDelete.id);
      await deleteSubscriber(token, subscriberToDelete.id);
      setSubscribers(prev => prev.filter(s => s._id !== subscriberToDelete.id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(subscriberToDelete.id);
        return newSet;
      });
      setShowDeleteModal(false);
      setSubscriberToDelete(null);
      toast.success("Subscriber deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete subscriber";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setSubscriberToDelete(null);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (!token || selectedIds.size === 0) return;

    try {
      setDeletingSelected(true);
      const deletePromises = Array.from(selectedIds).map(id => deleteSubscriber(token, id));
      await Promise.all(deletePromises);
      setSubscribers(prev => prev.filter(s => !selectedIds.has(s._id)));
      const count = selectedIds.size;
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      toast.success(`${count} ${count === 1 ? 'subscriber' : 'subscribers'} deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete selected subscribers";
      toast.error(errorMessage);
    } finally {
      setDeletingSelected(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    setShowBulkDeleteModal(false);
  };

  // Download selected subscribers as CSV
  const handleDownloadSelected = () => {
    if (selectedIds.size === 0) return;

    const selectedSubscribers = subscribers.filter(s => selectedIds.has(s._id));
    const headers = ["Email", "Source", "Subscribed On"];

    const rows = selectedSubscribers.map(s => [
      s.email || "",
      s.source || "website",
      s.subscribedAt ? new Date(s.subscribedAt).toLocaleString() : ""
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isAllSelected = sortedSubscribers.length > 0 && selectedIds.size === sortedSubscribers.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < sortedSubscribers.length;

  return (
    <section className="space-y-4 ">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: textColor }}>
          Subscribers
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
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('email')}>
                <span className="flex items-center gap-1">
                  Email
                  {sortConfig.key === 'email' && (
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
                  )}
                </span>
              </th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('source')}>
                <span className="flex items-center gap-1">
                  Source
                  {sortConfig.key === 'source' && (
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
                  )}
                </span>
              </th>
              <th className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort('subscribedAt')}>
                <span className="flex items-center gap-1">
                  Subscribed On
                  {sortConfig.key === 'subscribedAt' && (
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
                  )}
                </span>
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="border-t border-[#002F45]/10 px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <LoadingSpinner text="Loading subscribers..." />
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td
                  colSpan={5}
                  className="border-t border-[#002F45]/10 px-4 py-4 text-center text-red-500"
                >
                  {error}
                </td>
              </tr>
            ) : sortedSubscribers.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="border-t border-[#002F45]/10 px-4 py-4 text-center text-gray-500"
                >
                  No subscribers found.
                </td>
              </tr>
            ) : (
              sortedSubscribers.map((subscriber) => {
                const subscribedDate = new Date(subscriber.subscribedAt);
                return (
                  <tr
                    key={subscriber._id}
                    className="border-t border-[#002F45]/10 hover:bg-[#F8FCFD]"
                  >
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedIds.has(subscriber._id)}
                        onChange={(e) => handleSelectOne(subscriber._id, e.target.checked)}
                        containerClassName="justify-center"
                      />
                    </td>
                    <td className="px-4 py-3">{subscriber.email}</td>
                    <td className="px-4 py-3 capitalize">
                      {subscriber.source ?? "website"}
                    </td>
                    <td className="px-4 py-3">
                      {subscribedDate.toLocaleDateString()}{" "}
                      {subscribedDate.toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(subscriber._id)}
                          className="p-1.5 rounded-full hover:bg-[#002F45]/10 text-[#002F45] transition-colors"
                          aria-label="View"
                          title="View Details"
                        >
                          <Image src="/icons/eye.svg" width={20} height={20} alt="view" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(subscriber._id, subscriber.email)}
                          disabled={deletingId === subscriber._id}
                          className="p-1.5 rounded-full hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Image src="/icons/delete.svg" width={20} height={20} alt="delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && subscriberToDelete && (
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
                  Delete Subscriber
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the subscriber{" "}
                <span className="font-semibold text-[#002F45]">
                  "{subscriberToDelete.email}"
                </span>
                ? This will permanently remove the subscriber and all associated data.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deletingId === subscriberToDelete.id}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === subscriberToDelete.id}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId === subscriberToDelete.id ? (
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
                  "Delete Subscriber"
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
                  Delete Selected Subscribers
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold text-[#002F45]">{selectedIds.size}</span> {selectedIds.size === 1 ? 'subscriber' : 'subscribers'}? This will permanently remove {selectedIds.size === 1 ? 'it' : 'them'} and all associated data.
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
                  `Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'Subscriber' : 'Subscribers'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingSubscriber && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white/95 backdrop-blur-md rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20 transition-all">
            <div className="p-6 border-b border-gray-200/50 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <h3 className="text-xl font-semibold text-[#002F45]">Subscriber Details</h3>
              <button
                onClick={() => setViewingSubscriber(null)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base text-gray-900">{viewingSubscriber.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Source</label>
                <p className="text-base text-gray-900 capitalize">{viewingSubscriber.source ?? "website"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-base text-gray-900 capitalize">{viewingSubscriber.status ?? "subscribed"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Subscribed On</label>
                <p className="text-base text-gray-900">
                  {new Date(viewingSubscriber.subscribedAt).toLocaleString()}
                </p>
              </div>
              {(viewingSubscriber as any).unsubscribedAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Unsubscribed On</label>
                  <p className="text-base text-gray-900">
                    {new Date((viewingSubscriber as any).unsubscribedAt).toLocaleString()}
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