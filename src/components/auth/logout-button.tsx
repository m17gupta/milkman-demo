"use client";

import { LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type LogoutButtonProps = {
  locale: string;
};

export function LogoutButton({ locale }: LogoutButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const data = await response.json();
          if (data.success && isMounted) {
            setIsLoggedIn(true);
            return;
          }
        }
        if (isMounted) {
          setIsLoggedIn(false);
        }
      } catch (err) {
        if (isMounted) {
          setIsLoggedIn(false);
        }
      }
    }
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, [pathname, locale]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        setIsLoggedIn(false);
        router.replace(`/${locale}/login`);
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Logout</span>
    </button>
  );
}
