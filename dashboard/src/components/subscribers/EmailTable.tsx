"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { fetchEmails, getEmailById, deleteEmail, updateEmailStatus } from "@/services/subscribers";
import { Email } from "@/types/api";
import { Checkbox } from "@/components/ui";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/hooks/useToast";

const textColor = "#002F45";
const headerBg = "bg-ivory";
const cardClasses =
  "bg-white shadow-lg shadow-[#002F45]/5 rounded-2xl overflow-hidden border border-[#002F45]/5";

export const EmailTable: React.FC = () => {
  const { token } = useAuth();
  const toast = useToast();
  const [emails, setEmails] = useState<Email[]>([]);
  console.log(emails)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewingEmail, setViewingEmail] = useState<Email | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [deletingSelected, setDeletingSelected] = useState(false);

  useEffect(() => {
    const loadEmails = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetchEmails(token, { limit: 10 });
        const emailsData = response.data ?? [];
        setEmails(Array.isArray(emailsData) ? emailsData : []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load emails.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadEmails();
  }, [token]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(emails.map(e => e._id)));
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
      const response = await getEmailById(token, id);
      if (response.success && response.data) {
        setViewingEmail(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load email details";
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setEmailToDelete({ id, name });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!token || !emailToDelete) return;

    try {
      setDeletingId(emailToDelete.id);
      await deleteEmail(token, emailToDelete.id);
      setEmails(prev => prev.filter(e => e._id !== emailToDelete.id));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(emailToDelete.id);
        return newSet;
      });
      setShowDeleteModal(false);
      setEmailToDelete(null);
      toast.success("Email deleted successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete email";
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setEmailToDelete(null);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.size === 0) return;
    setShowBulkDeleteModal(true);
  };

  const handleBulkDeleteConfirm = async () => {
    if (!token || selectedIds.size === 0) return;

    try {
      setDeletingSelected(true);
      const deletePromises = Array.from(selectedIds).map(id => deleteEmail(token, id));
      await Promise.all(deletePromises);
      setEmails(prev => prev.filter(e => !selectedIds.has(e._id)));
      const count = selectedIds.size;
      setSelectedIds(new Set());
      setShowBulkDeleteModal(false);
      toast.success(`${count} ${count === 1 ? 'email' : 'emails'} deleted successfully`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete selected emails";
      toast.error(errorMessage);
    } finally {
      setDeletingSelected(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    setShowBulkDeleteModal(false);
  };

  const handleStatusChange = async (id: string, newStatus: "pending" | "responded" | "closed") => {
    if (!token) return;

    try {
      setUpdatingStatusId(id);
      await updateEmailStatus(token, id, newStatus);
      setEmails(prev => prev.map(e =>
        e._id === id ? { ...e, status: newStatus } : e
      ));
      // Update viewing email if it's the same one
      if (viewingEmail && viewingEmail._id === id) {
        setViewingEmail({ ...viewingEmail, status: newStatus });
      }
      toast.success(`Email status updated to ${newStatus}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update email status";
      toast.error(errorMessage);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const isAllSelected = emails.length > 0 && selectedIds.size === emails.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < emails.length;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: textColor }}>
          Emails
        </h2>
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
                <th className="px-3 py-2.5 w-[150px]">Name</th>
                <th className="px-3 py-2.5 w-[220px]">Email</th>
                <th className="px-3 py-2.5 w-[110px]">Phone</th>
                <th className="px-3 py-2.5 w-[230px]">Property</th>
                <th className="px-3 py-2.5 w-[130px]">Date</th>
                <th className="px-3 py-2.5 w-[130px]">Time</th>
                <th className="px-3 py-2.5 w-[130px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="border-t border-[#002F45]/10 px-4 py-12 text-center"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <LoadingSpinner text="Loading emails..." />
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td
                    colSpan={7}
                    className="border-t border-[#002F45]/10 px-4 py-4 text-center text-red-500"
                  >
                    {error}
                  </td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="border-t border-[#002F45]/10 px-4 py-4 text-center text-gray-500"
                  >
                    No emails found.
                  </td>
                </tr>
              ) : (
                emails.map((row) => (
                  <tr
                    key={row._id}
                    className="border-t border-[#002F45]/10 hover:bg-[#F8FCFD]"
                  >
                    <td className="px-3 py-2.5">
                      <Checkbox
                        checked={selectedIds.has(row._id)}
                        onChange={(e) => handleSelectOne(row._id, e.target.checked)}
                        containerClassName="justify-center"
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="truncate block max-w-[120px]" title={row.name}>
                        {row.name}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="block break-all" title={row.email}>
                        {row.email}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="truncate block max-w-[110px]" title={row.phone}>
                        {row.phone}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="line-clamp-3 max-w-[230px]" title={row.propertyId?.title || row.propertyType || "N/A"}>
                        {row?.propertyId?.title || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="line-clamp-2 max-w-[230px]" title={row.date}>

                        {row.date
                          ? new Date(`${row.date}T00:00:00`).toLocaleDateString()
                          : "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="line-clamp-2 max-w-[230px]" title={row.startTime}>
                        {`${row.startTime}-${row.endTime}`}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">

                      <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                        {/* Status Dropdown */}
                        {/* <select
                          value={row.status}
                          onChange={(e) => handleStatusChange(row._id, e.target.value as "pending" | "responded" | "closed")}
                          disabled={updatingStatusId === row._id}
                          className={`px-1.5 py-0.5 text-[11px] font-medium rounded border transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${row.status === 'responded'
                            ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                            : row.status === 'closed'
                              ? 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                              : 'bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100'
                            }`}
                          title="Change Status"
                        >
                          <option value="pending">Pending</option>
                          <option value="responded">Responded</option>
                          <option value="closed">Closed</option>
                        </select> */}
                        <button
                          onClick={() => handleView(row._id)}
                          className="p-1 rounded-full hover:bg-[#002F45]/10 text-[#002F45] transition-colors flex-shrink-0"
                          aria-label="View"
                          title="View Details"
                        >
                          <Image src="/icons/eye.svg" width={18} height={18} alt="view" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(row._id, row.name)}
                          disabled={deletingId === row._id}
                          className="p-1 rounded-full hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50 flex-shrink-0"
                          aria-label="Delete"
                          title="Delete"
                        >
                          <Image src="/icons/delete.svg" width={18} height={18} alt="delete" />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && emailToDelete && (
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
                  Delete Email
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete the email from{" "}
                <span className="font-semibold text-[#002F45]">
                  "{emailToDelete.name}"
                </span>
                ? This will permanently remove the email and all associated data.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleDeleteCancel}
                disabled={deletingId === emailToDelete.id}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deletingId === emailToDelete.id}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingId === emailToDelete.id ? (
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
                  "Delete Email"
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
                  Delete Selected Emails
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to delete <span className="font-semibold text-[#002F45]">{selectedIds.size}</span> {selectedIds.size === 1 ? 'email' : 'emails'}? This will permanently remove {selectedIds.size === 1 ? 'it' : 'them'} and all associated data.
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
                  `Delete ${selectedIds.size} ${selectedIds.size === 1 ? 'Email' : 'Emails'}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewingEmail && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#002F45]">Email Details</h3>
              <button
                onClick={() => setViewingEmail(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-base text-gray-900">{viewingEmail.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-base text-gray-900">{viewingEmail.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-base text-gray-900">{viewingEmail.phone}</p>
              </div>
              {viewingEmail.propertyId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Property </label>
                  <p className="text-base text-gray-900">{viewingEmail.propertyId.title}</p>
                </div>
              )}
              {viewingEmail.date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Date</label>
                  <p className="text-base text-gray-900">{viewingEmail.date}</p>
                </div>
              )}
              {viewingEmail.startTime && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Time</label>
                  <p className="text-base text-gray-900">{`${viewingEmail.startTime}-${viewingEmail.endTime}`}</p>
                </div>
              )}

              {viewingEmail.startTime && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Message</label>
                  <p className="text-base text-gray-900">{viewingEmail.message}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

