"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const locale = window.location.pathname.split("/")[1] || "en";

    async function checkRedirect() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            if (data.user.role === "ADMIN" || data.user.role === "SUPER_ADMIN") {
              router.replace(`/${locale}/admin/dashboard`);
              return;
            } else if (data.user.role === "CUSTOMER") {
              router.replace(`/${locale}/customer/dashboard`);
              return;
            }
          }
        }
        router.replace("/login?locale=" + encodeURIComponent(locale));
      } catch (err) {
        console.error("Redirect check failed:", err);
        router.replace("/login?locale=" + encodeURIComponent(locale));
      }
    }

    checkRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
    </div>
  );
}
