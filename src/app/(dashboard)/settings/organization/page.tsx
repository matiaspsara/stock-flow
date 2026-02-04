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
import { Skeleton } from "@/components/ui/skeleton";

export default function OrganizationSettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          setError("Sesión no disponible.");
          return;
        }
        const { data: roleRow, error: roleError } = await supabase
          .from("user_roles")
          .select("organization_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (roleError) throw roleError;
        const orgId = roleRow?.[0]?.organization_id;
        if (!orgId) {
          setError("No se encontró organización asociada.");
          return;
        }
        const { data, error: settingsError } = await supabase
          .from("organization_settings")
          .select("*")
          .eq("organization_id", orgId)
          .single();
        if (settingsError) throw settingsError;
        if (data) setSettings(data as OrganizationSettings);
      } catch (err: any) {
        console.error(err);
        setError(err?.message ?? "No se pudo cargar la configuración.");
      } finally {
        setLoading(false);
      }
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
    return (
      <Card>
        <CardHeader>
          <CardTitle>Configuración de recibos</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`receipt-skel-${index}`} className="h-6 w-full" />
          ))}
          <Skeleton className="h-9 w-28" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <div className="text-sm text-destructive">{error}</div>;
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
