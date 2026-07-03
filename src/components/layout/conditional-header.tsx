"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type ConditionalHeaderProps = {
  children: ReactNode;
};

export function ConditionalHeader({ children }: ConditionalHeaderProps) {
  const pathname = usePathname();

  const isAuthPage = pathname.endsWith("/login");

  if (isAuthPage) {
    return null;
  }

  return <>{children}</>;
}
