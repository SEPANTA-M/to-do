"use client";

import Link from "next/link";
import {
  Target,
  Calendar,
  BarChart3,
  StickyNote,
  Settings,
  Moon,
  Sun,
  Zap,
  Map,
  ClipboardCheck,
} from "lucide-react";
import { Separator } from "@/components/primitives/separator";
import { useThemeStore } from "@/state/theme-store";
import { Button } from "@/components/primitives/button";
import { useT } from "@/i18n/use-t";
import { useLocaleStore } from "@/state/locale-store";

export default function MenuPage() {
  const { resolvedTheme, setTheme } = useThemeStore();
  const t = useT();
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-xl font-medium tracking-tight text-text-primary mb-2">{t("nav.more")}</h1>
      </header>

      <div className="space-y-6">
        <div className="bg-bg-elevated border border-border-primary rounded-md overflow-hidden">
          <MenuLink href="/focus" icon={<Zap className="h-5 w-5" />} title={t("nav.focus")} />
          <Separator />
          <MenuLink href="/goals" icon={<Target className="h-5 w-5" />} title={t("nav.goals")} />
          <Separator />
          <MenuLink href="/calendar" icon={<Calendar className="h-5 w-5" />} title={t("nav.calendar")} />
          <Separator />
          <MenuLink href="/life-map" icon={<Map className="h-5 w-5" />} title={t("nav.lifeMap")} />
          <Separator />
          <MenuLink href="/insights" icon={<BarChart3 className="h-5 w-5" />} title={t("nav.insights")} />
          <Separator />
          <MenuLink href="/review" icon={<ClipboardCheck className="h-5 w-5" />} title={t("nav.review")} />
          <Separator />
          <MenuLink href="/notes" icon={<StickyNote className="h-5 w-5" />} title={t("nav.notes")} />
          <Separator />
          <MenuLink href="/settings" icon={<Settings className="h-5 w-5" />} title={t("nav.settings")} />
        </div>

        <div className="bg-bg-elevated border border-border-primary rounded-md p-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">{t("settings.language")}</span>
            <Button variant="secondary" size="sm" onClick={() => setLocale(locale === "fa" ? "en" : "fa")}>
              {locale === "fa" ? t("settings.english") : t("settings.persian")}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {resolvedTheme === "dark" ? (
                <Moon className="h-5 w-5 text-text-secondary" />
              ) : (
                <Sun className="h-5 w-5 text-text-secondary" />
              )}
              <span className="text-sm font-medium text-text-primary">
                {resolvedTheme === "dark" ? t("settings.dark") : t("settings.light")}
              </span>
            </div>
            <Button variant="secondary" size="sm" onClick={toggleTheme}>
              {t("theme.toggle")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MenuLink({
  href,
  icon,
  title,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 min-h-11 hover:bg-bg-secondary transition-colors"
    >
      <span className="text-text-secondary">{icon}</span>
      <span className="text-sm font-medium text-text-primary">{title}</span>
    </Link>
  );
}
