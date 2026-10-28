"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { fetchAdminProfile, updateAdminProfile } from "@/services/admin";
import { validateFile } from "@/utils/fileValidation";
import { useToast } from "@/hooks/useToast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { FaFacebook } from "react-icons/fa6";
import { FaInstagram, FaLinkedin, FaTiktok, FaYoutube } from "react-icons/fa";

type SocialMedia = {
  name: "facebook" | "instagram" | "linkedin" | "tiktok" | "youtube";
  link: string;
  icon: React.ComponentType<{ className?: string }>;
};

const getDayName = (day: number): string => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[day] || "";
};

export default function SettingsPage() {
  const { token, refreshProfile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [googleAuthConnected, setGoogleAuthConnected] = useState<boolean>(false)

  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [isEditingAboutInfo, setIsEditingAboutlInfo] = useState(false);
  const [aboutInfo, setAboutInfo] = useState({
    yearsOfExperinces: 0,
    totalSoldProperties: 0,
    locations: 0,
  });

  const [isEditingSocial, setIsEditingSocial] = useState(false);

  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([
    { name: "facebook", link: "", icon: FaFacebook },
    { name: "instagram", link: "", icon: FaInstagram },
    { name: "linkedin", link: "", icon: FaLinkedin },
    { name: "tiktok", link: "", icon: FaTiktok },
    { name: "youtube", link: "", icon: FaYoutube },
  ]);

  const [isEditingAvailability, setIsEditingAvailability] = useState(false);
  const [availability, setAvailability] = useState([
    { day: 1, dayName: "Monday", isAvailable: true, startTime: "", endTime: "" },
    { day: 2, dayName: "Tuesday", isAvailable: true, startTime: "", endTime: "" },
    { day: 3, dayName: "Wednesday", isAvailable: true, startTime: "", endTime: "" },
    { day: 4, dayName: "Thursday", isAvailable: true, startTime: "", endTime: "" },
    { day: 5, dayName: "Friday", isAvailable: true, startTime: "", endTime: "" },
    { day: 6, dayName: "Saturday", isAvailable: false, startTime: "", endTime: "" },
    { day: 0, dayName: "Sunday", isAvailable: false, startTime: "", endTime: "" },
  ]);

  // --- NEW: slotDuration state ---
  const [slotDuration, setSlotDuration] = useState<number>(0);

  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isSavingProfileImage, setIsSavingProfileImage] = useState(false);

  const handleAvailabilityChange = ({
    index,
    isAvailable,
    startTime,
    endTime,
  }: {
    index: number;
    isAvailable?: boolean | string;
    startTime?: string;
    endTime?: string;
  }) => {
    setAvailability((prev) =>
      prev.map((a, i) => {
        if (i !== index) return a;
        return {
          ...a,
          startTime: startTime !== undefined ? startTime : a.startTime,
          endTime: endTime !== undefined ? endTime : a.endTime,
          isAvailable:
            isAvailable !== undefined
              ? typeof isAvailable === "string"
                ? isAvailable === "1"
                : isAvailable
              : a.isAvailable,
        };
      })
    );
  };

  const handleSocialMediaChange = (index: number, value: string) => {
    setSocialMedia((prev) =>
      prev.map((social, i) =>
        i === index ? { ...social, link: value } : social
      )
    );
  };


  useEffect(() => {
    const loadAdminProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetchAdminProfile(token);
        if (response.success && response.data) {
          const admin = response.data;

          const backendSocialMedia = admin.socialMedia || {};
          setSocialMedia((prev) =>
            prev.map((social) => ({
              ...social,
              link: backendSocialMedia[social.name] || "",
            }))
          );

          setPersonalInfo({
            name: admin.name || "",
            email: admin.email || "",
            phone: admin.phone || "",
          });

          setAboutInfo({
            locations: admin.locations || 0,
            yearsOfExperinces: admin.yearsOfExperinces || 0,
            totalSoldProperties: admin.totalSoldProperties || 0,
          });
          setGoogleAuthConnected(admin?.googleAuthConnected || false)
          setLocation(admin.location || "");
          setBio(admin.bio || "");
          setProfileImage(admin.profileImage || null);

          // --- Load slotDuration ---
          if (admin.availability?.slotDuration) {
            setSlotDuration(admin.availability.slotDuration);
          }

          if (admin.availability?.weekly) {
            if (admin.availability?.weekly?.length > 1) {
              const weekly = admin.availability.weekly.map((day: any) => ({
                day: day.day,
                dayName: getDayName(day.day),
                isAvailable: day.isAvailable,
                startTime: day.startTime || "",
                endTime: day.endTime || "",
              }));
              setAvailability(weekly);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadAdminProfile();
  }, [token]);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleAboutInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAboutInfo((prev) => ({ ...prev, [name]: value }));
  };

  const saveFullProfile = async (options?: {
    skipSocial?: boolean;
    skipAvailability?: boolean;
  }) => {
    if (!token) return;

    if (!personalInfo.name.trim() || !personalInfo.email.trim()) {
      setError("Name and email are required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(personalInfo.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const payload: any = {
        name: personalInfo.name.trim(),
        email: personalInfo.email.trim(),
        phone: personalInfo.phone.trim() || undefined,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
        profileImage: profileImageFile,
        yearsOfExperinces: aboutInfo.yearsOfExperinces,
        totalSoldProperties: aboutInfo.totalSoldProperties,
        locations: aboutInfo.locations,
      };

      if (!options?.skipSocial) {
        const socialMediaData = socialMedia.reduce(
          (acc, social) => {
            acc[social.name] = social.link.trim();
            return acc;
          },
          {} as Record<string, string>
        );
        payload.socialMedia = socialMediaData;
      }

      if (!options?.skipAvailability) {
        const availabilityData = {
          timezone: "Asia/Karachi",
          slotDuration: slotDuration, // <-- use state
          weekly: availability.map((a) => ({
            day: a.day,
            isAvailable: a.isAvailable,
            startTime: a.startTime || "",
            endTime: a.endTime || "",
          })),
        };
        payload.availability = availabilityData;
      }

      const response = await updateAdminProfile(token, payload);

      if (response.success) {
        const successMessage = "Profile updated successfully!";
        setSuccess(successMessage);
        toast.success(successMessage);
        setIsEditingPersonalInfo(false);
        setIsEditingBio(false);
        setIsEditingLocation(false);
        setIsEditingAboutlInfo(false);
        setIsEditingSocial(false);
        setIsEditingAvailability(false);
        setProfileImageFile(null);

        if (response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        }

        setTimeout(async () => {
          await refreshProfile();
        }, 500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSocialMedia = async () => {
    await saveFullProfile({ skipAvailability: true });
  };

  const handleSaveAvailability = async () => {
    await saveFullProfile({ skipSocial: true });
  };

  const handleSavePersonalInfo = async () => {
    await saveFullProfile({ skipSocial: true, skipAvailability: true });
  };

  const handleSaveBio = async () => {
    await saveFullProfile({ skipSocial: true, skipAvailability: true });
  };

  const handleSaveLocation = async () => {
    await saveFullProfile({ skipSocial: true, skipAvailability: true });
  };

  const handleCancelLocation = () => {
    setIsEditingLocation(false);
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationResult = validateFile(file, ["image"]);
    if (!validationResult.isValid) {
      setError(validationResult.error || "Invalid file");
      toast.error(validationResult.error || "Invalid file");
      e.target.value = "";
      return;
    }

    setError(null);
    setSuccess(null);
    setProfileImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setProfileImage(reader.result as string);
        toast.info("Image selected. Click 'Save Photo' to upload.");
      }
    };
    reader.onerror = () => {
      setError("Failed to read image file");
      toast.error("Failed to read image file");
      setProfileImageFile(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfileImage = async () => {
    if (!token) return;
    if (!profileImageFile) {
      setError("Please select an image to upload");
      return;
    }

    try {
      setIsSavingProfileImage(true);
      setError(null);
      setSuccess(null);

      const response = await updateAdminProfile(token, {
        name: personalInfo.name.trim(),
        email: personalInfo.email.trim(),
        phone: personalInfo.phone.trim() || undefined,
        location: location.trim() || undefined,
        bio: bio.trim() || undefined,
        profileImage: profileImageFile,
        yearsOfExperinces: aboutInfo.yearsOfExperinces,
        totalSoldProperties: aboutInfo.totalSoldProperties,
        locations: aboutInfo.locations,
      });

      if (response.success) {
        const successMessage = "Profile image updated successfully!";
        setSuccess(successMessage);
        toast.success(successMessage);
        setProfileImageFile(null);
        if (response.data.profileImage) {
          setProfileImage(response.data.profileImage);
        }
        setTimeout(async () => {
          await refreshProfile();
        }, 500);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile image";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSavingProfileImage(false);
    }
  };

  const handleConnectgoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/auth/connect`;
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-ivory py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <LoadingSpinner text="Loading profile..." size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone/25 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-charcoal mb-8">Settings</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        {/* Profile Picture */}
        <div className="bg-ivory rounded-lg p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 rounded-full bg-teal-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
              {isSavingProfileImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="flex items-start justify-between w-full">


              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    onClick={() => document.getElementById("profile-upload")?.click()}
                  >
                    {profileImageFile ? "Change Photo" : "Upload New Photo"}
                  </button>
                  {profileImageFile && (
                    <button
                      type="button"
                      onClick={handleSaveProfileImage}
                      disabled={isSavingProfileImage}
                      className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSavingProfileImage ? "Saving..." : "Save Photo"}
                    </button>
                  )}
                </div>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleProfileImageChange}
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = "";
                  }}
                />
                <p className="text-sm text-gray-500">At least 800x800 recommended</p>
                <p className="text-sm text-gray-500">JPG, PNG, or WEBP only (Max 10MB)</p>
                {profileImageFile && (
                  <p className="text-sm text-charcoal font-medium mt-1">
                    New image selected. Click "Save Photo" to update.
                  </p>
                )}
              </div>

              {/* <div>
                <h3 className="font-['Manrope'] text-sm font-semibold text-[#2B2B2B]">
                  Google Calendar
                </h3>

                <button
                  type="button"
                  onClick={handleConnectgoogle}
                  disabled={googleAuthConnected}
                  className="shrink-0 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-black focus:outline-none focus:ring-2 focus:ring-[#C96A32]/30 disabled:bg-gray-400"
                >
                  {googleAuthConnected ? 'Connected' : 'Connect'}

                </button>
              </div> */}

            </div>

          </div>
        </div>

        {/* Personal Info */}
        <div className="bg-ivory rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-charcoal">Personal Info</h2>
            {!isEditingPersonalInfo ? (
              <button
                type="button"
                onClick={() => setIsEditingPersonalInfo(true)}
                className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSavePersonalInfo}
                disabled={saving}
                className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              {isEditingPersonalInfo ? (
                <Input
                  name="name"
                  value={personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  className="w-full"
                  required
                />
              ) : (
                <p className="text-base font-semibold text-gray-700">
                  {personalInfo.name || "Not set"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              {isEditingPersonalInfo ? (
                <Input
                  name="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="w-full"
                  required
                />
              ) : (
                <p className="text-base font-semibold text-gray-700">
                  {personalInfo.email || "Not set"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Phone</label>
              {isEditingPersonalInfo ? (
                <Input
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className="w-full"
                  placeholder="Optional"
                />
              ) : (
                <p className="text-base font-semibold text-gray-700">
                  {personalInfo.phone || "Not set"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* About Info */}
        {/* <div className="bg-ivory rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-charcoal">About Info</h2>
            {!isEditingAboutInfo ? (
              <button
                type="button"
                onClick={() => setIsEditingAboutlInfo(true)}
                className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSavePersonalInfo}
                disabled={saving}
                className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Years Of Experience <span className="text-red-500">*</span>
              </label>
              {isEditingAboutInfo ? (
                <Input
                  name="yearsOfExperinces"
                  type="number"
                  value={aboutInfo.yearsOfExperinces}
                  onChange={handleAboutInfoChange}
                  className="w-full"
                  required
                />
              ) : (
                <p className="text-base font-semibold text-gray-700">
                  {aboutInfo.yearsOfExperinces || "Not set"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                Total Properties <span className="text-red-500">*</span>
              </label>
              {isEditingAboutInfo ? (
                <Input
                  name="totalSoldProperties"
                  type="number"
                  value={aboutInfo.totalSoldProperties}
                  onChange={handleAboutInfoChange}
                  className="w-full"
                  required
                />
              ) : (
                <p className="text-base font-semibold text-gray-700">
                  {aboutInfo.totalSoldProperties || "Not set"}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">No. of Locations</label>
              {isEditingAboutInfo ? (
                <Input
                  name="locations"
                  type="number"
                  value={aboutInfo.locations}
                  onChange={handleAboutInfoChange}
                  className="w-full"
                  placeholder="Optional"
                />
              ) : (
                <p className="text-base font-semibold text-gray-700">
                  {aboutInfo.locations || "Not set"}
                </p>
              )}
            </div>
          </div>
        </div> */}

        {/* Social Media */}
        <div className="bg-ivory rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-charcoal">Social Media</h2>
            {!isEditingSocial ? (
              <button
                type="button"
                onClick={() => setIsEditingSocial(true)}
                className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveSocialMedia}
                disabled={saving}
                className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {socialMedia.map((social, index) => {
              const Icon = social.icon;
              return (
                <div key={social.name}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2 capitalize">
                    <Icon className="text-lg text-charcoal" />
                    {social.name}
                  </label>
                  {isEditingSocial ? (
                    <Input
                      type="url"
                      value={social.link}
                      onChange={(e) =>
                        handleSocialMediaChange(index, e.target.value)
                      }
                      placeholder={`Enter ${social.name} link`}
                      className="w-full"
                    />
                  ) : (
                    <p className="text-base font-semibold text-gray-700 break-all">
                      {social.link || "Not set"}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Availability (Appointment Settings) */}
        <div className="bg-ivory rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-charcoal">
              Appointment Settings
            </h2>
            {!isEditingAvailability ? (
              <button
                type="button"
                onClick={() => setIsEditingAvailability(true)}
                className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveAvailability}
                disabled={saving}
                className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          {/* --- NEW: Slot Duration --- */}
          <div className="mb-6">
            <label className="block text-sm text-gray-500 mb-1">
              Slot Duration (minutes)
            </label>
            {isEditingAvailability ? (
              <Input
                type="number"
                min={5}
                max={120}
                step={5}
                value={slotDuration}
                onChange={(e) => setSlotDuration(Number(e.target.value))}
                className="w-32"
              />
            ) : (
              <p className="text-base font-semibold text-gray-700">
                {slotDuration} minutes
              </p>
            )}
          </div>

          <div className="space-y-4">
            {availability.map((a, i) => (
              <div
                key={i}
                className="bg-white rounded-lg p-4 border border-gray-100 last:mb-0"
              >
                <div className="text-base font-semibold text-charcoal mb-3">
                  {a.dayName}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Availability
                    </label>
                    {isEditingAvailability ? (
                      <select
                        value={a.isAvailable ? "1" : "0"}
                        onChange={(e) =>
                          handleAvailabilityChange({
                            index: i,
                            isAvailable: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 border text-gray-900 border-gray-300 rounded-lg bg-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#002F45]/30 focus:border-[#002F45] hover:border-[#002F45]"
                      >
                        <option value="1">Available</option>
                        <option value="0">Not Available</option>
                      </select>
                    ) : (
                      <p className="text-base font-semibold text-gray-700">
                        {a.isAvailable ? "Available" : "Not Available"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      Start Time
                    </label>
                    {isEditingAvailability ? (
                      <Input
                        type="time"
                        value={a.startTime}
                        onChange={(e) =>
                          handleAvailabilityChange({
                            index: i,
                            startTime: e.target.value,
                          })
                        }
                        placeholder="Enter starting time"
                        className="w-full"
                      />
                    ) : (
                      <p className="text-base font-semibold text-gray-700">
                        {a.startTime || "Not set"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-500 mb-1">
                      End Time
                    </label>
                    {isEditingAvailability ? (
                      <Input
                        type="time"
                        value={a.endTime}
                        onChange={(e) =>
                          handleAvailabilityChange({
                            index: i,
                            endTime: e.target.value,
                          })
                        }
                        placeholder="Enter ending time"
                        className="w-full"
                      />
                    ) : (
                      <p className="text-base font-semibold text-gray-700">
                        {a.endTime || "Not set"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="bg-ivory rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-charcoal mb-4">Location</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location (optional)"
                onFocus={() => setIsEditingLocation(true)}
              />
            </div>
            {isEditingLocation && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCancelLocation}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  disabled={saving}
                  className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="bg-ivory rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-charcoal">Bio</h2>
            {!isEditingBio ? (
              <button
                type="button"
                onClick={() => setIsEditingBio(true)}
                className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium"
              >
                Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveBio}
                disabled={saving}
                className="px-4 py-2 bg-charcoal text-white rounded-lg hover:bg-charcoal/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            )}
          </div>
          {isEditingBio ? (
            <div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002F45] focus:border-transparent min-h-[100px]"
                placeholder="Enter your bio (optional, max 1000 characters)"
                maxLength={1000}
              />
              {bio.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">{bio.length}/1000 characters</p>
              )}
            </div>
          ) : (
            <p className="text-base text-gray-700 leading-relaxed">
              {bio || "No bio added yet"}
            </p>
          )}
        </div>

        {/* Footer links */}
        <div className="bg-ivory rounded-lg p-6">
          <h2 className="text-xl font-semibold text-charcoal mb-4">
            Looking for something else?
          </h2>
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 text-charcoal"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">
                  Search James Account
                </span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#002F45] flex items-center justify-center">
                  <span className="text-charcoal text-xs font-bold">?</span>
                </div>
                <span className="text-gray-700 font-medium">See Help Options</span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full border-2 border-[#002F45] flex items-center justify-center">
                  <span className="text-charcoal text-xs font-bold">!</span>
                </div>
                <span className="text-gray-700 font-medium">Send Feedback</span>
              </div>
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}