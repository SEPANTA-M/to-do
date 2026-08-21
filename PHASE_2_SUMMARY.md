# PHASE 2: GOALS + MILESTONES + PROJECTS

NEXUS now answers three questions on one domain:

- **What should I do?** → Task (Phase 1, unchanged engine)
- **What am I building?** → Project
- **Why am I doing it?** → Goal

Hierarchy: Goal → Milestone → Project → Task → Subtask.

## Verification

- Tests: 51 passed (34 Phase 1 + 17 Phase 2)
- `tsc --noEmit`: clean
- ESLint: clean
- `next build`: success (`/goals`, `/goals/[id]`, `/projects`, `/projects/[id]`)

Progress is hierarchical, not a flat task ratio. Completing a goal or project does not complete children. Archive detaches rather than cascade-deletes.

See `DOMAIN_MODEL.md` for the exact progress algorithm and deletion rules.
