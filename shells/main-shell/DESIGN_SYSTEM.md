# Creation Rights Design System

> Mandatory style guide for all 27 micro-frontend apps. Use this document verbatim in every v0 session.

---

## THEME CONFIGURATION

### globals.css (Complete)

```css
@import 'tailwindcss';
@import 'tw-animate-css';

@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.145 0 0);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.145 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.985 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.396 0.141 25.723);
  --destructive-foreground: oklch(0.637 0.237 25.331);
  --border: oklch(0.269 0 0);
  --input: oklch(0.269 0 0);
  --ring: oklch(0.439 0 0);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.205 0 0);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.269 0 0);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(0.269 0 0);
  --sidebar-ring: oklch(0.439 0 0);
}

@theme inline {
  --font-sans: 'Geist', 'Geist Fallback';
  --font-mono: 'Geist Mono', 'Geist Mono Fallback';
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Theme Provider Setup (layout.tsx)

```tsx
import { ThemeProvider } from '@/components/theme-provider'

// In RootLayout:
<html lang="en" suppressHydrationWarning>
  <body className="font-sans antialiased">
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  </body>
</html>
```

---

## COLOR SYSTEM

### Background Colors
| Usage | Light Mode | Dark Mode | Tailwind Class |
|-------|------------|-----------|----------------|
| Page background | White | Near-black | `bg-background` |
| Card/surface | White | Near-black | `bg-card` |
| Sidebar | Off-white | Dark gray | `bg-sidebar` |
| Muted/secondary bg | Light gray | Dark gray | `bg-muted` |
| Hover state | Light gray 50% | - | `hover:bg-muted/50` |
| Active state | Light gray | Dark gray | `bg-muted` |

### Text Colors
| Usage | Tailwind Class |
|-------|----------------|
| Primary text | `text-foreground` |
| Secondary/muted text | `text-muted-foreground` |
| Card text | `text-card-foreground` |
| Disabled text | `text-muted-foreground/60` |

### Border Colors
| Usage | Tailwind Class |
|-------|----------------|
| Default border | `border-border` |
| Input border | `border-input` |
| Dividers | `divide-border` |
| Focus ring | `ring-ring` |

### Badge/Status Colors (ONLY ALLOWED COLORS)
```tsx
// Urgent/High - Red
"bg-red-500/10 text-red-600 dark:text-red-400"

// Warning/Medium - Amber  
"bg-amber-500/10 text-amber-600 dark:text-amber-400"

// Low/Default - Muted
"bg-muted text-muted-foreground"

// Success/Positive Trend - Emerald
"bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"

// Info - Blue (sparingly)
"bg-blue-500/10 text-blue-600 dark:text-blue-400"
```

### Special Colors
| Usage | Tailwind Class |
|-------|----------------|
| Notification dot | `bg-red-500` |
| Active sidebar indicator (L2) | `border-foreground` (left border) |
| Logo background | `bg-foreground` |
| Logo icon | `text-background` |
| Avatar fallback | `bg-muted text-muted-foreground` |

---

## TYPOGRAPHY

### Font Family
- Sans: `Geist` via `font-sans` class
- Mono: `Geist Mono` via `font-mono` class

### Font Sizes & Weights

| Element | Size | Weight | Class |
|---------|------|--------|-------|
| Page title | 24px | Semibold | `text-2xl font-semibold tracking-tight` |
| Section title | 16px | Semibold | `text-base font-semibold` |
| Card title | 16px | Semibold | `text-base font-semibold` |
| Body text | 14px | Normal | `text-sm` |
| Secondary text | 14px | Normal | `text-sm text-muted-foreground` |
| Small text | 12px | Normal | `text-xs` |
| Metric value | 30px | Semibold | `text-3xl font-semibold tracking-tight` |
| Metric label | 14px | Normal | `text-sm text-muted-foreground` |
| Badge text | 12px | Medium | `text-xs font-medium` |
| Sidebar L1 item | 14px | Normal/Medium | `text-sm` (medium when active) |
| Sidebar L2 item | 13px | Normal | `text-[13px]` |
| Timestamp | 12px | Normal | `text-xs text-muted-foreground` |
| Breadcrumb | 14px | Normal/Medium | `text-sm` |

---

## SPACING

### Page Layout
- Page padding: `p-8`
- Max content width: `max-w-7xl mx-auto`
- Section gap: `gap-8`

### Cards
- Card padding: `p-6`
- Card padding (compact): `p-4`
- Gap between cards: `gap-4` or `gap-6`

### Grid Layouts
- Metric cards: `grid grid-cols-4 gap-4`
- Dashboard grid: `grid grid-cols-3 gap-6`

### Sidebar
- L1 sidebar expanded: `w-64`
- L1 sidebar collapsed: `w-16`
- L2 sidebar: `w-56`
- Sidebar item height: `h-9`
- Sidebar item padding: `px-3`
- Sidebar section padding: `py-2`

### Top Bar
- Height: `h-14`
- Padding: `px-4`

### Internal Spacing
- Button gap: `gap-2`
- Icon + text gap: `gap-2` or `gap-3`
- List item gap: `gap-4`
- Metric card internal: `gap-2`

---

## COMPONENTS

### Buttons
```tsx
// Primary (filled)
<Button size="sm">Quick Create</Button>

