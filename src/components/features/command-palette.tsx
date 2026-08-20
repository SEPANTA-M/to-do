"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import { Search, Inbox, ListTodo, Target, Calendar, StickyNote, Settings, Moon, Sun, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/state/theme-store";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const { theme, setTheme } = useThemeStore();
  const [search, setSearch] = React.useState("");
  
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);
  
  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );
  
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[1200] bg-bg-overlay"
          onClick={() => onOpenChange(false)}
        />
      )}
      
      <CommandPrimitive.Dialog
        open={open}
        onOpenChange={onOpenChange}
        className={cn(
          "fixed left-[50%] top-[20%] z-[1300] w-full max-w-2xl translate-x-[-50%] translate-y-[-20%]",
          "overflow-hidden rounded-lg border border-border-secondary bg-bg-elevated shadow-xl",
          "animate-slide-in-from-top"
        )}
        label="Command Menu"
      >
        <div className="flex items-center border-b border-border-primary px-4">
          <Search className="mr-2 h-4 w-4 shrink-0 text-text-tertiary" />
          <CommandPrimitive.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-text-tertiary"
          />
        </div>
        
        <CommandPrimitive.List className="max-h-[400px] overflow-y-auto p-2">
          <CommandPrimitive.Empty className="py-6 text-center text-sm text-text-secondary">
            No results found.
          </CommandPrimitive.Empty>
          
          <CommandPrimitive.Group heading="Navigation" className="mb-2">
            <CommandGroupHeading>Navigation</CommandGroupHeading>
            
            <CommandItem
              onSelect={() => runCommand(() => router.push("/"))}
            >
              <Inbox className="mr-2 h-4 w-4" />
              Today
            </CommandItem>
            
            <CommandItem
              onSelect={() => runCommand(() => router.push("/tasks"))}
            >
              <ListTodo className="mr-2 h-4 w-4" />
              All Tasks
            </CommandItem>
            
            <CommandItem
              onSelect={() => runCommand(() => router.push("/projects"))}
            >
              <Target className="mr-2 h-4 w-4" />
              Projects
            </CommandItem>
            
            <CommandItem
              onSelect={() => runCommand(() => router.push("/goals"))}
            >
              <Target className="mr-2 h-4 w-4" />
              Goals
            </CommandItem>
            
            <CommandItem
              onSelect={() => runCommand(() => router.push("/calendar"))}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Calendar
            </CommandItem>
            
            <CommandItem
              onSelect={() => runCommand(() => router.push("/notes"))}
            >
              <StickyNote className="mr-2 h-4 w-4" />
              Notes
            </CommandItem>
            
            <CommandItem
              onSelect={() => runCommand(() => router.push("/settings"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </CommandItem>
          </CommandPrimitive.Group>
          
          <CommandPrimitive.Separator className="h-[1px] bg-border-primary my-2" />
          
          <CommandPrimitive.Group heading="Theme">
            <CommandGroupHeading>Theme</CommandGroupHeading>
            
            <CommandItem
              onSelect={() => runCommand(() => setTheme("light"))}
            >
              <Sun className="mr-2 h-4 w-4" />
              Light
              {theme === "light" && <span className="ml-auto text-xs">✓</span>}
            </CommandItem>
            
            <CommandItem
              onSelect={() => runCommand(() => setTheme("dark"))}
            >
              <Moon className="mr-2 h-4 w-4" />
              Dark
              {theme === "dark" && <span className="ml-auto text-xs">✓</span>}
            </CommandItem>
            
            <CommandItem
              onSelect={() => runCommand(() => setTheme("system"))}
            >
              <Monitor className="mr-2 h-4 w-4" />
              System
              {theme === "system" && <span className="ml-auto text-xs">✓</span>}
            </CommandItem>
          </CommandPrimitive.Group>
        </CommandPrimitive.List>
      </CommandPrimitive.Dialog>
    </>
  );
}

function CommandGroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 py-1.5 text-xs font-medium text-text-tertiary">
      {children}
    </div>
  );
}

interface CommandItemProps {
  onSelect: () => void;
  children: React.ReactNode;
}

function CommandItem({ onSelect, children }: CommandItemProps) {
  return (
    <CommandPrimitive.Item
      onSelect={onSelect}
      className={cn(
        "relative flex cursor-pointer items-center rounded-md px-2 py-2 text-sm",
        "text-text-primary outline-none transition-colors",
        "hover:bg-bg-secondary data-[selected=true]:bg-bg-secondary",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50"
      )}
    >
      {children}
    </CommandPrimitive.Item>
  );
}
