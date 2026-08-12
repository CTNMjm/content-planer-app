"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

// Reihenfolge des Durchschaltens: System -> Hell -> Dunkel -> System
const order = ["system", "light", "dark"] as const;

const labels: Record<string, string> = {
  system: "System",
  light: "Hell",
  dark: "Dunkel",
};

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Erst nach dem Mounten rendern, sonst Hydration-Mismatch (Server kennt das Theme nicht).
  useEffect(() => setMounted(true), []);

  const current = (theme && order.includes(theme as typeof order[number]) ? theme : "system") as string;

  const cycle = () => {
    const idx = order.indexOf(current as typeof order[number]);
    setTheme(order[(idx + 1) % order.length]);
  };

  const Icon = current === "light" ? Sun : current === "dark" ? Moon : Monitor;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Design: ${mounted ? labels[current] : "System"} – umschalten`}
      title={`Design: ${mounted ? labels[current] : "System"}`}
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 transition-colors"
    >
      {/* Icon erst nach Mount setzen, um SSR/Client-Unterschiede zu vermeiden */}
      {mounted ? <Icon className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
      <span className="hidden sm:inline">{mounted ? labels[current] : "System"}</span>
    </button>
  );
}
