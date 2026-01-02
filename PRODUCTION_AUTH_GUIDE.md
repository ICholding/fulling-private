# Fulling Authentication - Production Deployment Guide

## Overview

The authentication system is now hardened with strict configuration validation. It will **refuse to start** if any critical environment variables are missing, preventing silent failures in production.

## Current Status

✅ **Code Ready for Production**

- Strict env validation module (`lib/env-auth.ts`)
- NextAuth configured with `trustHost: true`
- Health check endpoint (`/api/health-auth`)
- Production domain enforcement
- Clear error messages with fix instructions

## Required Environment Variables

### Critical (Build fails without these)

| Var | Value | Where to Get | Example |
|-----|-------|--------------|---------|
| `NEXTAUTH_URL` | Production domain | Fixed | `https://fulling.vercel.app` |
| `NEXTAUTH_SECRET` | 32+ char secret | Generate | `openssl rand -base64 32` |
| `DATABASE_URL` | PostgreSQL URL | Database provider | `postgresql://user:pass@host:5432/db` |
| `GITHUB_CLIENT_ID` | GitHub OAuth ID | GitHub settings | `abc123def456...` |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | GitHub settings | `ghp_xxxxxxxxxxxx...` |

### Optional but Recommended

| Var | Value | Default | Notes |
|-----|-------|---------|-------|
| `ENABLE_GITHUB_AUTH` | `true` or `false` | `false` | Set to `true` in production |
| `ENABLE_PASSWORD_AUTH` | `true` or `false` | `true` | Can disable if using GitHub only |
| `NODE_ENV` | `production` or `development` | Detected | Vercel auto-sets to `production` |
| `DEBUG_AUTH` | `true` or `false` | `false` | Leave `false` in production |

## Deployment Steps

### 1. Create GitHub OAuth App

1. Go to https://github.com/settings/developers
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: `Fulling`
   - **Homepage URL**: `https://fulling.vercel.app` ⚠️ **MUST MATCH EXACTLY**
   - **Authorization callback URL**: `https://fulling.vercel.app/api/auth/callback/github` ⚠️ **MUST MATCH EXACTLY**
4. Click **Register application**
5. Copy **Client ID**
6. Click **Generate a new client secret** and copy it
7. Keep these safe - you'll need them next

### 2. Set Up PostgreSQL Database

Choose one:

**Option A: Neon (Recommended)**
- Go to https://neon.tech
- Sign up and create a project
- Copy the connection string: `postgresql://user:password@neon.tech:5432/database`

**Option B: Other Options**
- Railway: https://railway.app
- Supabase: https://supabase.com
- Render: https://render.com
- Any managed PostgreSQL with public connectivity

**⚠️ DO NOT USE SQLite** - Vercel has no persistent filesystem

### 3. Generate NEXTAUTH_SECRET

In your terminal:
```bash
openssl rand -base64 32
```

Example output: `ZXjK9+qW8vL2mNxP4hRqA1bC3dEfGhIjKlMnOpQrStU=`

Copy this value.

### 4. Add Environment Variables to Vercel

1. Go to https://vercel.com/dashboard
2. Select **Fulling** project
3. Go to **Settings** → **Environment Variables**
4. For each variable below, click **Add New** and fill in:
   - **Key**: (from table)
   - **Value**: (exact value)
   - **Environments**: Select **Production**
   - Click **Save**

| Key | Value |
|-----|-------|
| `NEXTAUTH_URL` | `https://fulling.vercel.app` |
| `NEXTAUTH_SECRET` | `[paste your generated secret]` |
| `DATABASE_URL` | `[paste your PostgreSQL connection string]` |
| `GITHUB_CLIENT_ID` | `[paste from GitHub OAuth app]` |
| `GITHUB_CLIENT_SECRET` | `[paste from GitHub OAuth app]` |
| `ENABLE_GITHUB_AUTH` | `true` |

**⚠️ IMPORTANT**: Select **Production** environment only (not Preview)

### 5. Redeploy

Push to trigger redeploy:
```bash
git push origin main
```

Or manually in Vercel: Deployments tab → Click latest → Redeploy button

Wait for build to complete (2-3 minutes)

### 6. Verify Configuration

Once deployed, check:
```
https://fulling.vercel.app/api/health-auth
```

