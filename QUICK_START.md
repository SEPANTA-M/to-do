# NEXUS - Quick Start Guide

**Get started with NEXUS in 5 minutes.**

---

## Prerequisites

- Node.js 18+ (20 recommended)
- PostgreSQL 14+
- npm or pnpm

---

## Installation

### 1. Clone & Install

```bash
# Clone the repository
git clone <your-repo-url>
cd nexus

# Install dependencies
npm install
```

### 2. Configure Database

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database URL
# Example: DATABASE_URL=postgresql://user:password@localhost:5432/nexus
```

### 3. Initialize Database

```bash
# Push schema to database
npx drizzle-kit push
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## What You'll See

### Desktop View
- **Left Sidebar** - Main navigation
- **Content Area** - Current page
- **⌘K / Ctrl+K** - Command palette

### Mobile View
- **Top Header** - Logo and actions
- **Content Area** - Current page
- **Bottom Navigation** - 5 main tabs

---

## Navigation

### Available Routes

| Route | Description |
|-------|-------------|
| `/` | Today - Your daily overview |
| `/tasks` | All tasks |
| `/projects` | Project management |
| `/goals` | Long-term goals |
| `/calendar` | Calendar view |
| `/focus` | Focus mode |
| `/insights` | Analytics |
| `/notes` | Quick notes |
| `/settings` | Settings |

### Keyboard Shortcuts

- **⌘K / Ctrl+K** - Open command palette
- **Esc** - Close command palette
- **Tab** - Navigate between elements
- **Arrow keys** - Navigate lists

---

## Theme Switching

### Desktop
1. Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux)
2. Select theme option
3. Choose: Light, Dark, or System

### Mobile
1. Tap **More** tab
2. Tap **Toggle** button

---

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Type checking
npm run typecheck

# Linting
npm run lint
```

---

## Project Structure (Simplified)

```
nexus/
├── src/
│   ├── app/              # Pages & routes
│   ├── components/       # React components
│   ├── design-system/    # Design tokens
│   ├── domain/           # Business logic
│   ├── state/            # State management
│   └── db/               # Database
├── public/               # Static files
└── [config files]        # TypeScript, Tailwind, etc.
```

---

## Common Tasks

### Add a New Page

1. Create `src/app/my-page/page.tsx`
2. Export default function component
3. Add to navigation in `src/components/layout/sidebar.tsx`

### Add a New Component

1. Create file in `src/components/[category]/`
2. Use TypeScript
3. Follow naming conventions (PascalCase)
4. Export from file

### Update Theme Colors

1. Edit `src/app/globals.css`
2. Modify CSS custom properties
3. Changes apply to both light and dark

### Add Database Table

1. Edit `src/db/schema.ts`
2. Define table using Drizzle syntax
3. Run `npx drizzle-kit push`

---

## Troubleshooting

### Database Connection Error

```bash
# Verify DATABASE_URL in .env
# Check PostgreSQL is running
# Ensure database exists
```

### Build Errors

```bash
# Clear cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### Type Errors

```bash
# Regenerate types
npx next typegen

# Run type check
npm run typecheck
```

---

## What's Implemented (Phase 0)

✅ Application shell  
✅ Navigation (desktop & mobile)  
✅ Theme system (light/dark)  
✅ Command palette (⌘K)  
✅ Design system  
✅ Database schema  
✅ Routing structure  
✅ Empty states  

---

## What's NOT Implemented

❌ Task creation/management  
❌ Project functionality  
❌ Goals tracking  
❌ Calendar integration  
❌ Focus timer  
❌ User authentication  
❌ Data synchronization  

These are intentionally deferred to future phases.

---

## Next Steps

### For Users
1. Explore the navigation
2. Try the command palette (⌘K)
3. Switch themes
4. Test keyboard navigation
5. Try on mobile (responsive)

### For Developers
1. Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Review [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
3. Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
4. Start implementing Phase 1 features

---

## Documentation

- **[README.md](./README.md)** - Complete overview
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Design guide
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - File organization
- **[PHASE_0_SUMMARY.md](./PHASE_0_SUMMARY.md)** - Phase 0 completion

---

## Getting Help

### Documentation
- Check the docs listed above
- Review inline code comments
- Look at existing components for patterns

### Common Patterns

**Create a button:**
```tsx
import { Button } from '@/components/primitives/button';

<Button variant="primary" size="default">
  Click me
</Button>
```

**Use theme store:**
```tsx
import { useThemeStore } from '@/state/theme-store';

const { theme, setTheme } = useThemeStore();
```

**Query database:**
```tsx
import { db } from '@/db';
import { tasks } from '@/db/schema';

const allTasks = await db.select().from(tasks);
```

---

## Contributing

1. Follow existing patterns
2. Use TypeScript strict mode
3. Ensure accessibility
4. Test responsive design
5. Update documentation

---

**NEXUS** - Turn chaos into visible flow.

Ready to build? Start with Phase 1: Task Management!
