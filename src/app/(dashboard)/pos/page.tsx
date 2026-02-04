"use client";

import { useEffect, useMemo, useState } from "react";
import { BarcodeScanner } from "@/components/products/BarcodeScanner";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSearchCombobox } from "@/components/products/ProductSearchCombobox";
import { POSCart } from "@/components/pos/POSCart";
import { PaymentModal, type PaymentData } from "@/components/pos/PaymentModal";
import { ReceiptModal, type ReceiptModalData } from "@/components/pos/ReceiptModal";
import { useCart, useCartTotals } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { usePopularProducts } from "@/hooks/usePopularProducts";
import { useCreateSale } from "@/hooks/useSales";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { OrganizationSettings } from "@/types/database.types";
import { sendReceipt } from "@/app/actions/send-receipt";
import { useCreateNotification } from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";

export default function POSPage() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptModalData | null>(null);
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const addItem = useCart((s) => s.addItem);
  const clearCart = useCart((s) => s.clearCart);
  const items = useCart((s) => s.items);
  const { total, subtotal, discountAmount } = useCartTotals();

  const { data: productsData, isLoading: loadingProducts } = useProducts({ pageSize: 8, search: "" });
  const { data: popularProducts = [], isLoading: loadingPopular } = usePopularProducts();
  const createSale = useCreateSale();
  const createNotification = useCreateNotification();

  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("organization_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const orgId = roleRow?.[0]?.organization_id;
      if (!orgId) return;
      const { data } = await supabase
        .from("organization_settings")
        .select("*")
        .eq("organization_id", orgId)
        .single();
      if (data) setSettings(data as OrganizationSettings);
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "F2") {
        event.preventDefault();
        setScannerOpen(true);
      }
      if (event.key === "Escape") {
        setScannerOpen(false);
        setPaymentOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleScan = (code: string) => {
    const product = productsData?.data?.find((p) => p.barcode === code || p.sku === code);
    if (!product) {
      toast.error("Producto no encontrado");
      return;
    }
    addItem({
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      unit_price: Number(product.selling_price),
      current_stock: product.current_stock
    });
  };

  const handleCheckout = async (payment: PaymentData) => {
    try {
      const saleId = await createSale.mutateAsync({
        items,
        discount_amount: discountAmount,
        total_amount: subtotal,
        final_amount: total,
        payment_method:
          payment.method === "debit" || payment.method === "credit"
            ? "card"
            : payment.method === "transfer"
            ? "transfer"
            : payment.method === "account"
            ? "credit"
            : "cash",
        payment_status: "paid",
        customer_name: payment.customerName,
        customer_email: payment.customerEmail,
        customer_phone: payment.customerPhone,
        notes: payment.notes
      });
      toast.success("Venta registrada");
      setPaymentOpen(false);
      const supabase = createClient();
      const { data: sale } = await supabase
        .from("sales")
        .select("*, users(full_name)")
        .eq("id", saleId)
        .single();

      setReceiptData({
        saleId: String(saleId),
        saleNumber: sale?.sale_number ?? "PENDIENTE",
        createdAt: sale?.created_at ?? new Date().toISOString(),
        storeName: settings?.store_name ?? "StockFlow",
        storeAddress: settings?.store_address,
        taxId: settings?.tax_id,
        phone: settings?.phone,
        sellerName: sale?.users?.full_name ?? null,
        items: items.map((item) => ({ name: item.product_name, quantity: item.quantity, subtotal: item.subtotal })),
        subtotal,
        discount: discountAmount,
        total,
        paymentMethod: payment.method,
        customerEmail: payment.customerEmail,
        receiptFooter: settings?.receipt_footer ?? null,
        autoPrint: settings?.auto_print_receipt ?? false
      });
      if (settings?.auto_show_receipt_modal ?? true) setReceiptOpen(true);
      if (payment.customerEmail && settings?.auto_send_receipt) {
        try {
          await sendReceipt(String(saleId), payment.customerEmail);
        } catch (err) {
          toast.error("Error al enviar recibo");
        }
      }
      if (total >= 50000) {
        await createNotification.mutateAsync({
          type: "system",
          title: "Venta grande",
          message: `Venta registrada por ${total}`,
          reference_id: String(saleId),
          is_read: false
        });
      }
      clearCart();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo completar la venta");
    }
  };

  const quickProducts = useMemo(() => {
    if (popularProducts.length > 0) return popularProducts;
    return productsData?.data ?? [];
  }, [popularProducts, productsData]);

  return (
    <div className="grid gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="grid gap-4 rounded-xl border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Búsqueda rápida</p>
              <p className="text-lg font-semibold">Productos</p>
            </div>
            <Button variant="outline" onClick={() => setScannerOpen(true)}>
              Escanear (F2)
            </Button>
          </div>
          {loadingProducts ? (
            <div className="grid gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <ProductSearchCombobox
              products={productsData?.data ?? []}
              onSelect={(product) =>
                addItem({
                  product_id: product.id,
                  product_name: product.name,
                  sku: product.sku,
                  unit_price: Number(product.selling_price),
                  current_stock: product.current_stock
                })
              }
            />
          )}
          <div className="grid gap-3">
            <p className="text-sm font-medium">Productos populares</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {loadingProducts || loadingPopular
                ? Array.from({ length: 6 }).map((_, index) => (
                    <div key={`pos-skel-${index}`} className="rounded-md border p-3">
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="mt-2 h-4 w-3/4" />
                      <Skeleton className="mt-1 h-3 w-1/2" />
                    </div>
                  ))
                : quickProducts.slice(0, 9).map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() =>
                        addItem({
                          product_id: product.id,
                          product_name: product.name,
                          sku: product.sku,
                          unit_price: Number(product.selling_price),
                          current_stock: product.current_stock
                        })
                      }
                    >
                      <ProductCard product={product} />
                    </button>
                  ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-4">
          <POSCart onCheckout={() => setPaymentOpen(true)} />
        </div>
      </div>

      <BarcodeScanner open={scannerOpen} onOpenChange={setScannerOpen} onDetected={handleScan} />
      <PaymentModal open={paymentOpen} onOpenChange={setPaymentOpen} onConfirm={handleCheckout} />
      <ReceiptModal open={receiptOpen} onOpenChange={setReceiptOpen} data={receiptData} />
    </div>
  );
}
