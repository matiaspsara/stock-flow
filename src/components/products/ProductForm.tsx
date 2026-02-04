"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductFormValues } from "@/lib/validations/product.schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createClient } from "@/lib/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { toast } from "sonner";
import type { Product } from "@/types/database.types";
import { BarcodeScanner } from "@/components/products/BarcodeScanner";
import { Skeleton } from "@/components/ui/skeleton";

const unitOptions = ["unidad", "kg", "litro", "caja", "pack"];

function makeSku(categoryName?: string) {
  const prefix = categoryName ? categoryName.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() : "CAT";
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefix}-${random}`;
}

async function resizeImage(file: File) {
  const img = document.createElement("img");
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  img.src = dataUrl;
  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const maxSize = 800;
  const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
  const canvas = document.createElement("canvas");
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;

  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) return file;

  return new File([blob], file.name.replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg"), { type: "image/jpeg" });
}

function extractStoragePath(url?: string | null) {
  if (!url) return null;
  const marker = "/product-images/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length);
}

export function ProductForm({
  initialData,
  onSuccess,
  mode
}: {
  initialData?: Partial<Product>;
  onSuccess?: () => void;
  mode: "create" | "edit";
}) {
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      sku: initialData?.sku ?? "",
      barcode: initialData?.barcode ?? "",
      category_id: initialData?.category_id ?? "",
      cost_price: initialData?.cost_price ?? 0,
      selling_price: initialData?.selling_price ?? 0,
      current_stock: initialData?.current_stock ?? 0,
      min_stock_threshold: initialData?.min_stock_threshold ?? 5,
      unit: initialData?.unit ?? "unidad",
      image_url: initialData?.image_url ?? "",
      is_active: initialData?.is_active ?? true
    }
  });

  const sellingPriceWarning = useMemo(() => {
    const cost = Number(form.watch("cost_price"));
    const price = Number(form.watch("selling_price"));
    return price > 0 && price < cost;
  }, [form]);

  const watchedCost = form.watch("cost_price");
  useEffect(() => {
    if (mode === "create" && !form.getValues("selling_price")) {
      const cost = Number(watchedCost);
      if (cost > 0) {
        form.setValue("selling_price", Math.round(cost * 1.5));
      }
    }
  }, [form, mode, watchedCost]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const supabase = createClient();
      const previousPath = extractStoragePath(
        form.getValues("image_url") || initialData?.image_url || undefined
      );
      const resized = await resizeImage(file);
      const filename = `${Date.now()}-${resized.name}`;
      const { data, error } = await supabase.storage.from("product-images").upload(filename, resized, {
        cacheControl: "3600",
        upsert: true
      });
      if (error) throw error;
      const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(data.path);
      form.setValue("image_url", publicUrl.publicUrl);
      setPreviewUrl(publicUrl.publicUrl);
      if (previousPath && previousPath !== data.path) {
        await supabase.storage.from("product-images").remove([previousPath]);
      }
    } catch (err: any) {
      toast.error("No se pudo subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const supabase = createClient();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("organization_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const orgId = roleRow?.[0]?.organization_id;
      if (!orgId) throw new Error("Sin organización");

      const { data: existingSku } = await supabase
        .from("products")
        .select("id")
        .eq("organization_id", orgId)
        .eq("sku", values.sku)
        .limit(1);

      if (existingSku && existingSku.length > 0 && existingSku[0].id !== initialData?.id) {
        toast.error("El SKU ya existe en tu organización.");
        return;
      }

      if (mode === "create") {
        const { error } = await supabase.from("products").insert({
          ...values,
          organization_id: orgId,
          created_by: user.id
        });
        if (error) throw error;
        toast.success("Producto creado correctamente");
      } else if (initialData?.id) {
        const { error } = await supabase
          .from("products")
          .update({
            ...values
          })
          .eq("id", initialData.id);
        if (error) throw error;
        toast.success("Producto actualizado");
      }
      router.refresh();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err?.message ?? "No se pudo guardar el producto");
    }
  });

  const categoryName = categories?.find((cat) => cat.id === form.watch("category_id"))?.name;

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={onSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Lapicera BIC Cristal Azul" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder="Detalles del producto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input placeholder="SKU" {...field} />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.setValue("sku", makeSku(categoryName))}
                    >
                      Auto
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input placeholder="Código de barras" {...field} />
                    <Button type="button" variant="outline" onClick={() => setScannerOpen(true)}>
                      Escanear
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              {loadingCategories ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories && categories.length > 0 ? (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__empty__" disabled>
                        No hay categorías disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="cost_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de costo</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="selling_price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de venta</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {sellingPriceWarning && (
          <Alert variant="warning">
            <AlertDescription>
              El precio de venta es menor al costo. Se recomienda ajustar el margen.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="current_stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{mode === "create" ? "Stock inicial" : "Stock"}</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} disabled={mode === "edit"} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="min_stock_threshold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mínimo de stock</FormLabel>
                <FormControl>
                  <Input type="number" step="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad</FormLabel>
                <FormControl>
                  <Input placeholder="unidad" list="unit-list" {...field} />
                </FormControl>
                <datalist id="unit-list">
                  {unitOptions.map((unit) => (
                    <option key={unit} value={unit} />
                  ))}
                </datalist>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activo</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(Boolean(value))} />
                    <span className="text-sm text-muted-foreground">Producto disponible</span>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="image_url"
          render={() => (
            <FormItem>
              <FormLabel>Imagen del producto</FormLabel>
              <FormControl>
                <div className="grid gap-3">
                  {previewUrl ? (
                    <div className="relative h-40 w-full overflow-hidden rounded-md border border-border">
                      <Image src={previewUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                    disabled={uploading}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={loadingCategories}>
          {mode === "create" ? "Crear producto" : "Guardar cambios"}
        </Button>
      </form>

      <BarcodeScanner
        open={scannerOpen}
        onOpenChange={setScannerOpen}
        onDetected={(code) => form.setValue("barcode", code)}
      />
    </Form>
  );
}
