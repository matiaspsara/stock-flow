"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DashboardNav } from "@/components/layout/DashboardNav";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" />
          <span>Menú</span>
        </button>
      </DialogTrigger>
      <DialogContent className="h-full w-full max-w-none p-4 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>StockFlow</DialogTitle>
        </DialogHeader>
        <DashboardNav className="mt-2" onNavigate={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