// Secondary/Outline
<Button variant="outline" size="sm">Review</Button>

// Ghost (for icons, subtle actions)
<Button variant="ghost" size="sm">View All</Button>

// Icon button
<Button variant="ghost" size="icon" className="size-8">
  <Icon className="size-4" />
</Button>
```

Button sizes used:
- `size="sm"` with `h-8` for most actions
- `size="icon"` with `className="size-8"` for icon-only buttons

### Input/Search
```tsx
<div className="relative">
  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
  <Input
    placeholder="Search..."
    className="h-8 bg-muted/50 border-border pl-9 pr-12 text-sm placeholder:text-muted-foreground"
  />
  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 text-muted-foreground text-xs">
    <Command className="size-3" />
    <span>K</span>
  </div>
</div>
```

### Cards
```tsx
// Standard card
<div className="border border-border rounded-xl bg-card p-6">
  {/* content */}
</div>

// Card with header
<div className="border border-border rounded-xl bg-card overflow-hidden">
  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
    <h3 className="font-semibold text-base">Title</h3>
    <Button variant="ghost" size="sm">Action</Button>
  </div>
  <div className="divide-y divide-border">
    {/* list items */}
  </div>
</div>
```

### Metric Cards (ShadCN Dashboard Style)
```tsx
<div className="p-6 border border-border rounded-xl bg-card flex flex-col gap-2">
  {/* Header with label and trend badge */}
  <div className="flex items-center justify-between">
    <span className="text-muted-foreground text-sm">{label}</span>
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
      trendUp
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "bg-red-500/10 text-red-600 dark:text-red-400"
    }`}>
      {trendUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {trend}
    </span>
  </div>
  
  {/* Value */}
  <span className="text-3xl font-semibold tracking-tight text-foreground">
    {value}
  </span>
  
  {/* Description with trend icon */}
  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
    {trendUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
    {description}
  </div>
  
  {/* Subtext */}
  <span className="text-xs text-muted-foreground">{subtext}</span>
</div>
```

### Badges (Status/Urgency)
```tsx
// Urgent/High
<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
  Urgent
</span>

// Medium/Warning
<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
  Medium
</span>

// Low/Default
<span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
  Low
</span>

// Trend badge (compact, in card headers)
<span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
  <TrendingUp className="size-3" />
  +12.5%
</span>
```

### Avatar
```tsx
<Avatar className="size-8">
  <AvatarImage src="" alt="User" />
  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
    PM
  </AvatarFallback>
</Avatar>
```

### Dropdown Menu
```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <button className="focus:outline-none">
      {/* trigger element */}
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-56">
    <DropdownMenuLabel>Label</DropdownMenuLabel>
    <DropdownMenuSeparator />
    <DropdownMenuItem>Item</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Tooltips
```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <button>{/* content */}</button>
  </TooltipTrigger>
  <TooltipContent side="right">
    Tooltip text
  </TooltipContent>
