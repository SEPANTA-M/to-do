# NEXUS Architecture Documentation

## Overview

NEXUS is a cross-platform Personal Productivity Operating System built with modern web technologies. This document outlines the architectural decisions, patterns, and structure for PHASE 0.

## Technology Stack

### Core Framework
- **Next.js 16** (App Router) - Server-side rendering, streaming, and excellent performance
- **React 19** - Latest React features with server components
- **TypeScript (strict mode)** - Full type safety across the application

### Styling & Design
- **Tailwind CSS 4** - Utility-first CSS with custom design tokens
- **CSS Custom Properties** - Theme system with light/dark mode support
- **Class Variance Authority** - Type-safe variant management for components

### State Management
- **Zustand** - Lightweight state management (75% smaller than Redux)
- **Zustand Persist** - Client-side state persistence

### Database & ORM
- **PostgreSQL** - Relational database for server-side data
- **Drizzle ORM** - Type-safe ORM with excellent TypeScript integration
- **Connection Pooling** - Optimized database connections via pg Pool

### UI Primitives
- **Radix UI** - Unstyled, accessible component primitives
- **cmdk** - Command palette foundation
- **Lucide React** - Consistent icon system

### Utilities
- **date-fns** - Date manipulation for calendar/scheduling features
- **clsx** - Conditional className utility
- **tailwind-merge** - Tailwind class merging without conflicts

## Architecture Layers

```
┌─────────────────────────────────────────────┐
│           UI Layer (Components)             │
│  - Primitives (Radix-based)                 │
│  - Core (Design system)                     │
│  - Features (Compositions)                  │
│  - Layout (Shell, navigation)               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Application Layer (Next.js App)        │
│  - Pages/Routes                             │
│  - API Routes                               │
│  - Server Actions (future)                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│         Domain Layer (Business Logic)       │
│  - Entities (TypeScript types)              │
│  - Services (Business operations)           │
│  - Validation                               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│      Infrastructure Layer (Data/API)        │
│  - Database (Drizzle schemas)               │
│  - API Clients                              │
│  - Storage (IndexedDB - future)             │
└─────────────────────────────────────────────┘
```

## Project Structure

