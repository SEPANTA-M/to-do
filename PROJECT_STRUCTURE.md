# NEXUS Project Structure

This document explains the organization of the NEXUS codebase and the purpose of each directory.

---

## Overview

```
nexus/
├── src/                        # Source code
├── public/                     # Static assets
├── node_modules/               # Dependencies
├── .next/                      # Next.js build output
├── package.json                # Dependencies & scripts
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind config
├── next.config.ts              # Next.js config
├── drizzle.config.json         # Drizzle ORM config
├── .env                        # Environment variables
├── README.md                   # Project overview
├── ARCHITECTURE.md             # Architecture docs
├── DESIGN_SYSTEM.md            # Design system guide
└── PROJECT_STRUCTURE.md        # This file
```

---

## Source Directory (`src/`)

### `src/app/` - Next.js App Router

Next.js 13+ App Router structure. Each folder represents a route.

```
app/
├── layout.tsx              # Root layout (wraps all pages)
├── page.tsx                # Home page (/)
├── globals.css             # Global styles + theme
│
├── api/                    # API routes
│   └── health/
│       └── route.ts        # Health check endpoint
│
├── tasks/                  # /tasks route
│   └── page.tsx
├── projects/               # /projects route
│   └── page.tsx
├── goals/                  # /goals route
│   └── page.tsx
├── calendar/               # /calendar route
│   └── page.tsx
├── focus/                  # /focus route
│   └── page.tsx
├── insights/               # /insights route
│   └── page.tsx
├── notes/                  # /notes route
│   └── page.tsx
├── settings/               # /settings route
│   └── page.tsx
└── menu/                   # /menu route (mobile)
    └── page.tsx
```

**Conventions:**
- `layout.tsx` - Shared layout for route segment
- `page.tsx` - Page component (actual route)
- `loading.tsx` - Loading UI (future)
- `error.tsx` - Error boundary (future)

---

### `src/components/` - React Components

Organized by component type and purpose.

```
components/
├── primitives/             # Base components (Radix-based)
│   ├── button.tsx          # Button with variants
│   └── separator.tsx       # Divider/separator
│
├── core/                   # Design system components
│   └── empty-state.tsx     # Empty state pattern
│
├── features/               # Feature-specific components
│   └── command-palette.tsx # ⌘K command menu
│
├── layout/                 # Layout components
│   ├── app-shell.tsx       # Main application wrapper
│   ├── sidebar.tsx         # Desktop sidebar
│   ├── mobile-nav.tsx      # Mobile bottom navigation
│   └── header.tsx          # Mobile header
│
└── providers/              # Context providers
    └── theme-provider.tsx  # Theme initialization
```

**Component Categories:**

#### Primitives (`primitives/`)
Low-level, reusable components based on Radix UI:
- Buttons
- Inputs
- Dialogs
- Dropdowns
- Separators
- etc.

**Characteristics:**
- No business logic
- Highly reusable
- Accept variant props
- Style via class-variance-authority

#### Core (`core/`)
Design system components:
- Empty states
- Loading states
- Error states
- Cards
- Badges
- etc.

**Characteristics:**
- Built from primitives
- Follow design system
- Reusable patterns
- No feature-specific logic

#### Features (`features/`)
Feature-specific components:
- Command palette
- Task list (future)
- Calendar widget (future)
- Focus timer (future)

**Characteristics:**
- Feature-focused
- May include business logic
- Composed from core/primitives
- Domain-aware

#### Layout (`layout/`)
Structural components:
- Application shell
- Navigation
- Headers
- Footers

**Characteristics:**
- Define page structure
- Handle responsive behavior
- Manage global UI state

#### Providers (`providers/`)
React context providers:
- Theme provider
- Auth provider (future)
- Settings provider (future)

**Characteristics:**
- Wrap application
- Provide global state/context
- Handle side effects

---

### `src/design-system/` - Design Tokens

Design system token definitions (not components).

```
design-system/
├── tokens.ts               # Spacing, typography, etc.
└── colors.ts               # Color system (light/dark)
```

**Purpose:**
- Single source of truth for design values
- Type-safe design tokens
- Reference for documentation
- Not directly used in components (use CSS vars instead)

**Usage:**
```tsx
// Don't use directly in components
import { tokens } from '@/design-system/tokens';

// Instead, use Tailwind classes or CSS vars
<div className="p-4 text-base" />
<div style={{ padding: 'var(--spacing-4)' }} />
```

---

### `src/domain/` - Domain Layer

Business logic and entity definitions.

```
domain/
├── types/                  # Entity type definitions
│   └── index.ts            # User, Task, Project, etc.
│
├── services/               # Business logic (future)
│   ├── task-service.ts
│   ├── project-service.ts
│   └── goal-service.ts
│
└── validation/             # Domain validation (future)
    └── schemas.ts
```

**Purpose:**
- Define core business entities
- Centralize business logic
- Validation rules
- Domain invariants

**Characteristics:**
- Framework-agnostic
- Pure TypeScript
- No UI dependencies
- Testable in isolation

---

### `src/state/` - State Management

Client-side state (Zustand stores).

```
state/
├── theme-store.ts          # Theme preference
├── ui-store.ts             # UI state (future)
├── task-store.ts           # Task cache (future)
└── settings-store.ts       # User settings (future)
```

**Purpose:**
- Client-side state management
- Optimistic updates
- UI state (modals, sidebars)
- User preferences

**Pattern:**
```tsx
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Store {
  value: string;
  setValue: (value: string) => void;
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      value: '',
      setValue: (value) => set({ value }),
    }),
    { name: 'store-name' }
  )
);
```

---

### `src/db/` - Database Layer

Database connection and schema.

```
db/
├── index.ts                # Drizzle client & connection
└── schema.ts               # Database schema (Drizzle)
```

