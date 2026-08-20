import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Locale } from "@/i18n/dictionary";
import { localeDir } from "@/i18n/dictionary";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  return navigator.language.toLowerCase().startsWith("fa") ? "fa" : "en";
}

function applyLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = localeDir(locale);
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => {
        set({ locale });
        applyLocale(locale);
      },
    }),
    {
      name: "nexus-locale",
      merge: (persisted, current) => {
        const stored = persisted as Partial<LocaleState> | undefined;
        const locale = stored?.locale ?? detectLocale();
        return { ...current, ...stored, locale };
      },
      onRehydrateStorage: () => (state) => {
        applyLocale(state?.locale ?? detectLocale());
      },
    }
  )
);
