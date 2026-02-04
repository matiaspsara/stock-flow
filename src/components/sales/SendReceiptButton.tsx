"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { sendReceipt } from "@/app/actions/send-receipt";
import { toast } from "sonner";

export function SendReceiptButton({ saleId, defaultEmail }: { saleId: string; defaultEmail?: string | null }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(defaultEmail ?? "");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const target = email.trim();
    if (!target || !target.includes("@")) {
      toast.error("Email inválido");
      return;
    }
    setLoading(true);
    const result = await sendReceipt(saleId, target);
    setLoading(false);
    if (result.success) {
      toast.success(`Recibo enviado a ${target}`);
      setOpen(false);
    } else {
      toast.error(result.error ?? "Error al enviar recibo");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Enviar recibo
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar recibo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="cliente@email.com" />
          <Button onClick={handleSend} disabled={loading}>
            {loading ? "Enviando..." : "Enviar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
