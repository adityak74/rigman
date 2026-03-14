# PLAN: Phase 1 - Foundations & Scanner

## Objective
Initialize the Tauri project, set up the frontend architecture with shadcn-ui and Tailwind v4, and implement the core backend scanning and indexing engine for agent skills.

## Tasks

### Sub-task 1: Project Initialization
- [ ] Initialize Tauri v2 project using `npm create tauri-app@latest`.
- [ ] Set up `src-tauri` with necessary dependencies: `rusqlite`, `notify`, `serde`, `serde_json`, `walkdir`.
- [ ] Configure `package.json` with frontend dependencies: `lucide-react`, `clsx`, `tailwind-merge`.

### Sub-task 2: Styling & UI Foundations
- [ ] Configure Tailwind CSS v4 in `vite.config.ts` and `src/index.css`.
- [ ] Initialize `shadcn-ui` with `npx shadcn@latest init`.
- [ ] Add base UI components: `button`, `input`, `card`, `scroll-area`, `badge`.
- [ ] Create `agents.json` in the root with mapping for at least 5 common agents.

### Sub-task 3: Backend Core - SQLite & Scanner
- [ ] Implement SQLite database initialization in Rust (`src-tauri/src/db.rs`).
- [ ] Develop the FS Scanner [RIG-001] using the `walkdir` crate.
- [ ] Implement native FS watching using the `notify` crate to detect changes in agent directories.
- [ ] Create a `scan_skills` Tauri command to trigger manual indexing and store results in SQLite.

### Sub-task 4: Frontend - Dashboard Layout
- [ ] Implement the main dashboard shell with a search bar and agent filter sidebar.
- [ ] Develop a `SkillsGrid` component to display indexed skills as cards.
- [ ] Connect the frontend to the backend using Tauri `invoke` calls to fetch indexed data.
- [ ] Add basic search functionality (filtering the local list of skills).

### Sub-task 5: Verification
- [ ] Verify that the scanner correctly identifies skills in `.claude/skills/` and other mock directories.
- [ ] Confirm that SQLite stores skill metadata and frontmatter correctly.
- [ ] Ensure the dashboard displays real data from the scan results.

## Strategy
1. **Initialize First:** Get the Tauri environment running with a basic React app.
2. **Backend Engine:** Build the scanner and database before the UI to ensure we have data to display.
3. **Reactive UI:** Use shadcn components to quickly build a professional dashboard.
4. **Iterative Refinement:** Start with simple recursive scanning, then add live watching and deep frontmatter parsing.

## Risk Assessment
- **FS Permissions:** Tauri apps need explicit permission to access directories outside the app bundle. We'll need to configure this in `tauri.conf.json`.
- **Cross-platform Paths:** Handling `~` and platform-specific paths for agents needs careful implementation in Rust.
- **IPC Overhead:** Scanning thousands of files might block the UI if not done asynchronously in a separate Rust thread.
