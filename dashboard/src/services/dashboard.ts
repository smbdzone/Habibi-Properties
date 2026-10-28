import { apiClient, ApiEnvelope } from "@/lib/apiClient";
import { DashboardOverview } from "@/types/api";

export const fetchDashboardOverview = (token: string | null) =>
  apiClient<ApiEnvelope<DashboardOverview>>("/admin/dashboard/overview", {
    token: token ?? undefined,
  });

