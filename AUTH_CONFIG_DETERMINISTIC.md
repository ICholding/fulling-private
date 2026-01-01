# Auth Configuration: Deterministic & Failure-Proof (Latest Iteration)

## Overview

This document details the latest hardening of authentication configuration to make failures impossible to miss and easy to fix on Vercel production.

**Status**: ✅ All implementation complete - Ready for production deployment

---

## What Was Implemented

### 1. ✅ Strict Environment Validation (lib/env-auth.ts)

**Purpose**: Fail loudly with explicit missing variables instead of silent failures

**Validates at runtime**:
- ✅ `NEXTAUTH_SECRET` exists and is 32+ characters
- ✅ `NEXTAUTH_URL` exists and matches `https://fulling.vercel.app` in production
- ✅ `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` (if GitHub auth expected)
- ✅ `DATABASE_URL` is PostgreSQL (not SQLite)

**Error thrown**: `AUTH_CONFIGURATION_ERROR` with explicit list of missing vars

**Code location**: `lib/auth.ts:17-43`
```typescript
const authValidation = validateAuthEnv()
if (!authValidation.isValid) {
  // Throws AUTH_CONFIGURATION_ERROR with missing var list
  throw new Error(`AUTH_CONFIGURATION_ERROR: Missing: ${missingAll.join(', ')}...`)
}
```

---

### 2. ✅ Structured Error Logging (lib/auth.ts)

**Purpose**: Make Vercel logs scannable and actionable

**JSON error log** (appears first in Vercel logs):
```json
{
  "level": "FATAL",
  "module": "auth",
  "code": "AUTH_ENV_MISSING",
  "timestamp": "2026-01-01T12:00:00.000Z",
  "environment": "production",
  "missing": ["NEXTAUTH_SECRET", "GITHUB_CLIENT_ID"],
  "issues": [
    "NEXTAUTH_SECRET is not set. Generate with: openssl rand -base64 32",
    "GitHub OAuth is not configured. Missing: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET..."
  ],
  "hint": "Set missing env vars in Vercel Dashboard → Project Settings → Environment Variables (Production) and redeploy",
  "docs": "https://github.com/FullAgent/fulling#production-authentication-setup"
}
```

**Code location**: `lib/auth.ts:24-32`
```typescript
console.error(
  JSON.stringify({
    level: 'FATAL',
    module: 'auth',
    code: 'AUTH_ENV_MISSING',
    missing: missingAll,
    issues: authValidation.issues,
    hint: 'Set missing env vars in Vercel Dashboard...',
    docs: 'https://github.com/FullAgent/fulling#production-authentication-setup'
  })
)
```

---

### 3. ✅ GitHub Auth UI Toggle (app/login/page.tsx)

**Purpose**: Prevent user confusion when GitHub auth is disabled

**Behavior**:
- Fetches auth status from `/api/health-auth` on page load
- If `ENABLE_GITHUB_AUTH=true` AND GitHub credentials exist → Show "Continue with GitHub" button
- If disabled → Show helpful message: "GitHub login is not configured. Contact your administrator..."

**Code location**: `app/login/page.tsx:13-44`
```typescript
// Load GitHub auth enabled status from /api/health-auth
useEffect(() => {
  const checkGithubAuth = async () => {
    const response = await fetch('/api/health-auth');
    const data = await response.json();
    setEnableGithub(data.hasGitHub === true);
  };
  checkGithubAuth();
}, []);

// Conditional rendering:
{enableGithub ? (
  <Button onClick={() => signIn('github', ...)}>Continue with GitHub</Button>
) : (
  <div>GitHub login is not configured...</div>
)}
```

---

### 4. ✅ Health Check Endpoint (app/api/health-auth/route.ts)

**Purpose**: Provide safe diagnostics without exposing secrets

**Endpoint**: `GET /api/health-auth`

**Response (Healthy)**:
```json
{
  "status": "healthy",
  "ok": true,
  "productionUrl": "https://fulling.vercel.app",
  "runtimeUrl": "https://fulling.vercel.app",
  "environment": "production",
  "missing": {
    "auth": [],
    "github": [],
    "database": []
  },
  "issues": [],
  "warnings": [],
  "hasDatabase": true,
  "hasGitHub": true,
  "hasSecret": true,
  "timestamp": "2026-01-01T12:00:00.000Z"
}
```

**Response (Unhealthy)** (HTTP 503):
```json
{
  "status": "unhealthy",
  "ok": false,
  "missing": {
    "auth": ["NEXTAUTH_SECRET"],
    "github": ["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
    "database": []
  },
  "issues": [
    "NEXTAUTH_SECRET is not set. Generate with: openssl rand -base64 32",
    "GitHub OAuth is not configured..."
  ],
  "error": "Auth configuration is incomplete or invalid"
}
```

