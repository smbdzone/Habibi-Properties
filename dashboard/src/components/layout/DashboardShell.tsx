"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "@/context/AuthContext";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

const AUTH_FREE_ROUTES = ["/login"];

export const DashboardShell = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { token, loading } = useAuth();

  const isAuthRoute = AUTH_FREE_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading) return;
    if (!token && !isAuthRoute) {
      router.replace("/login");
    } else if (token && isAuthRoute) {
      router.replace("/");
    }
  }, [loading, token, isAuthRoute, router]);

  if (isAuthRoute) {
    return <div className="min-h-screen w-full bg-ivory">{children}</div>;
  }

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  if (!token) {
    return null;
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-ivory p-6">{children}</main>
      </div>
    </div>
  );
};

