"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { fetchNotifications, clearAllNotifications, markNotificationAsRead, Notification } from "@/services/notifications";
import { fetchPropertiesForSearch } from "@/services/properties";
import { Property } from "@/types/api";

export default function Navbar() {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Property[]>([]);
  const [allProperties, setAllProperties] = useState<Property[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const { admin, logout, token, refreshProfile } = useAuth();
  const [profileImageKey, setProfileImageKey] = useState(0);

  // Update image key when profile image changes to force reload
  useEffect(() => {
    if (admin?.profileImage) {
      setProfileImageKey(prev => prev + 1);
    }
  }, [admin?.profileImage]);

  const loadNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetchNotifications(token, 20, false);
      if (response.success && response.data) {
        setNotifications(response.data.data || []);
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleClearAll = async () => {
    if (!token) return;
    try {
      await clearAllNotifications(token);
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!token) return;

    // Mark as read if unread
    if (!notification.read) {
      try {
        await markNotificationAsRead(token, notification._id);
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate based on notification type
    setIsNotifOpen(false);
    switch (notification.type) {
      case 'comment':
        router.push('/subscribers/comments');
        break;
      case 'newsletter':
      case 'subscriber':
        router.push('/subscribers/newsletter');
        break;
      case 'contact':
        router.push('/subscribers/contact');
        break;
      case 'enquiry':
        router.push('/subscribers/enquiries');
        break;
      case 'blog':
        router.push('/manage-blogs');
        break;
      case 'property':
        router.push('/');
        break;
      default:
        // No navigation for unknown types
        break;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Load properties for search suggestions
  const loadPropertiesForSearch = useCallback(async () => {
    if (allProperties.length > 0) return;
    try {
      setLoadingSuggestions(true);
      const response = await fetchPropertiesForSearch(token ?? undefined);
      setAllProperties(response.data ?? []);
    } catch (err) {
      console.error("Error loading properties for search:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [token, allProperties.length]);

  // Filter suggestions as user types (or show recent when empty)
  const filteredSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (allProperties.length === 0) return [];
    if (!q) return allProperties.slice(0, 8); // Show recent when focused, no query
    return allProperties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p._id.toLowerCase().includes(q) ||
        (p.location?.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [searchQuery, allProperties]);

  // Sync suggestions when filtered list changes
  useEffect(() => {
    setSuggestions(filteredSuggestions);
    setHighlightedIndex(-1);
  }, [filteredSuggestions]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      const params = new URLSearchParams({ search: trimmed });
      router.push(`/properties/Residential/Apartment?${params.toString()}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (property: Property) => {
    const params = new URLSearchParams({ search: property.title });
    router.push(`/properties/Residential/Apartment?${params.toString()}`);
    setSearchQuery(property.title);
    setShowSuggestions(false);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i < suggestions.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i > 0 ? i - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSuggestionSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <nav className="bg-stone/25 text-charcoal w-full shadow-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-14">
        {/* Search bar with autocomplete */}
        <div className="flex-1" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Image
                src="/icons/search.svg"
                width={18}
                height={18}
                alt="search"
              />
            </div>
            <input
              type="search"
              name="search"
              id="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                loadPropertiesForSearch();
                setShowSuggestions(true);
              }}
              onKeyDown={handleSearchKeyDown}
              className="block w-full rounded-full border py-2.5 pl-12 pr-4 focus:outline-none"
              placeholder="Search properties by title, ID, or location..."
              autoComplete="off"
            />
            {/* Autocomplete dropdown */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-30">
                {loadingSuggestions ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    Loading suggestions...
                  </div>
                ) : suggestions.length > 0 ? (
                  <ul className="py-2">
                    {suggestions.map((property, idx) => (
                      <li key={property._id}>
                        <button
                          type="button"
                          onClick={() => handleSuggestionSelect(property)}
                          onMouseEnter={() => setHighlightedIndex(idx)}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${idx === highlightedIndex ? "bg-primary/10" : ""
                            }`}
                        >
                          <p className="font-semibold text-[#002F45] truncate">
                            {property.title}
                          </p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs text-gray-500">
                            <span>ID: {property._id.slice(-8)}</span>
                            <span className="capitalize">{property.type}</span>
                            {property.location && (
                              <span>{property.location}</span>
                            )}
                            {property.price && (
                              <span className="font-medium text-primary">
                                {property.price}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : searchQuery.trim() ? (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No properties found. Press Enter to search anyway.
                  </div>
                ) : !loadingSuggestions ? (
                  <div className="px-4 py-4 text-sm text-gray-500 text-center">
                    Start typing to search properties
                  </div>
                ) : null}
              </div>
            )}
          </form>
        </div>
        {/* Icons and profile */}
        <div className="flex items-center space-x-3 relative">
          {/* Settings */}
          <button
            type="button"
            onClick={() => router.push("/settings")}
            className="rounded-full focus:outline-none cursor-pointer w-8 h-8 bg-charcoal hover:bg-[#E3A750] flex justify-center items-center transition-colors"
            aria-label="Settings"
            title="Settings"
          >
            <Image
              src="/icons/settings.svg"
              width={18}
              height={18}
              alt="settings"
            />
          </button>
          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="rounded-full focus:outline-none cursor-pointer w-8 h-8 bg-charcoal hover:bg-[#E3A750] flex justify-center items-center"
              aria-label="Notifications"
            >
              <Image
                src="/icons/bell.svg"
                width={20}
                height={20}
                alt="notifications"
              />
            </button>
            {/* Notification Badge */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
            {/* Notification Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 max-h-96 rounded-lg shadow-lg bg-[#E3A750] text-white z-20 overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-gray-400 flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="overflow-y-auto max-h-80">
                  {loading ? (
                    <div className="px-4 py-4 text-sm text-center text-white/80">
                      Loading notifications...
                    </div>
                  ) : notifications.length > 0 ? (
                    <>
                      {notifications.map((notif, idx) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`px-4 py-3 cursor-pointer transition-colors ${!notif.read ? 'bg-white/10 hover:bg-white/15' : 'hover:bg-white/5'
                            }`}
                        >
                          <div className="flex items-start gap-2">
                            {!notif.read && (
                              <span className="mt-1.5 h-2 w-2 rounded-full bg-white flex-shrink-0" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{notif.message}</p>
                              <p className="text-xs text-primary opacity-80 mt-1">
                                {formatDate(notif.createdAt)}
                              </p>
                            </div>
                          </div>
                          {idx < notifications.length - 1 && (
                            <div className="border-t border-gray-400 mx-2 mt-2" />
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="px-4 py-4 text-sm text-center text-white/80">
                      No notifications
                    </div>
                  )}
                </div>
                {notifications.length > 0 && (
                  <>
                    <div className="border-t border-gray-400 mx-2" />
                    <button
                      onClick={handleClearAll}
                      className="w-full flex justify-end px-6 text-primary py-2 text-sm font-medium hover:bg-[#d89a45] transition-colors"
                    >
                      Clear All
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          {/* Profile Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex max-w-xs items-center gap-1 rounded-full text-sm focus:outline-none cursor-pointer"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
            >
              {admin?.profileImage ? (
                <img
                  key={profileImageKey}
                  className="h-9 w-9 rounded-full object-cover"
                  src={`${admin.profileImage}?v=${profileImageKey}`}
                  alt="User avatar"
                  onError={(e) => {
                    // Fallback to default if image fails to load
                    (e.target as HTMLImageElement).src = "/images/vector.png";
                  }}
                />
              ) : (
                <Image
                  className="h-9 w-9 rounded-full object-cover"
                  src="/images/vector.png"
                  alt="User avatar"
                  width={40}
                  height={40}
                />
              )}
              <Image
                src="/icons/arrow-up.svg"
                width={16}
                height={16}
                alt="open/close"
                className={`invert ${isDropdownOpen ? "rotate-180" : "rotate-0"
                  } transition-all duration-200`}
              />
            </button>
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="px-4 py-2 text-sm text-gray-700">
                  <p className="font-semibold text-[#002F45]">
                    {admin?.name ?? "Admin"}
                  </p>
                  <p className="text-xs text-gray-500">{admin?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="mt-1 block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

