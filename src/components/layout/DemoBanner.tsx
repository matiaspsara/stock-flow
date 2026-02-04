"use client";

import { useEffect, useState } from "react";

export function DemoBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const dismissed = localStorage.getItem("stockflow_demo_banner");
    setHidden(dismissed === "1");
  }, []);

  if (hidden) return null;

  return (
    <div className="flex items-center justify-between bg-amber-100 px-4 py-2 text-xs text-amber-900">
      <span>
        MODO DEMOSTRACIÓN - Este es un proyecto de portafolio.
      </span>
      <button
        className="text-xs underline"
        onClick={() => {
          localStorage.setItem("stockflow_demo_banner", "1");
          setHidden(true);
        }}
      >
        Ocultar
      </button>
    </div>
  );
}
