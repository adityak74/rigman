# 🗞️ Rigman

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tauri](https://img.shields.io/badge/built%20with-Tauri-24c8db.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/frontend-React-61dafb.svg)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/styling-Tailwind%20v4-38bdf8.svg)](https://tailwindcss.com/)

**The "Newspaper" for your Agentic Intelligence Bureau.** Solve dot-dir hell with a unified desktop interface for scanning, indexing, and deploying AI agent skills.

---

## 🚀 Quick Start

Get your intelligence bureau running in less than 60 seconds.

### 📦 Installation

```bash
# Clone the intelligence files
git clone https://github.com/adityak74/rigman.git
cd rigman

# Install dependencies
npm install

# Launch the dashboard
npm run tauri dev
```

---

## 🛠️ Feature Matrix

| Feature | Description | Status |
| :--- | :--- | :--- |
| **Unified Scan** | Recursive discovery across 27+ agent directories | ✅ Live |
| **Vercel Bridge** | Visual wrapper for `npx skills` deployment | ✅ Live |
| **Secure Editor** | Side-by-side Markdown editor with YAML validation | ✅ Live |
| **Template Export** | Native ZIP collection export for portability | ✅ Live |
| **Intel Search** | Dynamic filtering across local and global registries | ✅ Live |

---

## 🧐 What is Rigman?

**Rigman** is a local-first desktop UI designed to solve the fragmentation of agentic coding workflows. By centralizing management of `SKILL.md` files and lifecycle hooks, Rigman provides a professional dashboard for subject matter expertise.

### 🌟 Core Capabilities

*   **📰 Newspaper Aesthetic:** A high-contrast, professional UI designed for rapid scanning and high-stakes intelligence management.
*   **📡 Intelligence Scanner:** Automatically indexes fragmented paths (e.g., `~/.claude`, `.cursor/rules`, `~/.gemini`) into a high-performance SQLite database.
*   **✍️ Secure Manifest Editor:** Edit your skills with confidence. Includes real-time validation for the mandatory `name` and `description` frontmatter fields.
*   **🌉 Vercel Bridge:** One-click deployment from the official Vercel Skills registry directly into your local agent environments.
*   **📦 Collection Export:** Bundle your local intelligence assets into standardized, portable ZIP archives for distribution or backup.

---

## 🏗️ Project Architecture

```text
rigman/
├── .planning/          # Mission control & roadmap tracking
├── src-tauri/          # 🦀 Rust Backend (SQLite, FS Scanner, ZIP Engine)
│   ├── src/
│   │   ├── scanner.rs  # Intelligence discovery logic
│   │   └── lib.rs      # Command registration & plugin bridge
│   └── capabilities/   # Secure FS & Shell permissions
├── src/                # ⚛️ React Frontend (Newspaper UI)
│   ├── App.tsx         # Main Intelligence Dashboard
│   └── App.css         # Tailwind v4 Styles
├── agents.json         # Master agent path mapping
└── README.md           # The manifest you are reading
```

---

## 🛠️ Technical Intelligence

### Requirements
- **Node.js**: v20 or later
- **Rust**: Latest stable (cargo)
- **Permissions**: FS Read/Write for `~/.claude`, `~/.cursor`, etc.

### Tech Stack
- **Engine**: [Tauri v2](https://tauri.app/) (Rust)
- **Interface**: [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Visuals**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Storage**: [SQLite](https://www.sqlite.org/)
- **Editor**: `@uiw/react-md-editor`

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Aditya Karnam](https://adityakarnam.com/)