---

## 5 Required Environment Variables for Production

### Set in Vercel Dashboard: Settings → Environment Variables → Production

| Variable | Value | How to Generate |
|----------|-------|-----------------|
| `NEXTAUTH_URL` | `https://fulling.vercel.app` | Copy exactly (no trailing slash) |
| `NEXTAUTH_SECRET` | 32+ random chars | Run: `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL connection string | Create database in Neon/Railway/Supabase, copy URL |
| `GITHUB_CLIENT_ID` | From GitHub OAuth app | GitHub Settings → Developers → OAuth Apps → Client ID |
| `GITHUB_CLIENT_SECRET` | From GitHub OAuth app | GitHub Settings → Developers → OAuth Apps → Client Secret |

### Optional Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `ENABLE_PASSWORD_AUTH` | `true` or `false` | Default: `true` - enables credentials login |
| `ENABLE_GITHUB_AUTH` | `true` or `false` | Default: `false` - set to `true` to enable GitHub button |

---

## How to Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: `Fulling`
   - **Homepage URL**: `https://fulling.vercel.app` (EXACT)
   - **Authorization callback URL**: `https://fulling.vercel.app/api/auth/callback/github` (EXACT)
4. Click **Register application**
5. Copy **Client ID** (top of page)
6. Click **Generate a new client secret** and copy it
7. Add to Vercel:
   - `GITHUB_CLIENT_ID=<the ID>`
   - `GITHUB_CLIENT_SECRET=<the secret>`

---

## How to Set Up PostgreSQL Database

Choose one:

### Option 1: Neon (Recommended - free tier available)
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create project → Get connection string
4. Add to Vercel as `DATABASE_URL`

### Option 2: Railway
1. Go to https://railway.app
2. Create new project → PostgreSQL
3. Copy connection string from Variables tab
4. Add to Vercel as `DATABASE_URL`

### Option 3: Supabase
1. Go to https://supabase.com
2. Create project
3. Get connection string from Project Settings → Database → Connection Pooling
4. Add to Vercel as `DATABASE_URL`

**⚠️ DO NOT use SQLite** - Vercel has no persistent filesystem; SQLite will lose all data on redeploy

---

## Deployment Verification Checklist

After adding all 5 env vars to Vercel and redeploying:

- [ ] Visit `https://fulling.vercel.app/api/health-auth`
- [ ] Should return JSON with `"ok": true`
- [ ] If `"ok": false`, read the `issues` array for exactly what's missing

### Expected Health Response:
```json
{
  "ok": true,
  "status": "healthy",
  "hasDatabase": true,
  "hasGitHub": true,
  "hasSecret": true,
  "issues": []
}
```

### If Unhealthy:
1. Check Vercel logs: Dashboard → Logs → Function Logs
2. Look for JSON error with code `"AUTH_ENV_MISSING"`
3. Fix missing vars listed in `"missing"` array
4. Redeploy: `git push` or click Redeploy in Vercel

---

## Testing Production Auth

### Test 1: Login with Credentials
```
1. Go to https://fulling.vercel.app/login
2. Username: testuser
3. Password: testpass
4. Click "Sign in / Register"
5. Should redirect to /projects with session
```

### Test 2: GitHub OAuth
```
1. Go to https://fulling.vercel.app/login
2. Click "Continue with GitHub" (only visible if enabled)
3. Redirects to github.com
4. Click "Authorize Fulling"
5. Should redirect back to /projects with GitHub session
```

### Test 3: Session Persistence
```
1. Log in (either method)
2. Press F5 on /projects page
3. Should stay logged in (no redirect to login)
```

---

## Vercel Logs: Where to Find Auth Errors

### Location
Vercel Dashboard → Your Project → **Logs** → **Function Logs**

### What to Look For
1. **Structured JSON error** (appears first) - code: `AUTH_ENV_MISSING`
2. **Auth startup debug** (if DEBUG_AUTH=true)
3. **Build logs** showing Prisma migrations applied

### Example Log Entry
```
[FATAL] AUTH_ENV_MISSING
{
  "level":"FATAL",
  "module":"auth",
  "code":"AUTH_ENV_MISSING",
  "missing":["NEXTAUTH_SECRET","GITHUB_CLIENT_ID"],
  "hint":"Set missing env vars in Vercel Dashboard..."
}
```

---

## Troubleshooting Quick Reference

### Problem: "AUTH_CONFIG_ERROR" on Login Page
**Solution**:
1. Go to `https://fulling.vercel.app/api/health-auth`
2. Read the `issues` array
3. Set missing vars in Vercel
4. Click Redeploy

### Problem: GitHub Button Not Showing
**Solution**:
- Check that `ENABLE_GITHUB_AUTH=true` in Vercel
- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
- Message says: "GitHub login is not configured" if either is missing
- Redeploy after setting vars

