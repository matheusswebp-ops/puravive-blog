"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Uma visita por página por aba aberta: recarregar ou voltar pra mesma
    // página não infla o número.
    const key = `pv:${pathname}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // navegador com storage bloqueado: registra assim mesmo
    }

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // métrica nunca pode atrapalhar a leitura do post
    });
  }, [pathname]);

  return null;
}
