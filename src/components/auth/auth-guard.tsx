"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

type AuthGuardProps = {
  locale: string;
  children: ReactNode;
};

export function AuthGuard({ locale, children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isProtectedRoute =
    pathname === `/${locale}/dashboard` ||
    pathname.startsWith(`/${locale}/admin`) ||
    pathname.startsWith(`/${locale}/customer`);

  // Initialize state based on whether the route is protected or not
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(() => {
    return isProtectedRoute ? null : true;
  });

  useEffect(() => {
    if (!isProtectedRoute) {
      return;
    }

    let isMounted = true;

    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success && isMounted) {
            setIsAuthenticated(true);
            return;
          }
        }
        
        if (isMounted) {
          setIsAuthenticated(false);
          router.replace(`/login?locale=${encodeURIComponent(locale)}`);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        if (isMounted) {
          setIsAuthenticated(false);
          router.replace(`/login?locale=${encodeURIComponent(locale)}`);
        }
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [isProtectedRoute, locale, router, pathname]);

  if (!isProtectedRoute) {
    return children;
  }

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-slate-500" />
      </div>
    );
  }

  return children;
}
