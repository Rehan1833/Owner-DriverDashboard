# SmartOps Enterprise UI/UX Design Guidelines

This document outlines the visual system, theme rules, and responsive design systems used in the SmartOps client dashboard.

---

## 🎨 Palette Color System

The primary branding uses a professional Teal theme for enterprise SaaS applications:

- **Primary Brand Color**: `#006A6A` (Dark teal, high visual hierarchy)
- **Primary Accent Color**: `#00A3A3` (Medium vibrant teal, active links, hover actions)
- **Background Layer (Dark Mode)**: `#0F172A` / `#0B1220` (Deep indigo slate)
- **Sidebar Panels**: `#111827` (Clean premium charcoal black)

Theme CSS variables are declared globally in [variables.css](file:///c:/smartops-owner-dashboard/frontend/src/styles/variables.css) and registered in Tailwind under the `@theme` directive in [globals.css](file:///c:/smartops-owner-dashboard/frontend/src/styles/globals.css).

---

## 🌟 Glassmorphism & Panel Styling

Premium components (e.g. telemetry metrics, charts, modals) should apply glassmorphism utility classes:

- **Styling Details**:
  - Light mode: `background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.5);`
  - Dark mode: `background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.08);`
- **Utility Selector**: Use `.glass-panel` to apply these rules consistently across cards and headers.

---

## 📐 Grid Spacing Rules

- **Responsive Grid**: Use a 12-column grid layout on dashboard pages.
- **Max Width**: Keep parent layouts constrained to `max-width: 1600px` for optimal readability on high-density desktop displays.
- **Standard Gap & Padding**: Maintain a standard spacing gap of `24px` (`gap-6`, `p-6` or `p-8`) to separate widget panels.
- **Corners Radius**: Use `rounded-3xl` (`24px`) or `rounded-2xl` (`16px`) for cards and input fields to maintain soft, friendly edges.
- **Typography**: Utilize the Google Font `Inter` as the primary sans-serif typeface.
