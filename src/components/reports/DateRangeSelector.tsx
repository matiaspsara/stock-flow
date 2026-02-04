"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { DateRange } from "@/hooks/useDateRange";

const presets: { label: string; days: number | "month" | "today" }[] = [
  { label: "Hoy", days: "today" },
  { label: "Últimos 7 días", days: 7 },
  { label: "Últimos 30 días", days: 30 },
  { label: "Este mes", days: "month" }
];

export function DateRangeSelector({
  value,
  onChange
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const [from, setFrom] = useState(value.from);
  const [to, setTo] = useState(value.to);
  const [open, setOpen] = useState(false);

  const applyPreset = (preset: typeof presets[number]) => {
    const today = new Date();
    let fromDate = new Date(today);
    if (preset.days === "today") {
      fromDate = new Date(today);
    } else if (preset.days === "month") {
      fromDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else {
      fromDate.setDate(today.getDate() - (preset.days - 1));
    }
    const next = {
      from: fromDate.toISOString().slice(0, 10),
      to: today.toISOString().slice(0, 10)
    };
    setFrom(next.from);
    setTo(next.to);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="hidden flex-wrap gap-2 md:flex">
        {presets.map((preset) => (
          <Button key={preset.label} variant="outline" onClick={() => applyPreset(preset)}>
            {preset.label}
          </Button>
        ))}
      </div>
      <div className="hidden items-center gap-2 md:flex">
        <input
          type="date"
          value={from}
          onChange={(event) => {
            setFrom(event.target.value);
            onChange({ from: event.target.value, to });
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground dark:[color-scheme:dark]"
        />
        <span className="text-sm text-muted-foreground">→</span>
        <input
          type="date"
          value={to}
          onChange={(event) => {
            setTo(event.target.value);
            onChange({ from, to: event.target.value });
          }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground dark:[color-scheme:dark]"
        />
      </div>

      <div className="md:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              Rango de fechas
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Selecciona un rango</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="flex flex-wrap gap-2">
                {presets.map((preset) => (
                  <Button
                    key={preset.label}
                    variant="outline"
                    onClick={() => {
                      applyPreset(preset);
                      setOpen(false);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="grid gap-2">
                <input
                  type="date"
                  value={from}
                  onChange={(event) => {
                    setFrom(event.target.value);
                    onChange({ from: event.target.value, to });
                  }}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground dark:[color-scheme:dark]"
                />
                <input
                  type="date"
                  value={to}
                  onChange={(event) => {
                    setTo(event.target.value);
                    onChange({ from, to: event.target.value });
                  }}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground dark:[color-scheme:dark]"
                />
              </div>
              <Button onClick={() => setOpen(false)}>Listo</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
