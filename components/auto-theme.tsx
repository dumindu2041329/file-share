"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

function pickThemeByHour(date: Date = new Date()): "light" | "dark" {
  const h = date.getHours();
  return h >= 7 && h < 19 ? "light" : "dark"; // 7am - 7pm light, otherwise dark
}

export function AutoTheme() {
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("auto-theme-enabled");
      const enabled = stored === null ? true : stored === "true";
      if (!enabled) return;

      const apply = () => {
        const target = pickThemeByHour();
        if (resolvedTheme !== target) {
          setTheme(target);
        }
      };

      apply();
      const id = setInterval(apply, 5 * 60 * 1000); // every 5 minutes
      return () => clearInterval(id);
    } catch {
      // no-op if storage not available
    }
  }, [setTheme, resolvedTheme]);

  return null;
}
