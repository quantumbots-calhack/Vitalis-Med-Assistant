# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Verify Setup

```bash
npm run typecheck  # TypeScript check
npm run lint       # ESLint check
npm run test       # Run unit tests
```

## 🛠️ Common Commands

| Task                       | Command             |
| -------------------------- | ------------------- |
| 🚀 Start dev server        | `npm run dev`       |
| 🏗️ Build for production    | `npm run build`     |
| ▶️ Start production server | `npm run start`     |
| 🧪 Run unit tests          | `npm run test`      |
| 🎭 Run E2E tests           | `npm run test:e2e`  |
| 🔍 Type check              | `npm run typecheck` |
| 🧹 Lint code               | `npm run lint`      |
| ✨ Format code             | `npm run format`    |

## 📦 What's Included

- ✅ Next.js 16 (App Router)
- ✅ React 19 + TypeScript
- ✅ Tailwind CSS v4
- ✅ shadcn/ui components
- ✅ Framer Motion
- ✅ @rive-app/react-canvas
- ✅ React Hook Form + Zod
- ✅ Zustand state management
- ✅ Supabase client
- ✅ Jest + React Testing Library
- ✅ Playwright E2E testing
- ✅ ESLint + Prettier
- ✅ Husky pre-commit hooks

## 📖 Example Code

### Create a Form with Validation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { basicSchema } from '@/lib/validation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function MyForm() {
  const form = useForm({
    resolver: zodResolver(patientInfoSchema),
  });

  return (
    <form onSubmit={form.handleSubmit((data) => console.log(data))}>
      <Input {...form.register('firstName')} />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Use Global State

```typescript
import { useOnboardingStore } from '@/lib/store';

export default function StepCounter() {
  const { currentStep, setCurrentStep } = useOnboardingStore();

  return (
    <button onClick={() => setCurrentStep(currentStep + 1)}>
      Next Step ({currentStep})
    </button>
  );
}
```

### Add Animation

```typescript
import { motion } from 'framer-motion';

export default function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Content here
    </motion.div>
  );
}
```

## 🎯 Next Steps

1. **Set up Supabase** - Add your env variables
2. **Create pages** - Add routes in `src/app`
3. **Build components** - Use shadcn/ui components
4. **Add forms** - Use React Hook Form + Zod
5. **Manage state** - Use Zustand store
6. **Write tests** - Add tests as you build

## 📚 Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod](https://zod.dev)
- [Zustand](https://zustand-demo.pmnd.rs)
- [Framer Motion](https://www.framer.com/motion)
- [Supabase](https://supabase.com/docs)

## 🆘 Troubleshooting

**Port already in use?**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Dependencies not installing?**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Tests failing?**

```bash
# Clear Jest cache
npm run test -- --clearCache
```

---

Happy coding! 🎉
