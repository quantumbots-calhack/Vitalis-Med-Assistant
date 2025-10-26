# Medical Help Bot

A production-ready medical onboarding application built with Next.js 15, TypeScript, and modern React patterns.

## 🚀 Tech Stack

### Core

- **Next.js 16** (App Router) - React framework with server components
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework

### UI Components

- **shadcn/ui** - Accessible component library built on Radix UI primitives
- **Framer Motion** - Animation library
- **@rive-app/react-canvas** - Interactive animations
- **Sonner** - Toast notifications

### Forms & State

- **React Hook Form** - Performant form handling
- **Zod** - Schema validation
- **Zustand** - State management

### Backend

- **Supabase JS Client** - Backend as a service

### Testing & Quality

- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit checks

## 📦 Installation

```bash
npm install
```

## 🛠️ Available Scripts

| Script                 | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start development server on http://localhost:3000 |
| `npm run build`        | Build production application                      |
| `npm run start`        | Start production server                           |
| `npm run lint`         | Run ESLint                                        |
| `npm run lint:fix`     | Run ESLint with auto-fix                          |
| `npm run typecheck`    | Type-check TypeScript files                       |
| `npm run test`         | Run Jest unit tests                               |
| `npm run test:watch`   | Run Jest in watch mode                            |
| `npm run test:e2e`     | Run Playwright E2E tests                          |
| `npm run format`       | Format code with Prettier                         |
| `npm run format:check` | Check code formatting                             |

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

Sample test included at `src/components/__tests__/button.test.tsx`

### E2E Tests

```bash
npm run test:e2e
```

Sample E2E test included at `tests/homepage.spec.ts`

## 📁 Project Structure

```
medical-help-bot/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   └── __tests__/      # Component tests
│   ├── lib/                # Utility functions
│   └── types/              # TypeScript type definitions
├── tests/                  # E2E tests
├── public/                 # Static assets
├── .husky/                 # Git hooks
└── playwright.config.ts    # Playwright configuration
```

## 🎨 UI Components

The following shadcn/ui components are pre-installed:

- Button
- Input
- Label
- Select
- Textarea
- Form
- Sonner (Toast)

## 🔧 Configuration

### TypeScript

- Strict mode enabled
- Path aliases configured (`@/*` → `src/*`)

### ESLint

- Next.js recommended rules
- Prettier integration
- TypeScript support

### Prettier

- Single quotes
- 2-space indentation
- Semicolons enabled
- Trailing commas (ES5)

### Husky Pre-commit Hooks

Automatically runs on commit:

1. lint-staged (lint & format changed files)
2. Type checking
3. Unit tests

## 🚦 Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Run development server:**

   ```bash
   npm run dev
   ```

3. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Run tests:**
   ```bash
   npm run test        # Unit tests
   npm run test:e2e    # E2E tests
   ```

## 🎯 Next Steps

This scaffold is ready for you to build your medical onboarding features:

1. Add environment variables for Supabase
2. Set up authentication flow
3. Create onboarding form pages
4. Implement state management with Zustand
5. Add animations with Framer Motion or Rive
6. Build accessible forms with React Hook Form + Zod

## 📝 License

Private

---

Built with ❤️ using Next.js 15 and TypeScript
