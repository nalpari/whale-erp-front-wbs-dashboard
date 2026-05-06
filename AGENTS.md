# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WBS Dashboard frontend for Whale ERP system - a Next.js 16 application with TypeScript and Tailwind CSS v4. 프로젝트 진행률과 담당자별 현황을 시각화하는 대시보드.

## Development Commands

```bash
pnpm dev      # Start development server at localhost:3000
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint (eslint 9 flat config)
```

No test framework is configured.

## Tech Stack

- **Framework:** Next.js 16.1.2 with App Router
- **React:** 19.2.3
- **Styling:** Tailwind CSS v4 (via @tailwindcss/postcss, no tailwind.config — uses CSS-first config in globals.css)
- **Language:** TypeScript 5 (strict mode)
- **Linting:** ESLint 9 flat config (core-web-vitals + typescript)
- **Database:** Supabase (tasks, screen_design_posts, screen_design_files tables + Storage)
- **Charts:** Recharts 3.6
- **Animations:** Framer Motion 12
- **Icons:** Lucide React
- **Package Manager:** pnpm

## Architecture

### App Router Structure

All routes use the Next.js App Router pattern with Server Components as pages and `revalidate = 60` (ISR):

- `app/page.tsx` — Main dashboard: stats cards, charts, assignee grid
- `app/assignee/[name]/page.tsx` — 담당자별 상세 대시보드 (dynamic route, URL-encoded Korean names)
- `app/screen-designs/page.tsx` — 화면설계서 게시판 (post + file attachments)
- `app/layout.tsx` — Root layout: Outfit + Space Mono fonts, ThemeProvider wraps all pages

### Server vs Client Component Pattern

Pages are async Server Components that fetch data via `lib/supabase.ts` and pass it down as props. Interactive sections use `'use client'` components that receive `initialTasks`/`initialDesigns` props from their parent Server Component. This means **mutations happen client-side** (e.g., task edit/create modals call Supabase directly from the browser using `NEXT_PUBLIC_` env vars).

### Data Layer

`lib/supabase.ts` — All Supabase client setup, types, and data functions:

- **Task CRUD:** `getTasks()`, `getTasksByAssignee()`, `createTask()`, `updateTask()`, `deleteTask()`
- **Stats aggregation:** `getCategoryStats()`, `getAssigneeStats()` — computed in JS from full task list
- **Screen designs (1:N):** `getScreenDesignPosts()`, `createScreenDesignPost()`, `deleteScreenDesignPost()`, `deleteScreenDesignFile()` — posts have multiple file attachments via `screen_design_files` table

Key types: `Task`, `TaskStatus` (`'대기중' | '진행중' | '완료' | '이슈' | '버그' | '취소'`), `CategoryStats`, `AssigneeStats`, `ScreenDesignPostWithFiles`

환경변수 필요:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Component Organization

```
components/
├── charts/           # Recharts wrappers (CategoryRadialChart, AssigneeDonutChart, CategoryBarChart)
├── dashboard/        # Main page sections (StatsCards, AssigneeGrid)
├── layout/           # Header (shared across pages)
├── screen-designs/   # ScreenDesignsClient (client component for 화면설계서)
└── ui/               # Reusable: GlowCard, ProgressRing, AnimatedCounter, ThemeToggle,
                      #           TaskCreateModal, TaskEditModal, ScreenDesignUploadModal
```

Assignee detail page has co-located components in `app/assignee/[name]/`:
- `AssigneeTaskSection.tsx` — client component managing task list + edit/create
- `AssigneeTaskList.tsx` — renders filtered/sorted task rows
- `AssigneeCategoryChart.tsx` — category progress bars for one assignee

### Shared Utilities

- `lib/assignee-colors.ts` — Fixed color mapping for known assignees + hash-based fallback for new ones. Returns `{ color: string, glow: GlowColor }`.
- `lib/theme-context.tsx` — Dark/Light toggle via React Context. Sets `data-theme` attribute on `<html>`. Access with `useTheme()` hook.

### Theme & Styling System

CSS variables defined in `app/globals.css` with `:root` (dark) and `[data-theme="light"]` selectors:

- **Colors:** `--bg-primary`, `--bg-secondary`, `--bg-card`, `--text-primary`, `--text-secondary`, `--text-muted`
- **Semantic:** `--accent` (blue), `--success`, `--warning`, `--error`, `--info`
- **Charts:** `--chart-1` through `--chart-6`
- **Spacing/shape:** `--radius-sm/md/lg`, `--shadow-sm/card/elevated`

Inline styles using `style={{ color: 'var(--text-primary)' }}` are used extensively (not Tailwind classes) for theme-aware colors. Tailwind is used for layout/spacing.

Utility classes: `.glass`, `.gradient-text`, `.card`, `.card-hover`, `.animate-slide-up`, `.animate-fade-in`

### Code Style

Prettier config (`.prettierrc`): single quotes, no semicolons, 2-space indent, trailing commas.

### Path Aliases

`@/*` maps to project root:
```typescript
import { getTasks } from '@/lib/supabase'
```

## Memo
- task를 수행할때는 karpathy-guidelines 를 따른다.
- 모든 답변과 추론과정은 한국어로 작성해주세요. 
- task를 마무리할 때 필요하다면 AGENTS.md, README.md 문서를 업데이트한다.

## Git Commit Message

### 형식

```
<type>: <subject>

<body (선택)>
```

### Type

| Type | 용도 |
|------|------|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `refactor` | 기능 변경 없는 코드 구조 개선 |
| `style` | 코드 포맷팅, 세미콜론 누락 등 (동작 변경 없음) |
| `docs` | 문서 변경 |
| `chore` | 빌드, 설정, 의존성 등 기타 변경 |
| `test` | 테스트 추가/수정 |

### 규칙

- subject는 **한글**, 50자 이내, 동사 원형으로 시작 (e.g. `Add`, `Fix`, `Update`)
- body는 선택사항이며, "무엇을 왜" 변경했는지 간결하게 서술
- body 작성 시 subject와 빈 줄로 구분

### 예시

```
feat: Add user authentication with JWT

Implement login/signup API routes with JWT token generation
and middleware-based route protection.
```

```
fix: Resolve prisma client singleton leak in dev mode
```