### Problem: GitHub OAuth Redirects Back to Login
**Solution**:
1. Check GitHub OAuth app settings
2. Verify **Authorization callback URL** is exactly: `https://fulling.vercel.app/api/auth/callback/github`
3. Check Vercel logs for error
4. Ensure `NEXTAUTH_URL=https://fulling.vercel.app` (exact match)

### Problem: Build Fails with "DATABASE_URL" Error
**Solution**:
- Set `DATABASE_URL` in Vercel env vars (production environment)
- Must be PostgreSQL (starts with `postgresql://`)
- Redeploy

### Problem: "Invalid username or password" on Every Login
**Solution**:
1. Check that `DATABASE_URL` is set and accessible
2. Check `/api/health-auth` returns `"hasDatabase": true`
3. Ensure PostgreSQL database is running (not paused/deleted)
4. Check Vercel logs for database connection errors

---

## Files Modified in This Iteration

1. **app/login/page.tsx**
   - Added `enableGithub` state
   - Fetch auth status from `/api/health-auth` on load
   - Conditional rendering: show GitHub button only if enabled
   - Show helpful message if disabled

2. **lib/auth.ts**
   - Added structured JSON error logging
   - Includes missing vars, issues, hint, documentation link
   - Logs BEFORE throwing, so appears first in Vercel logs

3. **lib/env-auth.ts** (from previous iteration)
   - Validates all 5 critical env vars
   - Returns detailed validation result with issues

4. **app/api/health-auth/route.ts** (from previous iteration)
   - GET endpoint returns JSON health status
   - Safe for production (no secrets in response)

---

## Implementation Summary

| Feature | Status | Location |
|---------|--------|----------|
| Strict env validation | ✅ | `lib/env-auth.ts` |
| Validation call at startup | ✅ | `lib/auth.ts:17-43` |
| Structured error logging | ✅ | `lib/auth.ts:24-32` |
| Health check endpoint | ✅ | `app/api/health-auth/route.ts` |
| GitHub UI toggle | ✅ | `app/login/page.tsx:21-44` |
| README documentation | ✅ | `README.md#production-authentication-setup` |
| GitHub callback URL documented | ✅ | `README.md` + GitHub OAuth app |
| Production checklist | ✅ | `README.md` + this document |

---

## Key Improvements Over Previous Versions

| Issue | Previous | Now |
|-------|----------|-----|
| Missing env vars | Vague "AUTH_CONFIG_ERROR" | Explicit JSON listing exact missing vars |
| Finding errors in logs | Hard to spot among other logs | Structured JSON with `"code":"AUTH_ENV_MISSING"` appears first |
| GitHub button behavior | Shows even when disabled | Only shows if `ENABLE_GITHUB_AUTH=true` AND credentials exist |
| Health diagnostics | No way to check config | `/api/health-auth` returns JSON status with fixes |
| Documentation clarity | Scattered across files | README section + this comprehensive guide |

---

## Guarantee

✅ **No Silent Failures**: If any critical env var is missing, application will throw `AUTH_CONFIGURATION_ERROR` at startup

✅ **No Generic Errors**: Error message includes exact list of missing variables

✅ **Production Domain Enforced**: `NEXTAUTH_URL` must be `https://fulling.vercel.app` in production (prevents OAuth on preview domains)

✅ **Database Required**: `DATABASE_URL` must be PostgreSQL (SQLite explicitly rejected with error)

✅ **Diagnostics Available**: `/api/health-auth` endpoint provides JSON status without exposing secrets

✅ **UI Feedback**: GitHub button only appears when configured and enabled

---

## Next Steps

1. **Deploy**: `git push` to trigger Vercel redeploy
2. **Set Env Vars**:
   - Vercel Dashboard → Project Settings → Environment Variables
   - Add all 5 vars with correct values (see table above)
3. **Verify**: Visit `https://fulling.vercel.app/api/health-auth` should return `"ok": true`
4. **Test**: Try credentials login and GitHub OAuth
5. **Debug**: If issues, check Vercel logs for structured error

---

## Questions or Issues?

All documentation is in the repository:
- [PRODUCTION_AUTH_GUIDE.md](./PRODUCTION_AUTH_GUIDE.md) - Detailed deployment guide
- [README.md#production-authentication-setup](./README.md#production-authentication-setup) - Setup section
- [AUTH_FIX_IMPLEMENTATION.md](./AUTH_FIX_IMPLEMENTATION.md) - Technical deep dive

**Latest commit**: `56b03d4` - "Make auth config deterministic with UI toggle and structured error logging"

---

**Last Updated**: January 1, 2026  
**Status**: Production Ready ✅
