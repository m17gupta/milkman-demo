"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAreas } from "@/store/slices/areaSlice/areaThunks";

export function GetAllArea() {
  const locale = useLocale() as "en" | "hi" | "pa";
  const dispatch = useAppDispatch();
  const { listArea, loading, error, isFetchedArea } = useAppSelector((s) => s.areas);

  useEffect(() => {
    if (!isFetchedArea) dispatch(fetchAreas());
  }, [dispatch, isFetchedArea]);



  return (
    null
  )
}