Should return:
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
  "timestamp": "2026-01-01T10:00:00.000Z"
}
```

If any fields show issues or missing vars, fix them and redeploy.

## Testing Production Auth

### Test 1: Credentials Login
1. Go to https://fulling.vercel.app/login
2. Create new account:
   - Username: `testuser`
   - Password: `testpass123`
3. Click "Sign in / Register"
4. Should redirect to `/projects` page
5. Logout and login again with same credentials
6. Should work immediately

### Test 2: GitHub OAuth
1. Go to https://fulling.vercel.app/login
2. Click "Continue with GitHub"
3. Should redirect to github.com/login (or authorize if already logged in)
4. Click "Authorize Fulling"
5. Should redirect back to `/projects` with GitHub user logged in
6. Session should persist on page refresh

## Troubleshooting

### Problem: "AUTH_CONFIG_ERROR" at login

**Solution:**
1. Visit https://fulling.vercel.app/api/health-auth
2. Check the `issues` array for what's missing
3. Add the missing vars to Vercel
4. Redeploy: git push or use Vercel dashboard
5. Wait 2-3 minutes for build to complete
6. Try login again

### Problem: GitHub button doesn't work / reloads page

**Common causes:**
1. **ENABLE_GITHUB_AUTH not set to `true`** in Vercel
   - Fix: Add `ENABLE_GITHUB_AUTH=true` to Vercel and redeploy
   
2. **GitHub OAuth app callback URL doesn't match**
   - Current: Should be `https://fulling.vercel.app/api/auth/callback/github`
   - Fix: Go to GitHub → Settings → Developers → OAuth Apps → Edit app
   - Update "Authorization callback URL" to exact match
   
3. **GitHub OAuth app homepage URL doesn't match**
   - Current: Should be `https://fulling.vercel.app`
   - Fix: Go to GitHub OAuth app settings and update homepage URL exactly

4. **NEXTAUTH_URL doesn't match production domain**
   - Current: Should be exactly `https://fulling.vercel.app` (no http://, no trailing /)
   - Fix: Update in Vercel env vars and redeploy

### Problem: "NEXTAUTH_SECRET not set" or "Invalid secret"

**Solution:**
1. Check Vercel env var `NEXTAUTH_SECRET` is set
2. If not set, generate with: `openssl rand -base64 32`
3. Add to Vercel and redeploy

### Problem: Database errors during login

**Check:**
1. `DATABASE_URL` is set in Vercel
2. Connection string starts with `postgresql://`
3. Database server is running and accessible
4. No SQLite (will not work on Vercel)

**Solution:**
1. Test connection locally: `psql <your connection string>`
2. If fails, check database provider status
3. Update DATABASE_URL and redeploy

### Problem: Vercel build fails

**Check logs:**
1. Vercel Dashboard → Project → Deployments
2. Click failed deployment
3. Look for lines starting with `AUTH_CONFIG` or `Error`
4. Fix missing env vars (see Troubleshooting section above)

## How Auth Works

### Credentials (Username/Password)

1. User enters username and password on `/login`
2. Frontend calls `signIn('credentials', {...})`
3. NextAuth calls `authorize()` in `lib/auth.ts:70-129`
4. Logic:
   - Find user by username in database
   - If not found: **auto-register** (create new user)
   - If found: verify password hash with bcrypt
5. On success: create JWT and set session cookie
6. Redirect to `/projects`

### GitHub OAuth

1. User clicks "Continue with GitHub" on `/login`
2. Frontend calls `signIn('github', {...})`
3. NextAuth redirects to github.com/login/oauth/authorize
4. User authorizes the app on GitHub
5. GitHub redirects to `/api/auth/callback/github`
6. NextAuth calls `signIn()` callback in `lib/auth.ts:402-510`
7. Logic:
   - Check if user exists by GitHub ID
   - If not found: **auto-register** (create new user)
   - If found: update GitHub token
8. Create JWT and set session cookie
9. Redirect to `/projects`

## Files Modified

- `lib/env-auth.ts` - **NEW** Strict env validation
- `lib/auth.ts` - Call validation, add trustHost
- `app/api/health-auth/route.ts` - **NEW** Health check endpoint
- `README.md` - Production setup guide and env var reference

## Deployment Checklist

Before marking as production-ready:

- [ ] GitHub OAuth app created with correct URLs
- [ ] PostgreSQL database created and accessible
- [ ] NEXTAUTH_SECRET generated
- [ ] All 5 required env vars added to Vercel
- [ ] `/api/health-auth` returns `"ok": true`
- [ ] Credentials login works (new user + existing user)
- [ ] GitHub login works (redirect + callback)
- [ ] Session persists on page refresh
- [ ] No errors in Vercel Function Logs

## Support

If you encounter issues:

1. **Check logs**: Vercel Dashboard → Logs → Function Logs
2. **Health check**: https://fulling.vercel.app/api/health-auth
3. **Git commit**: Look at recent auth fixes
4. **Documentation**: See README.md Production Authentication Setup section

---

**Status**: ✅ Ready for production deployment  
**Last Updated**: 2026-01-01  
**Next Step**: Follow "Deployment Steps" section above
