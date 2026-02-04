"use client";

import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const supportedFormats = ["EAN_13", "UPC_A", "CODE_128"] as const;

export function BarcodeScanner({
  open,
  onOpenChange,
  onDetected
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  onDetected: (code: string) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      setError(null);
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        if (!scannerRef.current || !isMounted) return;
        const scanner = new Html5Qrcode(scannerRef.current.id, { formatsToSupport: supportedFormats });
        instanceRef.current = scanner;
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 180 } },
          (decodedText: string) => {
            onDetected(decodedText);
            onOpenChange(false);
          },
          () => {}
        );
      } catch (err) {
        setError("No se pudo acceder a la cámara. Verifica permisos.");
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (instanceRef.current) {
        instanceRef.current.stop().catch(() => null);
        instanceRef.current.clear().catch(() => null);
        instanceRef.current = null;
      }
    };
  }, [open, onDetected, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escanear código de barras</DialogTitle>
          <DialogDescription>
            Apunta la cámara al código. Formatos compatibles: EAN-13, UPC-A, Code 128.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          {error ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          ) : (
            <div
              id="barcode-scanner"
              ref={scannerRef}
              className="h-64 w-full overflow-hidden rounded-md border border-border bg-black"
            />
          )}
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Ingresar manualmente
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
