"use client";

import { useRouter, useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!user) {
      router.replace(`/${locale}/login`);
    } else if (user.role !== "SUPER_ADMIN") {
      router.replace(`/${locale}/login`);
    }
  }, [user, locale, router]);

  if (!user || user.role !== "SUPER_ADMIN") {
    return null;
  }

  return <>{children}</>;
}