```
nexus/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (routes)/             # Application pages
│   │   ├── api/                  # API endpoints
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles + theme
│   │
│   ├── components/               # React components
│   │   ├── primitives/           # Base components (Button, etc.)
│   │   ├── core/                 # Design system components
│   │   ├── features/             # Feature-specific components
│   │   ├── layout/               # Layout components
│   │   └── providers/            # Context providers
│   │
│   ├── domain/                   # Domain layer
│   │   ├── types/                # Entity definitions
│   │   ├── services/             # Business logic (future)
│   │   └── validation/           # Domain validation (future)
│   │
│   ├── state/                    # State management
│   │   └── stores/               # Zustand stores
│   │
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # Drizzle schema
│   │   └── index.ts              # Database client
│   │
│   ├── design-system/            # Design tokens
│   │   ├── tokens.ts             # Spacing, typography, etc.
│   │   └── colors.ts             # Color system
│   │
│   └── lib/                      # Utilities
│       └── utils.ts              # Helper functions
│
├── public/                       # Static assets
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## Design System

### Spatial UI Philosophy

NEXUS implements a "Spatial UI" design language that is:
- **Premium** - High quality, attention to detail
- **Minimal** - Clean, uncluttered interfaces
- **Fast** - Performant animations and interactions
- **Spatial** - Clear hierarchy and depth
- **Calm** - Not overwhelming, promotes focus
- **Accessible** - WCAG 2.1 AA compliant

### Theme System

Two fully designed themes:
- **Light Mode** - Clean, high contrast, professional
- **Dark Mode** - Deep backgrounds, reduced eye strain

Themes are implemented via CSS custom properties and can be toggled via:
- Settings UI
- System preference detection
- Command palette

### Color Semantics

Colors are organized by purpose, not by palette:
- **Surfaces** - bg-primary, bg-secondary, bg-elevated
- **Text** - text-primary, text-secondary, text-tertiary
- **Borders** - border-primary, border-focus
- **Interactive** - interactive-primary, interactive-secondary
- **Status** - success, warning, error, info
- **Accent** - purple, pink, orange, teal, indigo

### Typography Scale

Harmonious scale based on 15px base:
- **11px** (xs) - Metadata
- **13px** (sm) - Secondary text
- **15px** (base) - Body text
- **17px** (md) - Emphasized body
- **20px** (lg) - Subheadings
- **24px** (xl) - Headings
- **32px** (2xl) - Large headings
- **40px** (3xl) - Hero text

### Spacing System

4px base unit for consistent rhythm:
- 0.25rem (4px)
- 0.5rem (8px)
- 0.75rem (12px)
- 1rem (16px)
- 1.5rem (24px)
- 2rem (32px)
- 3rem (48px)

## Domain Model

### Core Entities

1. **User** - User account and preferences
2. **Task** - Individual actionable items
3. **Project** - Collections of related tasks
4. **Goal** - Long-term objectives
5. **Milestone** - Key checkpoints
6. **Tag** - Categorization labels
7. **Note** - Quick capture and reference
8. **CalendarEvent** - Time-blocked events
9. **FocusSession** - Deep work tracking
10. **Reminder** - Time-based notifications
11. **TaskHistory** - Audit trail
12. **Notification** - User alerts
13. **Settings** - User configuration

All entities follow these conventions:
- UUID primary keys
- createdAt/updatedAt timestamps
- userId foreign key for multi-tenancy
- Indexed fields for query performance

## Responsive Strategy

### Breakpoints

- **Mobile** (< 640px) - Single column, bottom navigation
- **Large Mobile** (640px - 768px) - Single column, enhanced spacing
- **Tablet** (768px - 1024px) - Two columns possible
- **Laptop** (1024px - 1280px) - Sidebar + main content
- **Desktop** (1280px+) - Full multi-panel layout
- **Ultrawide** (1536px+) - Expanded workspace

### Navigation Patterns

**Mobile:**
- Top header with logo and actions
- Bottom tab bar (5 primary items)
- Command palette via header button

**Desktop:**
- Left sidebar (permanent)
- No bottom navigation
- Command palette via keyboard (⌘K)

## State Management Strategy

### Client State (Zustand)
- Theme preference
- UI state (modals, sidebars)
- Command palette
- Filter/sort preferences
- Optimistic UI updates

### Server State (React Server Components)
- Tasks, projects, goals
- User data
- Calendar events
- Focus sessions
- Database queries via Drizzle

### Future: Offline-First
- IndexedDB for client-side cache
- Sync queue for conflict resolution
- Background sync API
- Service worker for offline support

## Accessibility

### Standards
- WCAG 2.1 Level AA compliance
- Semantic HTML structure
- ARIA labels where necessary

### Features
- Keyboard navigation throughout
- Visible focus indicators
- Screen reader support
- Touch-friendly targets (44px minimum)
- Reduced motion support
- High contrast mode compatible

### Focus Management
- Radix UI handles focus trapping
- Keyboard shortcuts documented
- Skip links for navigation
- Logical tab order

## Performance Strategy

### Optimization Techniques
- React Server Components for data fetching
- Streaming SSR for faster initial load
- Dynamic imports for route code splitting
- Image optimization via next/image
- Font optimization (system fonts)
- CSS-in-CSS (no runtime cost)

### Metrics Targets
- Lighthouse Performance > 90
- First Contentful Paint < 1.5s
- Time to Interactive < 3.0s
- Cumulative Layout Shift < 0.1

## Testing Strategy (Future Phases)

### Unit Tests
- Vitest for business logic
- Component testing with React Testing Library

### Integration Tests
- API route testing
- Database query testing
- State management testing

### E2E Tests
- Playwright for critical user flows
- Cross-browser testing
- Mobile viewport testing

### Accessibility Tests
- axe-core automated testing
- Manual keyboard navigation testing
- Screen reader testing

## Error Handling

### Patterns
- Error boundaries for React errors
- Try-catch in async operations
- Graceful degradation
- User-friendly error messages
- Retry mechanisms for transient failures

### Logging (Future)
- Client-side error tracking
- Server-side error logging
- Performance monitoring
- User action analytics (opt-in)

## Security Considerations

### Current
- Environment variable protection
- SQL injection prevention (Drizzle parameterization)
- XSS prevention (React escaping)

### Future
- Authentication (Auth.js / Clerk)
- Authorization & permissions
- Rate limiting
- CSRF protection
- Input validation & sanitization
- Secure session management

## Deployment Strategy (Future)

### Hosting
- Vercel (recommended) or self-hosted
- PostgreSQL (managed instance)
- CDN for static assets
- Environment-based configuration

### CI/CD
- GitHub Actions
- Automated testing
- Type checking
- Linting
- Build verification

## Future Architecture Evolution

### Phase 1+
- User authentication
- Real-time sync
- Offline-first architecture
- Service workers
- Push notifications
- AI-powered insights
- Multi-device sync
- Collaborative features
- API for third-party integrations

## Architectural Decisions

### Why Next.js App Router?
- Server components reduce client bundle
- Streaming improves perceived performance
- Built-in routing and API routes
- Excellent TypeScript support
- Strong ecosystem

### Why Zustand over Redux?
- Much smaller bundle (3kb vs 15kb+)
- Simpler API
- No boilerplate
- TypeScript-first
- Middleware support (persist)

### Why Drizzle over Prisma?
- Closer to SQL (more control)
- Better TypeScript inference
- Smaller runtime
- Edge-compatible
- No code generation step

### Why Radix UI?
- Unstyled (full design control)
- WAI-ARIA compliant
- Keyboard navigation built-in
- Focus management
- Cross-browser tested

### Why Tailwind CSS?
- Utility-first approach
- Excellent DX with IntelliSense
- No runtime cost
- Purging removes unused styles
- Easy theming with custom properties

## Limitations & Trade-offs

### Current Limitations
1. No authentication (single-user assumed)
2. No real-time sync
3. No offline support
4. No mobile native apps (web-only)
5. No collaborative features

### Intentional Trade-offs
1. **No GraphQL** - REST/RSC is simpler for this scale
2. **No Microservices** - Monolith appropriate for v1
3. **No NoSQL** - PostgreSQL handles all use cases
4. **No Client-Side Router** - Next.js App Router sufficient

## Maintenance & Evolution

### Code Quality
- Strict TypeScript mode
- ESLint for code style
- Prettier for formatting (future)
- Husky for pre-commit hooks (future)

### Documentation
- Inline code comments for complex logic
- JSDoc for public APIs
- Architecture documentation (this file)
- Design system documentation

### Versioning
- Semantic versioning
- Changelog maintenance
- Migration guides for breaking changes

---

**Last Updated:** Final build — local-first production

## Phase 2 domain

See `DOMAIN_MODEL.md` for Goal → Milestone → Project → Task relationships, progress math, and deletion rules.

## Persistence (actual)

The UI is **local-first**. IndexedDB database `nexus-local`, store `kv`. Components never touch IndexedDB directly; they go through Zustand stores and repositories.

PostgreSQL / Drizzle remain as a schema and optional pool (`db` is `null` without `DATABASE_URL`). Server actions in `src/app/actions/tasks.ts` are unused by the UI.

### Keys

- `nexus.tasks` `nexus.task-history` `nexus.mutations`
- `nexus.goals` `nexus.milestones` `nexus.projects` `nexus.activity`
- `nexus.notes` `nexus.events` `nexus.focus-sessions`
- `nexus.settings` `nexus.reviews` `nexus.notifications`
- Theme: `localStorage` `nexus-theme`

### Sync

Pending mutations are a ledger, not a live worker. `/api/sync` reports that cloud sync is unavailable. Conflicts are never auto-resolved by overwriting.

### Auth

No cloud accounts. Optional display name in settings. Do not store passwords.

### Scheduling

Tasks with `startTime` and calendar events share occupancy. Day Flow and Calendar mutate the same task model. Smart scheduling suggests free slots; it never rearranges without confirmation.

### Focus

Sessions persist `startedAt` (`startTime`), `endTime`, accumulated duration, interruptions, and task id. Completing a session can complete the task; exiting does not.
