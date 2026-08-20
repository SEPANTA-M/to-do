"use client";

import { useLocaleStore } from "@/state/locale-store";
import { translate } from "@/i18n/dictionary";

export function useT() {
  const locale = useLocaleStore((s) => s.locale);
  return (key: string) => translate(locale, key);
}

export function useLocale() {
  return useLocaleStore((s) => s.locale);
}
