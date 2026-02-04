"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-border p-6 text-center">
        <h2 className="text-lg font-semibold">Algo salió mal</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ocurrió un error inesperado. Intenta nuevamente.
        </p>
        <button
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          onClick={() => reset()}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}
