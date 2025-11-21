# FileShare 🚀

<div align="center">

**A modern, secure file-sharing platform built for speed and simplicity.**

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-blue?style=flat&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)

</div>

---

## 📚 Overview

FileShare is a full-stack web application that enables users to upload, store, and share files securely. With support for files up to 10GB, unlimited uploads, and end-to-end encryption, FileShare provides an enterprise-grade file-sharing experience with a consumer-friendly interface.

**Key Highlights:**
- ⚡ Lightning-fast uploads and downloads
- 🔐 End-to-end encryption for maximum security
- 📊 Real-time download analytics and tracking
- 🌍 Share via link, QR code, or direct download
- 🌓 Beautiful, responsive UI with dark mode support

---

## ✨ Features

### Core Functionality
- 📂 **Unlimited File Uploads** - Upload as many files as you need with support for files up to 10GB
- 🔗 **Instant Link Generation** - Get shareable links immediately after upload
- 📱 **QR Code Sharing** - Generate QR codes for easy mobile sharing
- 📊 **Download Analytics** - Track views and downloads in real-time
- 🔐 **Secure Storage** - End-to-end encryption with secure authentication

### User Experience
- 🎨 **Modern Interface** - Clean, intuitive design built with Radix UI components
- 🌓 **Dark Mode** - Full theme support with seamless toggling
- 📱 **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- ⚡ **Real-time Updates** - Live upload progress and instant notifications
- 🚀 **Performance Optimized** - Built on Next.js App Router for lightning-fast navigation

### Security & Privacy
- 🔒 **User Authentication** - Secure sign-up and login via Insforge SDK
- 🛡️ **Protected Routes** - Dashboard and file management behind authentication
- 🔐 **Encrypted Storage** - Files are stored securely with encryption at rest

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library:** [React 19](https://reactjs.org/)
- **Language:** [TypeScript 5](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **Components:** [Radix UI](https://www.radix-ui.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)

### Backend & Services
- **BaaS:** [Insforge SDK](https://insforge.com/) (Authentication, Database, Storage)
- **File Storage:** Insforge Storage with 10GB file size limit
- **Authentication:** Email/Password + OAuth via Insforge Auth

### Development Tools
- **Package Manager:** npm / yarn / pnpm / bun
- **Linting:** ESLint with Next.js configuration
- **Build Tool:** Next.js built-in compiler with Turbopack support

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **npm** / **yarn** / **pnpm** / **bun** (package manager)
- **Git** for version control

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/dumindu2041329/file-share.git
   cd file-share
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env.local` file in the root directory and add your Insforge credentials:

   ```bash
   NEXT_PUBLIC_INSFORGE_URL=your_insforge_url
   NEXT_PUBLIC_INSFORGE_ANON_KEY=your_anon_key
   ```

### Development

**Start the development server:**

```bash
npm run dev
```

The application will be available at **[http://localhost:5000](http://localhost:5000)**

> 💡 **Tip:** The app uses hot-reloading, so changes are reflected instantly.

### Production Build

**Build the application:**

```bash
npm run build
```

**Start the production server:**

```bash
npm run start
```

### Code Quality

**Run linting:**

```bash
npm run lint
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 5000 |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint code quality checks |

---

## 📁 Project Structure

```
file-share/
├── app/                    # Next.js App Router
│   ├── auth/               # Authentication pages (login, signup)
│   ├── dashboard/          # Protected dashboard route
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/             # Reusable React components
│   ├── ui/                 # UI components (Button, Card, Dialog, etc.)
│   └── theme-toggle.tsx    # Theme switcher component
├── lib/                    # Utility functions and configurations
│   ├── insforge.ts         # Insforge client initialization
│   └── utils.ts            # Helper functions
├── public/                 # Static assets (images, fonts, etc.)
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── next.config.js          # Next.js configuration
```

### Key Directories

- **`app/`** - Contains all pages and layouts using Next.js App Router architecture
- **`components/`** - Reusable UI components built with Radix UI primitives
- **`lib/`** - Core utilities, including Insforge SDK client setup
- **`public/`** - Static files served directly by Next.js

---

## 🤝 Contributing

We welcome contributions from the community! Here’s how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Contribution Guidelines

- Follow existing code style and conventions
- Write clear, descriptive commit messages
- Add tests for new features when applicable
- Update documentation as needed
- Ensure all linting checks pass before submitting

### Reporting Issues

Found a bug or have a feature request? Please [open an issue](https://github.com/dumindu2041329/file-share/issues) with:
- A clear description of the problem or suggestion
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Screenshots if applicable

---

## 📝 License

This project is available for personal and educational use. For commercial use or distribution, please contact the repository owner.

---

## 👨‍💻 Author

**Dumindu**  
GitHub: [@dumindu2041329](https://github.com/dumindu2041329)

---

<div align="center">

**Built with ❤️ using Next.js and Insforge**

If you find this project helpful, please consider giving it a ⭐️!

</div>
