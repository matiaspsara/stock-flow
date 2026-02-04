"use client";

import { useEffect, useMemo, useState } from "react";
import { BarcodeScanner } from "@/components/products/BarcodeScanner";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductSearchCombobox } from "@/components/products/ProductSearchCombobox";
import { POSCart } from "@/components/pos/POSCart";
import { PaymentModal, type PaymentData } from "@/components/pos/PaymentModal";
import { useCart, useCartTotals } from "@/hooks/useCart";
import { useProducts } from "@/hooks/useProducts";
import { usePopularProducts } from "@/hooks/usePopularProducts";
import { useCreateSale } from "@/hooks/useSales";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function POSPage() {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const addItem = useCart((s) => s.addItem);
  const clearCart = useCart((s) => s.clearCart);
  const items = useCart((s) => s.items);
  const { total, subtotal, discountAmount } = useCartTotals();

  const { data: productsData } = useProducts({ pageSize: 8, search: "" });
  const { data: popularProducts = [] } = usePopularProducts();
  const createSale = useCreateSale();

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
      await createSale.mutateAsync({
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
      clearCart();
      setPaymentOpen(false);
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
          <div className="grid gap-3">
            <p className="text-sm font-medium">Productos populares</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {quickProducts.slice(0, 9).map((product) => (
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
    </div>
  );
}
