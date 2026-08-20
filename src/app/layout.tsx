import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: "NEXUS — Spatial Productivity",
  description:
    "A personal productivity operating system. Tasks, projects, goals, day flow, focus, and insights — local-first.",
  applicationName: "NEXUS",
  manifest: "/manifest.webmanifest",
  robots: { index: false, follow: false },
  icons: {
    icon: "/icons/icon.svg",
    apple: "/icons/icon.svg",
  },
  openGraph: {
    title: "NEXUS — Spatial Productivity",
    description: "Turn chaos into visible flow.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    title: "NEXUS",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var root=document.documentElement;var raw=localStorage.getItem("nexus-theme");var theme=raw?JSON.parse(raw).state.theme:"system";var dark=theme==="dark"||(theme!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);root.classList.remove("light","dark");root.classList.add(dark?"dark":"light");var loc="en";var locRaw=localStorage.getItem("nexus-locale");if(locRaw){loc=JSON.parse(locRaw).state.locale||loc;}else if((navigator.language||"").toLowerCase().indexOf("fa")===0){loc="fa";}root.setAttribute("lang",loc);root.setAttribute("dir",loc==="fa"?"rtl":"ltr");}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <LocaleProvider>
            <AppShell>{children}</AppShell>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