**Purpose:**
- Database connection (PostgreSQL)
- Schema definitions
- Type-safe queries

**Usage:**
```tsx
import { db } from '@/db';
import { tasks } from '@/db/schema';

// Type-safe query
const allTasks = await db.select().from(tasks);
```

---

### `src/lib/` - Utilities

Shared utility functions.

```
lib/
└── utils.ts                # Helper functions (cn, etc.)
```

**Purpose:**
- Reusable utility functions
- Helper methods
- Type utilities

**Common utilities:**
- `cn()` - Merge Tailwind classes
- Date formatting
- String manipulation
- Array helpers

---

## Configuration Files

### `package.json`
Dependencies and scripts:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "typecheck": "tsc --noEmit",
    "lint": "eslint ."
  }
}
```

### `tsconfig.json`
TypeScript configuration:
- Strict mode enabled
- Path aliases (`@/*` → `./src/*`)
- Next.js plugin

### `tailwind.config.ts`
Tailwind CSS configuration:
- Custom color system
- Extended theme
- Typography scale
- Design tokens

### `next.config.ts`
Next.js configuration:
- Build settings
- Image optimization
- Environment variables

### `drizzle.config.json`
Drizzle ORM configuration:
- Schema path
- Migration settings
- Database connection

### `.env`
Environment variables:
```
DATABASE_URL=postgresql://...
```

**Security:**
- Never commit `.env`
- Use `.env.example` for templates
- Server-side only (no `NEXT_PUBLIC_`)

---

## File Naming Conventions

### Components
- **PascalCase** for component files: `Button.tsx`, `EmptyState.tsx`
- **kebab-case** for utilities: `utils.ts`, `theme-store.ts`

Exception: Next.js special files use **lowercase**:
- `page.tsx`
- `layout.tsx`
- `loading.tsx`
- `error.tsx`

### Directories
- **kebab-case**: `design-system/`, `task-service/`
- **Plural for collections**: `components/`, `types/`, `services/`

---

## Import Conventions

### Path Aliases

Use `@/` alias for absolute imports:

```tsx
// ✅ Good
import { Button } from '@/components/primitives/button';
import { useThemeStore } from '@/state/theme-store';

// ❌ Avoid
import { Button } from '../../../components/primitives/button';
```

### Import Order

```tsx
// 1. React/Next.js
import { useState } from 'react';
import Link from 'next/link';

// 2. Third-party libraries
import { create } from 'zustand';

// 3. Internal modules
import { Button } from '@/components/primitives/button';
import { cn } from '@/lib/utils';

// 4. Types
import type { Task } from '@/domain/types';

// 5. Styles
import './styles.css';
```

---

## Code Organization Principles

### 1. Separation of Concerns
- **UI** in `components/`
- **Logic** in `domain/`
- **Data** in `db/`
- **State** in `state/`

### 2. Colocation
Keep related files together:
```
features/
└── task-list/
    ├── task-list.tsx       # Component
    ├── task-item.tsx       # Sub-component
    ├── use-task-list.ts    # Custom hook
    └── task-list.test.tsx  # Tests
```

### 3. Single Responsibility
- One component per file
- One concern per module
- Clear, focused purpose

### 4. Composition Over Inheritance
- Build complex components from simple ones
- Use component composition
- Avoid deep inheritance hierarchies

---

## Adding New Features

### Step 1: Define Domain Types
```tsx
// src/domain/types/index.ts
export interface NewEntity {
  id: string;
  // ...fields
}
```

### Step 2: Create Database Schema
```tsx
// src/db/schema.ts
export const newEntities = pgTable('new_entities', {
  id: uuid('id').defaultRandom().primaryKey(),
  // ...columns
});
```

### Step 3: Build Components
```tsx
// src/components/features/new-feature.tsx
export function NewFeature() {
  // Component implementation
}
```

### Step 4: Create Route
```tsx
// src/app/new-feature/page.tsx
export default function NewFeaturePage() {
  return <NewFeature />;
}
```

### Step 5: Add Navigation
```tsx
// Update src/components/layout/sidebar.tsx
const nav = [
  // ...existing
  { title: 'New Feature', href: '/new-feature' }
];
```

---

## Best Practices

### ✅ Do

- Use TypeScript strict mode
- Follow naming conventions
- Keep components small and focused
- Use path aliases (`@/`)
- Write self-documenting code
- Add comments for complex logic
- Export types alongside components

### ❌ Don't

- Mix concerns (UI + data fetching in one component)
- Use relative imports for deep paths
- Create god components
- Duplicate code across files
- Ignore TypeScript errors
- Use `any` type
- Leave unused imports

---

## Quick Reference

| Need to...                  | Look in...                        |
|-----------------------------|-----------------------------------|
| Create a button variant     | `components/primitives/button.tsx`|
| Define a new entity         | `domain/types/index.ts`           |
| Add database table          | `db/schema.ts`                    |
| Create a page               | `app/[route]/page.tsx`            |
| Add client state            | `state/[name]-store.ts`           |
| Build a feature component   | `components/features/`            |
| Style with design tokens    | Use Tailwind classes              |
| Add navigation item         | `components/layout/sidebar.tsx`   |
| Configure theme             | `app/globals.css`                 |

---

**Last Updated:** PHASE 2 — Goals & Projects

Phase 2 additions:

- `src/domain/goal/`, `src/domain/milestone/`, `src/domain/project/`
- `src/domain/progress.ts`, `src/domain/relationships.ts`, `src/domain/deadlines.ts`
- `src/state/workspace-store.ts`
- `src/persistence/workspace-repository.ts`
- `src/app/goals/[id]/`, `src/app/projects/[id]/`
- `DOMAIN_MODEL.md`
