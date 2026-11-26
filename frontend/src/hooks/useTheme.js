import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "../lib/constants.js";

function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getInitialTheme() {
  const appliedTheme = document.documentElement.dataset.theme;

  if (appliedTheme === "light" || appliedTheme === "dark") {
    return appliedTheme;
  }

  return getStoredTheme() ?? getSystemTheme();
}

export default function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    const themeColor = document.querySelector('meta[name="theme-color"]');
    themeColor?.setAttribute(
      "content",
      theme === "dark" ? "#080f13" : "#f4f6f8",
    );
  }, [theme]);

  useEffect(() => {
    if (!window.matchMedia) {
      return undefined;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event) => {
      if (!getStoredTheme()) {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";

      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {}

      return nextTheme;
    });
  }, []);

  return { theme, toggleTheme };
}
