#  — RBAC Frontend

[![Next.js](https://img.shields.io/badge/Next.js-14+-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Lucide React](https://img.shields.io/badge/Icons-Lucide-222?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0OCIgaGVpZ2h0PSI0OCI+PHRleHQgeT0iNCI+TFVDSURFPC90ZXh0Pjwvc3ZnPg==)](https://lucide.dev/)
[![SweetAlert2](https://img.shields.io/badge/Alerts-SweetAlert2-FF6F61?logo=sweetalert2&logoColor=white)](https://sweetalert2.github.io/)
[![JWT](https://img.shields.io/badge/Auth-JWT-FF7A00)](https://jwt.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A modern, Figma-first frontend for a high-performance Role-Based Access Control (RBAC) admin panel — "Obliq Admin". Built with Next.js (App Router), TypeScript, and Tailwind CSS, Obliq Admin implements dynamic, atom-level permission gating so routes and UI components are protected by fine-grained permission atoms rather than coarse roles.

Primary Brand Color: `#F26522` (Obliq Orange)

---

Table of Contents
- Overview
- Technology Stack
- Key Features
- Project Structure
- Getting Started
  - Prerequisites
  - Clone & Install
  - Environment Variables
  - Run Locally
- Authentication & Security
- Design Guidelines
- Routing & Permission Middleware
- UI & Components
- Testing & QA
- Deployment
- Contributing
- License

---

## Overview
Obliq Admin is a pixel-perfect admin UI implemented from Figma designs (Obliq Orange theme). It focuses on secure, scalable RBAC where permissions are managed atomically — each UI action or route checks permission atoms for access control. The frontend pairs with a secure backend (JWT auth in httpOnly cookies) to provide a production-ready administrative console.

---

## Technology Stack
- Next.js 14+ (App Router) — optimized routing, SSR and partial rendering
- TypeScript — typesafety and developer DX
- Tailwind CSS — utility-first, Figma-aligned styling
- Lucide React — lightweight, consistent iconography
- SweetAlert2 — polished alerts & confirmations
- Fetch / Axios — API integration (configurable)
- JWT (httpOnly cookies) — secure authentication token handling

---

## Key Features
- Figma-first, pixel-accurate UI (Obliq Orange theme)
- Atom-based dynamic permission gating (UI & routes)
- Animated, responsive login & onboarding flows
- Secure JWT-based auth stored in httpOnly cookies (no localStorage)
- Route guarding via Next.js middleware
- Reusable component library (buttons, inputs, tables, modals)
- Clean TypeScript types for permissions, user, and API responses
- Tailwind config tuned for the Obliq design system

---

## Project Structure
src/
├── app/                # Next.js App Router (pages, layout, route handlers)
├── components/         # Reusable UI components (Button, Input, Sidebar, etc.)
├── hooks/              # Custom hooks (useAuth, usePermissions, useFetch)
├── services/           # API clients and auth helpers (fetch/axios wrappers)
├── config/             # App constants, Tailwind/Theme config
├── middleware.ts       # Route and resource gating by permission atoms
├── types/              # Global TypeScript interfaces and enums
├── styles/             # Tailwind globals and custom CSS
└── utils/              # Helpers (formatters, validators)

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A backend API that supports:
  - JWT auth via httpOnly cookie
  - Permission atom checks (for middleware and UI)
  - Endpoints for login, profile, permissions, logout

### Clone & Install
```bash
git clone https://github.com/your-username/obliq-admin.git
cd obliq-admin
npm install
# or
yarn