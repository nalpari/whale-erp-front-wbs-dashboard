# Spec and build

## Configuration
- **Artifacts Path**: {@artifacts_path} → `.zenflow/tasks/{task_id}`

---

## Agent Instructions

Ask the user questions when anything is unclear or needs their input. This includes:
- Ambiguous or incomplete requirements
- Technical decisions that affect architecture or user experience
- Trade-offs that require business context

Do not make assumptions on important decisions — get clarification first.

---

## Workflow Steps

### [x] Step: Technical Specification

**Completed:** Created comprehensive technical specification at `.zenflow/tasks/new-task-56a6/spec.md`

**Summary:**
- Difficulty: Medium (15+ files, design system overhaul)
- Direction: Minimal Corporate design (per user choice - Option A)
- Key changes: Remove neon/glow effects, simplify animations, clean card designs
- Preserve: All existing functionality, theme toggle, data visualizations

---

### [x] Step: CSS Foundation - Rewrite Design System
<!-- chat-id: fd392938-5f43-45a6-997f-24cc2cc73158 -->

**Completed:** Rewrote `app/globals.css` with minimal corporate design system.

- [x] Replace neon color palette with neutral + single accent (blue)
- [x] Remove all animation keyframes (pulse-glow, shimmer, float, gradient-shift, border-glow, rotate-gradient)
- [x] Keep only essential animation (slide-up simplified to 0.3s)
- [x] Remove animated background grid (body::before)
- [x] Update glass effect to subtle styling (reduce blur, clean borders)
- [x] Remove all text-glow classes
- [x] Simplify gradient-text to solid color
- [x] Update scrollbar to subtle styling
- [x] Ensure both light and dark themes have consistent professional look

