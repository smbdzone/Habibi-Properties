import { apiClient, ApiEnvelope } from "@/lib/apiClient";

export interface AdminProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  locations: number;
  yearsOfExperinces: number;
  totalSoldProperties: number;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    tiktok?: string;
    youtube?: string;
  };
  googleAuthConnected?: boolean;
  availability?: {
    timezone: string;
    slotDuration: number;
    weekly: {
      day: number;
      isAvailable: boolean;
      startTime: string;
      endTime: string;
    }[];
  };
}

export interface AdminProfileResponse {
  success: boolean;
  data: AdminProfile;
  message?: string;
}

export const fetchAdminProfile = async (token: string): Promise<AdminProfileResponse> => {
  const response = await apiClient<AdminProfileResponse>("/admin/auth/me", {
    token,
  });
  return response;
};

export const updateAdminProfile = async (
  token: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    bio?: string;
    profileImage?: File | null;
    yearsOfExperinces: number;
    totalSoldProperties: number;
    locations: number;
    socialMedia?: Record<string, string>;
    availability?: {
      timezone: string;
      slotDuration: number;
      weekly: {
        day: number;
        isAvailable: boolean;
        startTime: string;
        endTime: string;
      }[];
    };
  }
): Promise<AdminProfileResponse> => {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);

  if (data.phone) {
    formData.append("phone", data.phone);
  }
  if (data.location) {
    formData.append("location", data.location);
  }
  if (data.bio) {
    formData.append("bio", data.bio);
  }
  if (data.profileImage) {
    formData.append("profileImage", data.profileImage);
  }
  formData.append("locations", String(data.locations));
  formData.append("totalSoldProperties", String(data.totalSoldProperties));
  formData.append("yearsOfExperinces", String(data.yearsOfExperinces));

  if (data.socialMedia) {
    formData.append("socialMedia", JSON.stringify(data.socialMedia));
  }

  if (data.availability) {
    formData.append("availability", JSON.stringify(data.availability));
  }

  const response = await apiClient<AdminProfileResponse>("/admin/auth/profile", {
    token,
    method: "PUT",
    body: formData,
  });
  return response;
};