"use client";

import { useEffect, useState } from "react";
import { TbMoon, TbSun } from "react-icons/tb";

const STORAGE_KEY = "ordemnext-theme";

/** Inline script for <head>: applies the saved theme before first paint. */
export const themeScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t==="dark"||(!t&&window.matchMedia("(prefers-color-scheme: dark)").matches)){document.documentElement.classList.add("dark")}}catch(e){}})();`;

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // storage unavailable (private mode): the choice just isn't remembered
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
      className="flex h-10 w-10 items-center justify-center rounded-full text-xl text-link transition-colors hover:bg-lightprimary hover:text-primary"
    >
      {dark ? <TbSun /> : <TbMoon />}
    </button>
  );
}
