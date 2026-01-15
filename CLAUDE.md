# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

WBS Dashboard frontend for Whale ERP system - a Next.js 16 application with TypeScript and Tailwind CSS v4.

## Development Commands

```bash
npm run dev      # Start development server at localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Framework:** Next.js 16.1.2 with App Router
- **React:** 19.2.3
- **Styling:** Tailwind CSS v4 (via @tailwindcss/postcss)
- **Language:** TypeScript 5 (strict mode)
- **Linting:** ESLint 9 with flat config (core-web-vitals + typescript)

## Architecture

### App Router Structure

All routes use the Next.js App Router pattern in `app/`:
- `app/layout.tsx` - Root layout with Geist fonts and global styles
- `app/page.tsx` - Route pages (default export, server components by default)
- `app/globals.css` - Global styles with Tailwind imports

### Path Aliases

Use `@/*` to import from project root:
```typescript
import { Component } from "@/components/Component";
```

### Component Patterns

- **Server Components:** Default for all components in App Router
- **Client Components:** Add `"use client"` directive at top when needed
- **Fonts:** Using `next/font/google` for Geist Sans and Geist Mono
- **Images:** Use `next/image` for automatic optimization

### Styling Conventions

- Tailwind CSS v4 utility classes
- CSS variables for fonts: `--font-geist-sans`, `--font-geist-mono`
- Dark mode: Use `dark:` prefix for dark mode variants
- Responsive: Use `sm:`, `md:`, `lg:` breakpoint prefixes
