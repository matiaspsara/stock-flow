"use client";

import { useMemo } from "react";
import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart, useCartTotals } from "@/hooks/useCart";
import { formatCurrency } from "@/lib/utils/currency";

export function POSCart({ onCheckout }: { onCheckout: () => void }) {
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const discount = useCart((s) => s.discount);
  const setDiscount = useCart((s) => s.setDiscount);
  const { subtotal, discountAmount, total } = useCartTotals();

  const discountValue = useMemo(() => discount.value, [discount.value]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">Nueva venta</p>
          <p className="text-lg font-semibold">Carrito</p>
        </div>
        <div className="text-xs text-muted-foreground">{items.length} items</div>
      </div>

      <div className="flex-1 overflow-auto rounded-md border border-border">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Carrito vacío - escanea o busca productos
          </div>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.product_id} className="grid grid-cols-12 items-center gap-2 p-3">
                <div className="col-span-5">
                  <p className="text-sm font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">{item.sku}</p>
                </div>
                <div className="col-span-3 flex items-center gap-1">
                  <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    className="h-8 w-14 text-center"
                    type="number"
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.product_id, Number(event.target.value))}
                  />
                  <Button size="icon" variant="ghost" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="col-span-3 text-right text-sm">{formatCurrency(item.subtotal)}</div>
                <div className="col-span-1 text-right">
                  <Button size="icon" variant="ghost" onClick={() => removeItem(item.product_id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-2 rounded-md border border-border p-3">
        <div className="flex items-center justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Descuento</span>
          <div className="flex items-center gap-2">
            <select
              className="h-8 rounded-md border border-input bg-background px-2 text-xs"
              value={discount.type}
              onChange={(event) => setDiscount({ ...discount, type: event.target.value as "amount" | "percent" })}
            >
              <option value="amount">$</option>
              <option value="percent">%</option>
            </select>
            <Input
              className="h-8 w-24 text-right"
              type="number"
              value={discountValue}
              onChange={(event) => setDiscount({ ...discount, value: Number(event.target.value) })}
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Descuento aplicado</span>
          <span>-{formatCurrency(discountAmount)}</span>
        </div>
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Button variant="outline" onClick={() => useCart.getState().clearCart()}>
          Cancelar venta
        </Button>
        <Button className="bg-emerald-600 hover:bg-emerald-600/90" onClick={onCheckout} disabled={items.length === 0}>
          Cobrar
        </Button>
      </div>
    </div>
  );
}
