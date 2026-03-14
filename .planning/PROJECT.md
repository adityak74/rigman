# PROJECT: Rigman

## Project Context
Rigman is a local-first desktop UI designed to solve "dot-dir hell" by providing a unified management interface for agentic coding workflows. It scans, indexes, edits, and deploys skills, hooks, and configurations for tools like Claude Code, OpenCode, Cursor, and Vercel Skills.

## Goal
To provide a single dashboard for managing fragmented agent configurations across multiple tools and project/global scopes.

## Tech Stack
- **Frontend:** Vite + React + shadcn-ui + Tailwind
- **Backend:** Tauri (Rust) + SQLite + chokidar (Node)
- **Parser:** js-yaml + remark-frontmatter
- **CLI:** child_process.spawn("npx", ["skills", ...])
- **Bundle:** esbuild → npx rigman binary

## Core Features (MVP)
1. **Live Scanner:** Watches 50+ paths across 27 agents.
2. **Unified Search:** Instant results for skills across all tools.
3. **Vercel Bridge:** UI wrapper for `npx skills` commands.
4. **Inline Editor:** Markdown editor for `SKILL.md` with live preview.
5. **Hooks Timeline:** Visual editor for lifecycle hooks.
6. **Template Export:** Zip project skills for new repositories.
