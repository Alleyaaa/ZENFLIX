# Zenflix Design System

## Brand Identity
- **Name**: Zenflix
- **Tagline**: "Streaming film streaming premium"
- **Mission**: Platform streaming film dengan kualitas HD, tanpa buffering
- **Mood**: Sleek, approachable, trusted, fast, streaming-first

## Color System

### Dark Mode (Default)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#0b0f1a` | Primary background |
| `--bg-surface` | `#131a2b` | Cards, panels |
| `--bg-elevated` | `#1a2338` | Modals, dropdowns |
| `--bg-overlay` | `rgba(11, 15, 26, 0.88)` | Overlays |
| `--border` | `rgba(255, 255, 255, 0.09)` | Subtle borders |
| `--border-strong` | `rgba(255, 255, 255, 0.16)` | Strong borders |
| `--text-main` | `#f2f4f8` | Primary text |
| `--text-muted` | `#a7b0c2` | Secondary text |
| `--text-tertiary` | `#6b7488` | Disabled/placeholder text |
| `--accent` | `#f5c518` | **Primary accent (gold/amber)** |
| `--accent-contrast` | `#0b0f1a` | Text on accent |
| `--accent-dim` | `rgba(245, 197, 24, 0.12)` | Subtle accent bg |
| `--danger` | `#ef4444` | Error states |
| `--success` | `#22c55e` | Success states |
| `--card-shadow` | `0 2px 8px rgba(0, 0, 0, 0.35)` | Card shadows |

### Light Mode
| Token | Value |
|-------|-------|
| `--bg` | `#f6f7f9` |
| `--bg-surface` | `#ffffff` |
| `--bg-elevated` | `#f1f3f7` |
| `--border` | `rgba(15, 23, 42, 0.1)` |
| `--text-main` | `#101828` |
| `--text-muted` | `#475467` |
| `--text-tertiary` | `#98a2b3` |
| `--accent` | `#b45309` |
| `--accent-contrast` | `#ffffff` |

## Typography Scale

### Font Families
```
--font-sans: "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

### Fluid Typography (Clamp)
```
--text-hero: clamp(2.5rem, 6vw, 5.5rem);
--text-title: clamp(1.5rem, 3vw, 2.5rem);
--text-section: clamp(1.25rem, 2.5vw, 2rem);
```

## Spacing Scale (8px base)
```
--space-1: 0.25rem  /* 4px */
--space-2: 0.5rem   /* 8px */
--space-3: 0.75rem  /* 12px */
--space-4: 1rem     /* 16px */
--space-5: 1.25rem  /* 20px */
--space-6: 1.5rem   /* 24px */
--space-8: 2rem     /* 32px */
--space-10: 2.5rem  /* 40px */
--space-12: 3rem    /* 48px */
--space-16: 4rem    /* 64px */
```

## Border Radius
```
--radius-xs: 4px
--radius-sm: 8px
--radius-md: 12px
--radius-lg: 16px
--radius-xl: 24px
--radius-full: 9999px
```

## Shadows
```
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
--shadow-md: 0 4px 6px rgba(0,0,0,0.1);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
--shadow-card: 0 2px 8px rgba(0,0,0,0.35);
```

## Motion / Animation Tokens
```
--motion-fast: 150ms;
--motion-base: 250ms;
--motion-slow: 350ms;
--motion-slowest: 500ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

## Z-Index Scale
```
--z-dropdown: 100;
--z-sticky: 200;
--z-modal: 400;
--z-popover: 500;
--z-tooltip: 600;
--z-toast: 700;
--z-max: 1000;
```

## Breakpoints
```
--bp-sm: 640px;
--bp-md: 768px;
--bp-lg: 1024px;
--bp-xl: 1280px;
--bp-2xl: 1536px;
```

## Glassmorphism / Glass Panels
```
.glass-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(16px);
}
.glass-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-main);
  border-radius: var(--radius-md);
  transition: border-color 0.2s, background 0.2s;
}
.btn-primary {
  background: var(--accent);
  color: var(--accent-contrast);
  font-weight: 600;
  border-radius: var(--radius-md);
  padding: 0.55rem 1.4rem;
  transition: opacity 0.2s, transform 0.15s;
}
.btn-primary:hover { opacity: 0.9; }
.btn-primary:active { transform: scale(0.98); }
.gradient-text {
  background: linear-gradient(135deg, var(--accent), #fbbf24);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## Hover / Focus States
```
/* Hover cards */
.card:hover { transform: translateY(-2px) scale(1.02); }

/* Focus visible (WCAG) */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Reduced motion (WCAG) */
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

## Scrollbar Styles
```
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
```

## Accessibility (WCAG AA)
- Normal text (16px): min 4.5:1 contrast -> our white on dark 12:1
- Large text (18px+): min 3:1 -> our 9:1
- All interactive: focus-visible outline accent
- Reduced motion respected
- Semantic HTML (nav, main, footer, section, h1-h6)

---

*DESIGN.md = single source of truth for all UI decisions in Zenflix.*
