# Rigman

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tauri](https://img.shields.io/badge/built%20with-Tauri-24c8db.svg)](https://tauri.app/)
[![React](https://img.shields.io/badge/frontend-React-61dafb.svg)](https://reactjs.org/)

**Rigman** is a local-first desktop UI designed to solve "dot-dir hell" by providing a unified management interface for agentic coding workflows. It scans, indexes, edits, and deploys skills and configurations for tools like Claude Code, OpenCode, Cursor, and Vercel Skills.

---

## 🗞️ Professional Newspaper Aesthetic
Rigman features a high-contrast, "Newspaper" style UI designed for clarity and a professional "Intelligence Bureau" feel. Every action is tracked in a real-time status bar, providing immediate feedback on background CLI and filesystem operations.

## ✨ Features

- **🔍 Unified Intelligence Search:** Instantly find skills across all agent directories (Claude, Cursor, OpenCode, etc.) and the global Vercel registry.
- **📡 Live Agent Scanner:** Automatically recursively scans and indexes 50+ paths across 27+ different agents.
- **✍️ Secure Manifest Editor:** A professional side-by-side Markdown editor for `SKILL.md` files with real-time YAML frontmatter validation.
- **🌉 Vercel Bridge:** A visual wrapper around the `npx skills` CLI, allowing for one-click deployment of high-performance agent skills.
- **📦 Template Export:** Zip your entire local skill collection into a portable archive using a native system save dialog.
- **🔒 Local-First & Secure:** Your configurations never leave your machine. Built with Rust and Tauri for maximum security and performance.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or later)
- [Rust](https://www.rust-lang.org/) (latest stable)
- [npx](https://www.npmjs.com/package/npx) (for Vercel Skills integration)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adityakarnam/rigman.git
   cd rigman
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run in development mode:
   ```bash
   npm run tauri dev
   ```

## 🛠️ Tech Stack

- **Backend:** [Tauri](https://tauri.app/) (Rust)
- **Frontend:** [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Database:** [SQLite](https://www.sqlite.org/) (via `tauri-plugin-sql`)
- **Editor:** `@uiw/react-md-editor`
- **Icons:** [Lucide React](https://lucide.dev/)

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Built with ❤️ by [Aditya Karnam](https://adityakarnam.com/)
