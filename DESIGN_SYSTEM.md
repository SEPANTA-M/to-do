# NEXUS Spatial UI

Identity: **ink teal on warm paper** (light) and **layered ink** (dark). UI sans from the platform; mono for time and counts.

## Surfaces

- Canvas — `--bg-primary`
- Section — `--bg-secondary`
- Elevated — `--bg-elevated`
- Overlay — `--bg-overlay`

Separate with spacing and type before adding a border.

## Type

| Role | Treatment |
| Display / heading | 20–24px, weight 500, tight tracking |
| Body | 15px, weight 400 |
| Label | 11px, uppercase, 0.12em |
| Metadata / time | System mono (`SF Mono` / `Cascadia Mono` / `Consolas`), 10–12px, tabular |

Do not bold everything. Counts like `68%` use mono, not giant widgets.

## Motion

- Micro 140ms
- Standard 220ms
- Complex 360ms
- Easing `cubic-bezier(0.22, 1, 0.36, 1)`
- Honor `prefers-reduced-motion`

## Accent

Interactive / focus: ink teal. Status colors are muted. Accents (purple, orange, …) are for identity rails only.
