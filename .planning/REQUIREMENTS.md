# REQUIREMENTS: Rigman

## System Features

### [RIG-001] Agent Path Scanner
**Priority:** Critical
**Description:** Recursively scan known agent paths for skills/hooks/configs.
**Acceptance Criteria:**
- Scans 27+ agents (Claude, OpenCode, Cursor, Gemini, etc.).
- Indexes to SQLite: id, name, path, agent, frontmatter, preview, tags.
- Watches for live changes using `chokidar`.
- Correctly handles project, global, and local scopes.

### [RIG-002] Vercel Skills Integration
**Priority:** High
**Description:** Visual wrapper around `npx skills` CLI.
**Acceptance Criteria:**
- "Install Vercel React Best Practices" button for specified agents.
- Preview `SKILL.md` before installation.
- Show installation progress and target location.
- Support for `--global` and project-specific scope.
- Capability to update and remove existing skills.

### [RIG-003] Skills Editor
**Priority:** High
**Description:** Markdown editor for `SKILL.md` with frontmatter parsing.
**Acceptance Criteria:**
- Split-view interface: Raw markdown and rendered preview.
- YAML frontmatter validation (name and description required).
- Live error checking for YAML and markdown syntax.
- Save function to update the original file path.
- Diff view for tracking changes before saving.

### [RIG-004] Hooks Timeline
**Priority:** Medium
**Description:** Visual editor for lifecycle hooks in configuration files (e.g., `.claude/settings.json`).
**Acceptance Criteria:**
- Drag-and-drop interface for adding commands like `pnpm lint` to lifecycle slots.
- Visual timeline of events: SessionStart, PreToolUse, PostToolUse, SessionEnd.
- JSON validation and syntax highlighting for hook configurations.
- Preset templates for common tasks like linting, testing, and git operations.

## UI/UX Requirements
- Dashboard with grid view of skills, including search and filtering by agent and scope.
- Side-by-side editing interface for skills.
- Intuitive drag-and-drop timeline for hooks.
- Consistent styling with `shadcn-ui` and Tailwind.

## Non-Functional Requirements
- **Local-first:** Application runs as a native desktop UI with Tauri; no cloud dependencies.
- **Speed:** Fast indexing and search across a high volume of local skill files.
- **Safety:** Secure file system operations when editing agent configurations.
