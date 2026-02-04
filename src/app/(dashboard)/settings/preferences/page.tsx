"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function PreferencesPage() {
  const [theme, setTheme] = useState("light");
  const [currency, setCurrency] = useState("ARS");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("stockflow_prefs");
    if (stored) {
      const prefs = JSON.parse(stored);
      setTheme(prefs.theme ?? "light");
      setCurrency(prefs.currency ?? "ARS");
      setDateFormat(prefs.dateFormat ?? "DD/MM/YYYY");
    }
    setLoading(false);
  }, []);

  const handleSave = () => {
    localStorage.setItem("stockflow_prefs", JSON.stringify({ theme, currency, dateFormat }));
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    toast.success("Preferencias guardadas");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-9 w-28" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <Select value={theme} onValueChange={setTheme}>
          <SelectTrigger>
            <SelectValue placeholder="Tema" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="dark">Oscuro</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
          </SelectContent>
        </Select>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger>
            <SelectValue placeholder="Moneda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ARS">ARS ($)</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFormat} onValueChange={setDateFormat}>
          <SelectTrigger>
            <SelectValue placeholder="Formato de fecha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={handleSave}>Guardar</Button>
      </CardContent>
    </Card>
  );
}
