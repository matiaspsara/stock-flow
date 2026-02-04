"use client";

import { useMemo } from "react";
import type { DateRange } from "@/hooks/useDateRange";

export function useComparison(range: DateRange, enabled: boolean) {
  return useMemo(() => {
    if (!enabled) return null;
    const from = new Date(range.from);
    const to = new Date(range.to);
    const diffDays = Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
    const prevTo = new Date(from);
    prevTo.setDate(prevTo.getDate() - 1);
    const prevFrom = new Date(prevTo);
    prevFrom.setDate(prevFrom.getDate() - diffDays);
    return { from: prevFrom.toISOString().slice(0, 10), to: prevTo.toISOString().slice(0, 10) };
  }, [range, enabled]);
}
