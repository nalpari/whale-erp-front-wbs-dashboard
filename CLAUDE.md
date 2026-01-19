# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WBS Dashboard frontend for Whale ERP system - a Next.js 16 application with TypeScript and Tailwind CSS v4. 프로젝트 진행률과 담당자별 현황을 시각화하는 대시보드.

## Development Commands

```bash
pnpm dev      # Start development server at localhost:3000
pnpm build    # Production build
pnpm start    # Start production server
pnpm lint     # Run ESLint
```

## Tech Stack

- **Framework:** Next.js 16.1.2 with App Router
- **React:** 19.2.3
- **Styling:** Tailwind CSS v4 (via @tailwindcss/postcss)
- **Language:** TypeScript 5 (strict mode)
- **Linting:** ESLint 9 with flat config (core-web-vitals + typescript)
- **Database:** Supabase (tasks 테이블)
- **Charts:** Recharts 3.6
- **Animations:** Framer Motion 12
- **Icons:** Lucide React

## Architecture

### App Router Structure

All routes use the Next.js App Router pattern in `app/`:
- `app/layout.tsx` - Root layout with Outfit/Space Mono fonts, ThemeProvider
- `app/page.tsx` - Main dashboard (Server Component, `revalidate = 60`)
- `app/assignee/[name]/page.tsx` - 담당자별 상세 대시보드
- `app/globals.css` - Cyberpunk glassmorphism 테마 CSS 변수 및 애니메이션

### Data Layer

`lib/supabase.ts` - Supabase 클라이언트 및 데이터 fetching 함수:
- `getTasks()`, `getTasksByAssignee(name)` - Task 조회
- `getCategoryStats()`, `getAssigneeStats()` - 통계 데이터 집계
- Task 인터페이스: `id`, `category`, `task_title`, `assignee`, `progress`, `due_date` 등

환경변수 필요:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Component Organization

```
components/
├── charts/        # Recharts 기반 차트 (CategoryRadialChart, AssigneeDonutChart 등)
├── dashboard/     # 대시보드 섹션 (StatsCards, AssigneeGrid)
├── layout/        # Header
└── ui/            # 재사용 UI (GlowCard, ProgressRing, AnimatedCounter, ThemeToggle)
```

### Path Aliases

Use `@/*` to import from project root:
```typescript
import { Component } from "@/components/Component";
```

### Theme System

`lib/theme-context.tsx` - Dark/Light 테마 토글:
- `data-theme` 속성으로 테마 전환
- localStorage에 테마 저장
- `useTheme()` hook으로 접근

### Styling Conventions

- **CSS 변수 기반 테마:** `--bg-primary`, `--text-primary`, `--neon-cyan` 등
- **네온 컬러:** cyan, magenta, purple, pink, green, orange
- **Glass effect:** `.glass` 클래스, `backdrop-filter: blur()`
- **Animations:** `.animate-slide-up`, `.animate-scale-in`, `.animate-float` 등
- **Gradient text:** `.gradient-text` 클래스
