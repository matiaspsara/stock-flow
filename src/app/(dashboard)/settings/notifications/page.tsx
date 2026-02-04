"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { OrganizationSettings } from "@/types/database.types";

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("organization_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      const orgId = roleRow?.[0]?.organization_id;
      if (!orgId) return;
      const { data } = await supabase.from("organization_settings").select("*").eq("organization_id", orgId).single();
      setSettings(data as OrganizationSettings);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    const supabase = createClient();
    const { error } = await supabase.from("organization_settings").update({
      notify_low_stock: settings.notify_low_stock,
      notify_out_of_stock: settings.notify_out_of_stock,
      notify_large_sale: settings.notify_large_sale,
      large_sale_threshold: settings.large_sale_threshold,
      notify_purchase_created: settings.notify_purchase_created,
      notify_email_low_stock: settings.notify_email_low_stock,
      notify_email_large_sale: settings.notify_email_large_sale
    }).eq("id", settings.id);
    if (error) return toast.error(error.message);
    toast.success("Preferencias actualizadas");
  };

  if (!settings) return <div className="text-sm text-muted-foreground">Cargando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={settings.notify_low_stock ?? false} onCheckedChange={(v) => setSettings({ ...settings, notify_low_stock: Boolean(v) })} />
          Stock bajo (in-app)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={settings.notify_out_of_stock ?? false} onCheckedChange={(v) => setSettings({ ...settings, notify_out_of_stock: Boolean(v) })} />
          Sin stock (in-app)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={settings.notify_large_sale ?? false} onCheckedChange={(v) => setSettings({ ...settings, notify_large_sale: Boolean(v) })} />
          Venta grande (in-app)
        </label>
        <Input
          type="number"
          placeholder="Umbral venta grande"
          value={settings.large_sale_threshold ?? 50000}
          onChange={(e) => setSettings({ ...settings, large_sale_threshold: Number(e.target.value) })}
        />
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={settings.notify_purchase_created ?? false} onCheckedChange={(v) => setSettings({ ...settings, notify_purchase_created: Boolean(v) })} />
          Nueva compra creada
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={settings.notify_email_low_stock ?? false} onCheckedChange={(v) => setSettings({ ...settings, notify_email_low_stock: Boolean(v) })} />
          Enviar email stock bajo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={settings.notify_email_large_sale ?? false} onCheckedChange={(v) => setSettings({ ...settings, notify_email_large_sale: Boolean(v) })} />
          Enviar email venta grande
        </label>
        <Button onClick={handleSave}>Guardar</Button>
      </CardContent>
    </Card>
  );
}
