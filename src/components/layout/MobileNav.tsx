"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DashboardNav } from "@/components/layout/DashboardNav";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

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
          <span className="hidden sm:inline">Menú</span>
        </button>
      </DialogTrigger>
      <DialogContent className="inset-0 h-full w-full max-w-none translate-x-0 translate-y-0 content-start rounded-none p-4 sm:max-w-sm sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>StockFlow</DialogTitle>
        </DialogHeader>
        <div className="mt-1 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tema</span>
            <ThemeToggle />
          </div>
          <DashboardNav onNavigate={() => setOpen(false)} className="gap-0" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
