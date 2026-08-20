# NEXUS - Personal Productivity Operating System

**Transform chaos into visible flow.**

NEXUS is a cross-platform productivity platform combining tasks, projects, goals, calendar, focus sessions, and insights into a unified experience.

---

## 🚀 Current Status: PHASE 0 Complete

✅ **Foundation established**  
✅ **Architecture documented**  
✅ **Design system implemented**  
✅ **Application shell built**  
✅ **Navigation functional**  
✅ **Theme system working**  
✅ **Database schema defined**  

### What's Implemented

- **Application Shell** - Responsive layout with sidebar (desktop) and bottom navigation (mobile)
- **Theme System** - Light/dark mode with system preference detection
- **Command Palette** - Keyboard-driven navigation (⌘K / Ctrl+K)
- **Design System** - Complete token system, semantic colors, typography scale
- **Database Schema** - Full domain model in Drizzle ORM
- **Routing** - All primary routes with proper empty states
- **Accessibility** - Keyboard navigation, focus management, ARIA labels

### What's NOT Implemented (By Design)

This is PHASE 0 - **Foundation only**. The following are intentionally deferred:

- ❌ Task creation/management
- ❌ Project functionality
- ❌ Goals tracking
- ❌ Calendar integration
- ❌ Focus mode features
- ❌ User authentication
- ❌ Data synchronization
- ❌ Real-time updates
- ❌ AI features
- ❌ Offline support

---

## 🏗️ Architecture

### Technology Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 4 + CSS Custom Properties
- **Database:** PostgreSQL + Drizzle ORM
- **State:** Zustand (client state)
- **UI Primitives:** Radix UI
- **Icons:** Lucide React

### Project Structure

```
nexus/
├── src/
│   ├── app/                    # Next.js routes
│   ├── components/             # React components
│   │   ├── primitives/         # Base components
│   │   ├── core/               # Design system
│   │   ├── features/           # Feature components
│   │   ├── layout/             # Shell & navigation
│   │   └── providers/          # Context providers
│   ├── design-system/          # Design tokens
│   ├── domain/                 # Business logic
│   ├── state/                  # State management
│   ├── db/                     # Database
│   └── lib/                    # Utilities
├── ARCHITECTURE.md             # Architecture docs
├── DESIGN_SYSTEM.md            # Design system guide
└── PROJECT_STRUCTURE.md        # File organization
```

---

## 📚 Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architectural decisions, patterns, trade-offs
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Complete design system documentation
- **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** - File organization guide

---

## 🛠️ Development

### Prerequisites

- Node.js 18+ (20 recommended)
- PostgreSQL 14+
- npm or pnpm

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd nexus

# Install dependencies
npm install

# Configure database
cp .env.example .env
# Edit .env with your DATABASE_URL
```

### Database Setup

```bash
# Push schema to database
npx drizzle-kit push
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Type Checking

```bash
npm run typecheck
```

### Build

```bash
npm run build
npm run start
```

---

## ⌨️ Keyboard Shortcuts

- **⌘K / Ctrl+K** - Open command palette
- **Esc** - Close command palette
- **Tab** - Navigate between elements
- **Arrow keys** - Navigate command palette

---

## 🎨 Design Principles

NEXUS Spatial UI is designed to be:

- **Premium** - High-quality, refined experience
- **Minimal** - Clean, uncluttered interfaces
- **Fast** - Instant interactions, smooth animations
- **Spatial** - Clear hierarchy and depth
- **Calm** - Not overwhelming, promotes focus
- **Accessible** - WCAG 2.1 AA compliant

### Theme Support

- **Light Mode** - Clean, professional, high-energy
- **Dark Mode** - Deep backgrounds, low eye strain
- **System** - Automatic based on OS preference

Toggle themes:
- Command palette → Theme
- Mobile: Menu → Toggle theme
- Desktop: Command palette (⌘K)

---

## 🗺️ Roadmap

### PHASE 0: Foundation ✅ COMPLETE
- [x] Architecture definition
- [x] Design system
- [x] Application shell
- [x] Navigation
- [x] Theme system
- [x] Database schema

### PHASE 1: Task Management (Next)
- [ ] Task creation/editing
- [ ] Task list views
- [ ] Filtering & sorting
- [ ] Due dates
- [ ] Priorities
- [ ] Subtasks
- [ ] Task completion

### PHASE 2: Projects
- [ ] Project creation
- [ ] Task organization
- [ ] Project views
- [ ] Progress tracking

### PHASE 3: Goals & Milestones
- [ ] Goal creation
- [ ] Milestone tracking
- [ ] Progress visualization
- [ ] Goal-project linking

### PHASE 4: Calendar
- [ ] Calendar view
- [ ] Event creation
- [ ] Task scheduling
- [ ] Time blocking

### PHASE 5: Focus Mode
- [ ] Focus timer
- [ ] Session tracking
- [ ] Break management
- [ ] Focus analytics

### PHASE 6: Insights
- [ ] Productivity metrics
- [ ] Completion rates
- [ ] Time tracking
- [ ] Progress visualization

### Future Phases
- User authentication
- Multi-device sync
- Offline support
- Collaborative features
- AI-powered insights
- Mobile native apps
- Third-party integrations

---

## 🧪 Testing

### Type Safety

```bash
npm run typecheck
```

### Build Verification

```bash
npm run build
```

### Linting

```bash
npm run lint
```

---

## 📦 Deployment

### Recommended: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Required for production:
```
DATABASE_URL=postgresql://user:password@host:5432/database
NODE_ENV=production
```

### Database Migration

```bash
# In production environment
npx drizzle-kit push
```

---

## 🤝 Contributing

### Code Style

- TypeScript strict mode
- Semantic naming
- Component composition
- Accessible by default

### Component Checklist

- [ ] TypeScript types
- [ ] Responsive design
- [ ] Keyboard navigation
- [ ] Focus indicators
- [ ] Light/dark theme support
- [ ] Touch-friendly (44px targets)
- [ ] Reduced motion support

### Commit Messages

Follow conventional commits:
```
feat: add task creation
fix: resolve theme toggle issue
docs: update architecture guide
style: format component files
refactor: simplify state management
test: add button component tests
```

---

## 📄 License

[Your License Here]

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Lucide Icons](https://lucide.dev/)

---

**NEXUS** - Turn chaos into visible flow.
