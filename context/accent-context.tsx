"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type AccentTheme = "blue" | "purple" | "emerald" | "orange" | "crimson";

export interface AccentThemeConfig {
  id: AccentTheme;
  name: string;
  colorClass: string;
  activeBorder: string;
  previewBg: string;
}

export const ACCENT_THEMES: Record<AccentTheme, AccentThemeConfig> = {
  blue: {
    id: "blue",
    name: "Ocean Blue",
    colorClass: "text-blue-600 dark:text-blue-400",
    activeBorder: "border-blue-500",
    previewBg: "bg-blue-500",
  },
  purple: {
    id: "purple",
    name: "Royal Purple",
    colorClass: "text-purple-600 dark:text-purple-400",
    activeBorder: "border-purple-500",
    previewBg: "bg-purple-500",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Green",
    colorClass: "text-emerald-600 dark:text-emerald-400",
    activeBorder: "border-emerald-500",
    previewBg: "bg-emerald-500",
  },
  orange: {
    id: "orange",
    name: "Sunset Orange",
    colorClass: "text-orange-600 dark:text-orange-400",
    activeBorder: "border-orange-500",
    previewBg: "bg-orange-500",
  },
  crimson: {
    id: "crimson",
    name: "Crimson Red",
    colorClass: "text-rose-600 dark:text-rose-400",
    activeBorder: "border-rose-500",
    previewBg: "bg-rose-500",
  },
};

interface AccentContextType {
  accent: AccentTheme;
  setAccent: (accent: AccentTheme) => void;
}

const AccentContext = createContext<AccentContextType | undefined>(undefined);

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentTheme>("blue");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("vibhanu_accent_theme") as AccentTheme;
      if (saved && ACCENT_THEMES[saved]) {
        setAccentState(saved);
        document.documentElement.setAttribute("data-accent", saved);
      } else {
        document.documentElement.setAttribute("data-accent", "blue");
      }
    } catch (_) {}
  }, []);

  const setAccent = (newAccent: AccentTheme) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem("vibhanu_accent_theme", newAccent);
      document.documentElement.setAttribute("data-accent", newAccent);
    } catch (_) {}
  };

  return (
    <AccentContext.Provider value={{ accent, setAccent }}>
      {children}
    </AccentContext.Provider>
  );
}

export function useAccentTheme() {
  const context = useContext(AccentContext);
  if (!context) {
    return { accent: "blue" as AccentTheme, setAccent: () => {} };
  }
  return context;
}
