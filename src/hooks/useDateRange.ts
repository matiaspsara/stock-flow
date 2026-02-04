"use client";

import { useMemo, useState } from "react";

export type DateRange = { from: string; to: string };

export function useDateRange(defaultRange: "7d" | "30d" | "today" | "month" = "30d") {
  const today = new Date();
  const [range, setRange] = useState<DateRange>(() => {
    const to = today.toISOString().slice(0, 10);
    const fromDate = new Date(today);
    if (defaultRange === "today") fromDate.setDate(today.getDate());
    if (defaultRange === "7d") fromDate.setDate(today.getDate() - 6);
    if (defaultRange === "30d") fromDate.setDate(today.getDate() - 29);
    if (defaultRange === "month") fromDate.setDate(1);
    return { from: fromDate.toISOString().slice(0, 10), to };
  });

  const label = useMemo(() => `${range.from} → ${range.to}`, [range]);

  return { range, setRange, label };
}
