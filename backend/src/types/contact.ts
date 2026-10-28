export interface Country {
  name: string;
  code: string;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  countryName: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  errors?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  sort?: string;
}

export interface PaginationResult {
  currentPage: number;
  totalPages: number;
  totalContacts: number;
  hasNext: boolean;
  hasPrev: boolean;
}