</Tooltip>
```

---

## LAYOUT STRUCTURE

### Shell Grid
```
┌─────────────────────────────────────────────────────────────────┐
│                         TOP BAR (h-14)                          │
├────────┬──────────┬─────────────────────────────────────────────┤
│   L1   │    L2    │                                             │
│ (w-64  │  (w-56)  │           CONTENT AREA                      │
│  or    │          │                                             │
│  w-16) │          │                                             │
│        │          │                                             │
└────────┴──────────┴─────────────────────────────────────────────┘
```

### Main Layout Structure
```tsx
<div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
  {/* Top Bar */}
  <header className="h-14 w-full px-4 flex justify-between items-center border-b border-border bg-background">
    {/* ... */}
  </header>

  {/* Main Area */}
  <div className="flex flex-1 h-[calc(100vh-3.5rem)] overflow-hidden">
    {/* L1 Sidebar */}
    <aside className={cn(
      "h-full flex flex-col border-r border-border bg-sidebar transition-all duration-200",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* ... */}
    </aside>

    {/* L2 Sidebar (conditional) */}
    <aside className="w-56 h-full border-r border-border bg-sidebar">
      {/* ... */}
    </aside>

    {/* Content Area */}
    <div className="flex-1 h-full bg-background overflow-hidden">
      {/* ... */}
    </div>
  </div>
</div>
```

---

## STATES

### Hover States
```tsx
// Sidebar items, list items
"hover:bg-muted/50 transition-colors"

// Buttons (ghost)
"hover:bg-muted transition-colors"

// Text links
"hover:text-foreground"
```

### Active/Selected States
```tsx
// L1 sidebar item (active)
"bg-muted text-foreground font-medium"

// L1 sidebar item (inactive)
"text-muted-foreground hover:text-foreground hover:bg-muted"

// L2 sidebar item (active) - with left border indicator
"border-l-2 border-foreground bg-muted text-foreground"

// L2 sidebar item (inactive)
"border-l-2 border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
```

### Focus States
```tsx
// Default focus ring
"focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"

// For buttons/inputs
"focus-visible:ring-offset-2"
```

### Disabled States
```tsx
"opacity-50 cursor-not-allowed"
"text-muted-foreground/60"
```

### Loading States
```tsx
// Skeleton placeholders
<Skeleton className="h-8 w-1/4" />
<Skeleton className="h-48" />

// Loading spinner (if needed)
// Use Spinner component from shadcn/ui
```

---

## ICONS

Use Lucide React icons exclusively. Standard size: `size-4` (16px).

Common icons used:
- Navigation: `Layers`, `Shield`, `Cpu`, `ClipboardCheck`, `GitBranch`, `Settings`
- Actions: `PanelLeftClose`, `PanelLeft`, `ExternalLink`, `Upload`, `FolderPlus`
- Feedback: `Bell`, `AlertCircle`, `CheckCircle`, `Info`, `TrendingUp`, `TrendingDown`
- UI: `Search`, `Command`, `X`, `Sun`, `Moon`, `Image`

---

## ANIMATION

### Transitions
```tsx
// Sidebar collapse
"transition-all duration-200"

// Color transitions
"transition-colors"

// Standard duration
"duration-200" or "duration-300"
```

---

## DARK MODE TOGGLE

```tsx
"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"

// In component:
const { theme, setTheme } = useTheme()
const [mounted, setMounted] = useState(false)

useEffect(() => {
  setMounted(true)
}, [])

// Toggle button:
<button
  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  className="relative p-2 rounded-md hover:bg-muted transition-colors"
  aria-label="Toggle theme"
>
  {mounted ? (
    theme === "dark" ? (
      <Sun className="size-4 text-muted-foreground" />
    ) : (
      <Moon className="size-4 text-muted-foreground" />
    )
  ) : (
    <div className="size-4" />
  )}
</button>
```

---

## SHADCN COMPONENTS USED

Required components (install via shadcn CLI):
- `button`
- `input`
- `avatar`
- `dropdown-menu`
- `tooltip`
- `scroll-area`
- `skeleton`
- `badge` (optional, we use custom badge styling)

---

## MICRO-FRONTEND INTEGRATION

Each app loads in the content area. The shell provides:
- Section ID and active item via props/URL
- Breadcrumb context
- Consistent padding (`p-8`)
- Scroll handling via `ScrollArea`

Apps should:
- Use `bg-background` as their root background
- Match all typography and spacing from this guide
- Use the same badge colors for status indicators
- Not include their own header/navigation (shell provides it)

---

## DO NOT USE

- Purple or violet colors
- Custom gray/zinc values (use semantic tokens)
- Shadows on cards (use borders only)
- Gradients
- Colored sidebar icons
- Custom fonts
- Emojis
- Heavy animations

---

## CHECKLIST FOR EACH APP

- [ ] Uses `bg-background` for page background
- [ ] Uses `bg-card` with `border border-border rounded-xl` for cards
- [ ] Uses `text-foreground` for primary text
- [ ] Uses `text-muted-foreground` for secondary text
- [ ] Uses only approved badge colors (red/amber/muted/emerald)
- [ ] Uses `text-sm` for body text, `text-xs` for small text
- [ ] Uses `gap-4` or `gap-6` for card spacing
- [ ] Uses `p-6` for card padding
- [ ] Includes dark mode support via semantic tokens
- [ ] Uses Lucide icons at `size-4`
- [ ] No custom colors outside the system
