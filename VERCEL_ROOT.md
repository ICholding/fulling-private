# Vercel Configuration Settings

**Root Directory**: `.` (leave blank - repository root)

**Build Command**: `pnpm run build`

**Install Command**: `pnpm install`

**Output Directory**: `.next` (default - leave blank)

**Framework Preset**: Next.js (auto-detected)

**Node Version**: 20.x or 22.x (auto-detected from engines)

---

## Required Environment Variables

```bash
AUTH_MODE=disabled
DATABASE_URL=postgresql://user:pass@localhost:5432/fulling
```

Optional:
```bash
SKIP_ENV_VALIDATION=1
```

---

## Verification

- ✅ Next.js app at repository root
- ✅ `next` v16.0.10 in dependencies
- ✅ `react` v19.2.1 in dependencies
- ✅ `react-dom` v19.2.1 in dependencies
- ✅ `package.json` at root
- ✅ `next.config.ts` at root
- ✅ `app/` directory at root (App Router)
- ✅ pnpm v10.20.0 configured
