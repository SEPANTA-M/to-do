import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
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
    { media: "(prefers-color-scheme: light)", color: "#f4f1ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1214" },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var raw=localStorage.getItem("nexus-theme");var theme=raw?JSON.parse(raw).state.theme:"system";var dark=theme==="dark"||(theme!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.classList.remove("light","dark");root.classList.add(dark?"dark":"light");}catch(e){}})();`,
          }}
        />
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
