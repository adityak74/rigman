# RESEARCH: Phase 1 - Foundations & Scanner

## Tauri v2 + React + shadcn-ui + Tailwind v4
- **Initialization:** Use `npm create tauri-app@latest` with the React template.
- **Styling:** Tailwind v4 uses a CSS-first approach (`@import "tailwindcss";`). Integration with Vite is via `@tailwindcss/vite`.
- **shadcn-ui:** Initialize with `npx shadcn@latest init`. Use the `@/*` alias for imports.

## SQLite Integration
- **Approach:** Rust-centric using `rusqlite` or `sqlx` is preferred for a local-first app. This keeps the data logic in the backend and minimizes IPC overhead.
- **Schema:** 
  - `agents`: id, name, type, global_path, local_path.
  - `skills`: id, agent_id, name, path, scope (global/local), frontmatter (JSON), content (text), tags (JSON).
  - `hooks`: id, agent_id, name, path, lifecycle_event, command.

## File System Scanner (RIG-001)
- **Agent Paths:**
  - Claude: `~/.claude/skills/`, `.claude/skills/`
  - OpenCode: `~/.config/opencode/skills/`, `.opencode/skills/`
  - Cursor: `.cursor/skills/`, `.cursor/rules/`, `.cursorrules`, `~/.cursor/skills/`
  - Vercel: `~/.agents/skills/`, `.agents/skills/`
- **Watching:** Use Rust's `notify` crate for native performance. If a Node-based scanner is strictly required (per spec), use a Tauri **Sidecar** running a small Node script with `chokidar`.
- **Indexing:** Scan recursively, parse `SKILL.md` for YAML frontmatter, and store metadata in SQLite.

## Project Structure
- `src-tauri/`: Rust backend, SQLite logic, FS watcher.
- `src/`: React frontend, shadcn components.
- `agents.json`: Master mapping of agent types to search paths.

## 2026 Tech Notes
- Use **Bun** for faster package management if available.
- Tailwind v4 removes the need for `tailwind.config.js`.
- Tauri v2 has improved plugin architecture for SQL and FS access.
