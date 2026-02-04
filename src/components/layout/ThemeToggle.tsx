"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const stored = localStorage.getItem("stockflow_prefs");
    if (stored) {
      const prefs = JSON.parse(stored);
      setTheme(prefs.theme ?? "light");
    }
  }, []);

  useEffect(() => {
    const next = { theme } as { theme: Theme };
    const stored = localStorage.getItem("stockflow_prefs");
    const prefs = stored ? JSON.parse(stored) : {};
    localStorage.setItem("stockflow_prefs", JSON.stringify({ ...prefs, ...next }));

    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved = theme === "system" ? (systemDark ? "dark" : "light") : theme;
    if (resolved === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  return (
    <select
      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
      value={theme}
      onChange={(event) => setTheme(event.target.value as Theme)}
      aria-label="Tema"
    >
      <option value="light">Claro</option>
      <option value="dark">Oscuro</option>
      <option value="system">Sistema</option>
    </select>
  );
}
