"use client";

import * as React from "react";
import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";
import { CommandPalette } from "@/components/features/command-palette";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [commandOpen, setCommandOpen] = React.useState(false);
  
  return (
    <div className="min-h-screen bg-bg-primary">
      <Sidebar />
      
      <div className="lg:pl-64">
        <Header onCommandOpen={() => setCommandOpen(true)} />
        
        <main className="pb-16 lg:pb-0">
          {children}
        </main>
      </div>
      
      <MobileNav />
      
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
