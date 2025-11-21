# FileShare 🚀

> Built with: ⚛️ **React** · ▲ **Next.js** · 🎨 **Tailwind CSS** · 🧩 **Radix UI** · 📦 **Insforge SDK**

A modern, secure, and user‑friendly web application for sharing files instantly with anyone. FileShare lets you upload large files, generate secure shareable links, and manage your content from a clean, responsive dashboard.

## Features ✨

- 🔐 **Secure file sharing** – Encrypted storage and secure links so your files stay protected.
- ⚡ **Fast uploads** – Optimized infrastructure for quick uploads and downloads.
- 📎 **Support for all common file types** – Documents, images, videos, archives, and more.
- 👥 **Collaboration‑ready** – Share files with teammates or clients in just a few clicks.
- 📊 **Download insights** – Track how many times your files are accessed.
- 🌓 **Modern UI with dark mode** – Polished, responsive interface with theme toggle.

## Tech Stack 🛠️

- **Framework:** Next.js (App Router)
- **UI:** React, Tailwind CSS, Radix UI, Lucide Icons
- **Notifications:** Sonner
- **Auth & Backend:** Insforge SDK

## Getting Started 💻

### Prerequisites

- Node.js (recommended LTS)
- A package manager such as **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd file-share
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

### Running the development server

Start the dev server on port **5000**:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Then open [http://localhost:5000](http://localhost:5000) in your browser.

The main landing page is located at `app/page.tsx`. Changes are hot‑reloaded as you edit.

### Building for production

Create an optimized production build:

```bash
npm run build
```

Start the production server (also on port **5000** by default):

```bash
npm run start
```

### Linting 🧹

Run ESLint checks:

```bash
npm run lint
```

## Project Structure 📁

- `app/` – App Router pages and layout, including the landing page and routes such as auth and dashboard.
- `components/` – Reusable UI components.
- `lib/` – Client libraries and configuration (e.g., Insforge client setup).
- `public/` – Static assets.

## Contributing 🤝

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request to help improve FileShare.

## License 📄

This project is provided as‑is for learning and experimentation. Add your preferred license terms here if you plan to distribute or open‑source it.
