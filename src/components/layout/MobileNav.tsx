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
        <button className="lg:hidden rounded-md p-2 hover:bg-accent" aria-label="Abrir menú">
          <Menu className="h-5 w-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-xs p-4">
        <DialogHeader>
          <DialogTitle>Menú</DialogTitle>
        </DialogHeader>
        <DashboardNav className="mt-2" />
      </DialogContent>
    </Dialog>
  );
}
