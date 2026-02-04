"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { OrganizationSettings } from "@/types/database.types";

export default function OrganizationSettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
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
      const { data } = await supabase.from("organization_settings").select("*").eq("organization_id", orgId).single();
      if (data) setSettings(data as OrganizationSettings);
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("organization_settings")
      .update({
        receipt_from_email: settings.receipt_from_email,
        receipt_email_footer: settings.receipt_email_footer,
        auto_send_receipt: settings.auto_send_receipt,
        cc_owner_on_receipt: settings.cc_owner_on_receipt,
        auto_print_receipt: settings.auto_print_receipt,
        auto_show_receipt_modal: settings.auto_show_receipt_modal
      })
      .eq("id", settings.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Configuración guardada");
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Cargando...</div>;
  }

  if (!settings) {
    return <div className="text-sm text-muted-foreground">No hay configuración.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de recibos</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Input
          placeholder="Email remitente (from)"
          value={settings.receipt_from_email ?? ""}
          onChange={(event) => setSettings({ ...settings, receipt_from_email: event.target.value })}
        />
        <Textarea
          placeholder="Mensaje de recibo por email"
          value={settings.receipt_email_footer ?? ""}
          onChange={(event) => setSettings({ ...settings, receipt_email_footer: event.target.value })}
        />

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={settings.auto_send_receipt ?? false}
            onCheckedChange={(value) => setSettings({ ...settings, auto_send_receipt: Boolean(value) })}
          />
          Enviar recibo automáticamente si hay email
        </label>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={settings.cc_owner_on_receipt ?? false}
            onCheckedChange={(value) => setSettings({ ...settings, cc_owner_on_receipt: Boolean(value) })}
          />
          Copiar al dueño en el recibo
        </label>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={settings.auto_show_receipt_modal ?? true}
            onCheckedChange={(value) => setSettings({ ...settings, auto_show_receipt_modal: Boolean(value) })}
          />
          Mostrar modal de recibo al finalizar la venta
        </label>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={settings.auto_print_receipt ?? false}
            onCheckedChange={(value) => setSettings({ ...settings, auto_print_receipt: Boolean(value) })}
          />
          Imprimir automáticamente
        </label>

        <Button onClick={handleSave}>Guardar</Button>
      </CardContent>
    </Card>
  );
}
