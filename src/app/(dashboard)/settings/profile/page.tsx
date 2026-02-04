"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", timezone: "America/Argentina/Buenos_Aires" });

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).single();
      setForm({
        full_name: profile?.full_name ?? "",
        email: user.email ?? "",
        phone: profile?.phone ?? "",
        timezone: profile?.timezone ?? "America/Argentina/Buenos_Aires"
      });
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("users").update({
      full_name: form.full_name,
      phone: form.phone,
      timezone: form.timezone
    }).eq("id", user.id);
    if (error) return toast.error(error.message);
    toast.success("Perfil actualizado");
  };

  if (loading) return <div className="text-sm text-muted-foreground">Cargando...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi perfil</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Input placeholder="Nombre" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        <Input placeholder="Email" value={form.email} readOnly />
        <Input placeholder="Teléfono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input placeholder="Zona horaria" value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} />
        <Button onClick={handleSave}>Guardar</Button>
      </CardContent>
    </Card>
  );
}