**Changes Made:**
- Replaced cyberpunk neon colors with professional neutral palette + blue accent (#3b82f6)
- Added semantic colors (success, warning, error, info) and chart color palette
- Reduced animations to only `slide-up` (0.3s) and `fade-in` (0.2s)
- Removed background grid pattern entirely
- Simplified glass effect (reduced blur from 20px to 12px)
- Legacy classes preserved as no-ops for backward compatibility
- Added new utility classes: `.card`, `.card-hover`, `.accent-text`
- Subtle scrollbar styling (6px width, muted colors)

**Verification:** `pnpm lint` passes, CSS compiles successfully

---

### [x] Step: Core UI Components - Card and Counters
<!-- chat-id: 666d8597-2a37-4880-ada5-45e9f62eafb3 -->

**Completed:** Simplified all three core UI components.

- [x] **GlowCard.tsx**: Replaced with simple Card component
  - Removed all glow effects, corner accents, hover overlay, animated gradient border
  - Now uses `.card` and `.card-hover` CSS classes
  - Simplified animation: opacity + y slide (0.3s)
  - `glowColor` prop kept for backward compatibility but deprecated

- [x] **AnimatedCounter.tsx**: Simplified animation
  - Removed scale entrance animation (now fade only)
  - Reduced animation duration from 2s to 1s
  - Removed text-shadow glow from AnimatedPercentage
  - Updated default color from `--neon-cyan` to `--accent`

- [x] **ProgressRing.tsx**: Removed all glow effects
  - Removed SVG glow filter and gradient
  - Removed animated dot at progress end
  - Reduced stroke animation to 0.8s
  - Updated default colors to use CSS variables (`--accent`, `--border`)
  - MultiProgressRing also simplified (removed drop-shadow filter)

**Verification:** `pnpm lint` passes (0 errors)

---

### [x] Step: Layout Components - Header and Theme Toggle
<!-- chat-id: d38d5b97-0ba1-4e83-9b5d-314e19ff1859 -->

**Completed:** Modernized layout components with clean, minimal styling.

- [x] **Header.tsx**:
  - Removed rotating ring animation around logo
  - Simplified logo to solid accent color box (no gradient glow)
  - Removed all whileHover scale/rotate animations on logo
  - Simplified navigation links (background color only, no glow borders)
  - Cleaned reload button (removed glow shadow, uses subtle border color)
  - Cleaned "Task 등록" button (solid background, no glow shadow)
  - Removed activity button glow on hover
  - Reduced header animation duration from 0.6s to 0.3s
  - Replaced `motion.div` components with plain `div` where animation was unnecessary
  - Updated colors from neon variables to semantic variables (--accent, --success, --warning)

- [x] **ThemeToggle.tsx**:
  - Removed box-shadow glow
  - Simplified to clean toggle with subtle border
  - Kept spring animation for toggle knob position (user experience)
  - Updated colors to use CSS variables (--accent for dark, --warning for light)

**Changes Made:**
- Header now uses `var(--bg-secondary)` background with `var(--border)` bottom border
- Navigation uses `var(--bg-tertiary)` for active state
- Reload button uses CSS `animate-spin` when active instead of framer-motion
- All buttons simplified to solid colors without glow effects

**Verification:** `pnpm lint` passes (0 errors)

---

### [x] Step: Dashboard Components - Stats and Assignee Grid
<!-- chat-id: 10f5197e-8429-434c-b379-93ecda5ecaaa -->

**Completed:** Simplified dashboard components with clean, minimal styling.

- [x] **StatsCards.tsx**:
  - Removed shimmer effect overlay completely
  - Removed icon whileHover scale and glow shadow (now static div)
  - Kept progress bar animation but removed glow shadow
  - Updated all colors to use semantic CSS variables (--accent, --success, --warning, --error)
  - Reduced animation delay multiplier from 0.1 to 0.05
  - Simplified progress bar transition (0.8s, easeOut)

- [x] **AssigneeGrid.tsx**:
  - Removed framer-motion import (no longer needed)
  - Replaced pulsing online indicator with static green dot
  - Removed avatar whileHover scale and glow
  - Updated color palette to use chart CSS variables (--chart-1 through --chart-6)
  - Simplified category badges (neutral background, subtle border)
  - View button uses --accent color, opacity reveal kept
  - Name header uses --text-primary instead of colored text

**Verification:** `pnpm lint` passes (0 errors)

---

### [x] Step: Chart Components - Remove Glow Filters
<!-- chat-id: 5f162a70-912d-4c86-bd13-b2ce617f28d2 -->

**Completed:** Simplified all three chart components with clean, minimal styling.

- [x] **CategoryRadialChart.tsx**:
  - Removed framer-motion import (no longer needed)
  - Removed SVG glow filter and linear gradients
  - Simplified tooltip styling (clean border, no glow shadow)
  - Removed legend item stagger animation (static rendering)
  - Removed legend item glow on color indicator dot
  - Updated colors to use chart CSS variables (--chart-1 through --chart-6)
  - Used `animate-fade-in` CSS class for entrance animation

- [x] **CategoryBarChart.tsx**:
  - Removed framer-motion import (no longer needed)
  - Removed SVG glow filter and linear gradients
  - Simplified tooltip styling (clean border, no glow shadow)
  - Updated grid and axis colors to use CSS variables (--border)
  - Removed gradient fills, using solid colors with opacity
  - Updated completion color from --neon-green to --success

- [x] **AssigneeDonutChart.tsx**:
  - Removed framer-motion import (no longer needed)
  - Removed SVG donut-glow filter and linear gradients
  - Removed tooltip animation (static tooltip)
  - Simplified tooltip styling (clean border, no glow shadow)
  - Updated center total number from gradient-text to solid color
  - Used `animate-fade-in` CSS class for entrance animation

**Verification:** `pnpm lint` passes (0 errors, 1 unrelated warning)

---

### [x] Step: Modal Components - Clean Form Styling
<!-- chat-id: 3f6d3735-3ada-43bd-ac1a-838b23663a64 -->

**Completed:** Simplified all three modal components with clean, minimal styling.

- [x] **TaskCreateModal.tsx**:
  - Removed framer-motion `motion.div` (replaced with plain `div` + CSS animations)
  - Removed neon border color (now uses `var(--border)`)
  - Removed box-shadow glow (now uses subtle shadow)
  - Replaced gradient header background with solid `var(--bg-secondary)`
  - Updated input focus ring to accent color (`focus:ring-[var(--accent)]`)
  - Cleaned submit button (solid `var(--accent)` background, no glow)
  - Replaced all neon color references with semantic CSS variables
  - Replaced `rounded-2xl` with `rounded-xl` for cleaner look
  - Removed `hover:scale` animations (now uses color transitions)

- [x] **TaskEditModal.tsx**:
  - Applied same changes as TaskCreateModal
  - Deprecated `color` prop (kept for backward compatibility)
  - Simplified progress slider to use CSS variables

- [x] **ScreenDesignUploadModal.tsx**:
  - Applied same changes as TaskCreateModal
  - Cleaned file upload drag zone (uses `var(--accent-bg)` when dragging)
  - Removed delete button glow, uses hover state with `var(--error-bg)`
  - Simplified loading overlay (removed framer-motion animation)

**CSS Updates:**
- Added shorthand alias CSS variables to `globals.css`:
  - `--accent`, `--success`, `--warning`, `--error`, `--info`
  - `--border`, `--bg-tertiary`
  - `--error-bg`, `--accent-bg`
- Added light theme variants for new variables

**Verification:** `pnpm lint` passes (0 errors, 1 unrelated warning)

---

### [x] Step: Final Verification and Cleanup
<!-- chat-id: 49b66f34-6554-4dc1-bd6e-95d8d5d91f0c -->

**Completed:** Final verification and cleanup performed.

- [x] Run `pnpm lint` - 0 errors, 1 pre-existing warning
- [x] Run `pnpm build` - Requires Supabase env vars (infrastructure, not code issue)
- [x] Updated remaining files with neon references:
  - [x] lib/supabase.ts - getStatusColor() updated
  - [x] app/page.tsx - Chart legends and badges updated
  - [x] app/assignee/[name]/page.tsx - All color refs updated
  - [x] app/assignee/[name]/AssigneeTaskList.tsx - Complete color overhaul
  - [x] app/assignee/[name]/AssigneeCategoryChart.tsx - Simplified progress bars
  - [x] components/screen-designs/ScreenDesignsClient.tsx - Complete color overhaul
- [x] Deprecated unused `color` props for backward compatibility
- [x] Write completion report to `.zenflow/tasks/new-task-56a6/report.md`

**Final Status:**
- All neon color references removed from source code
- All animations simplified to clean transitions
- Full backward compatibility maintained
- Report written with complete change summary

**Note:** Runtime testing requires Supabase environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Code verification completed through lint and static analysis.

