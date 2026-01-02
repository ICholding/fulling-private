# Fulling Auth Fix - Exact Checklist for Production

Complete these steps in order. Each step is required.

## Pre-Deployment Checklist

### ✅ Repository Setup
- [ ] All code changes committed and pushed to `main` branch
- [ ] Build succeeds locally: `npm run build` completes without errors
- [ ] Migration files exist: `prisma/migrations/0_init/migration.sql` present
- [ ] No `.env` or `.env.local` files committed (should be in `.gitignore`)

### ✅ GitHub OAuth App Creation

**Complete on GitHub:**

Go to https://github.com/settings/developers → OAuth Apps → New OAuth App

```
Application name: Fulling
Homepage URL: https://fulling.vercel.app
Authorization callback URL: https://fulling.vercel.app/api/auth/callback/github
```

After creation:
- [ ] Client ID copied: ___________________
- [ ] Client Secret generated and copied: ___________________
- [ ] NOT a GitHub App (no Webhooks tab visible)

**Do NOT create a GitHub App for webhooks.**

### ✅ Database Setup

Choose one option and complete:

**Option A: Neon Postgres (Recommended)**
- [ ] Account created at https://neon.tech
- [ ] New project created
- [ ] Connection string copied: `postgresql://user:pass@host/db`
  ```
  postgresql://user_XXXXXXXX:password_XXXXX@ep-XXXXX.us-east-1.aws.neon.tech/fulling
  ```

**Option B: Other Managed PostgreSQL**
- [ ] Database created (Railway/Supabase/etc)
- [ ] Connection string copied and tested
- [ ] Database is publicly accessible from Vercel

⚠️ **MUST be PostgreSQL, NOT SQLite** (SQLite has no persistent storage on Vercel)

### ✅ NEXTAUTH_SECRET Generation

In your terminal, run:
```bash
openssl rand -base64 32
```

- [ ] Secret generated and copied: ___________________
  
  Example format: `ZXjK9+qW8vL2mNxP4hRqA1bC3dEfGhIjKlMnOpQrStU=`

## Vercel Configuration Steps

### ✅ Step 1: Open Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select the **Fulling** project
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)

### ✅ Step 2: Add Production Environment Variables

For each variable below, click "Add New" and enter exactly:

```
Key: NEXTAUTH_URL
Value: https://fulling.vercel.app
Environment: Production
Add to Production: ✓
```

```
Key: NEXTAUTH_SECRET
Value: [paste from openssl output above]
Environment: Production
Add to Production: ✓
```

```
Key: DATABASE_URL
Value: [paste connection string from Step 1]
Environment: Production
Add to Production: ✓
```

```
Key: ENABLE_PASSWORD_AUTH
Value: true
Environment: Production
Add to Production: ✓
```

```
Key: ENABLE_GITHUB_AUTH
Value: true
Environment: Production
Add to Production: ✓
```

```
Key: GITHUB_CLIENT_ID
Value: [paste from GitHub OAuth App - Client ID]
Environment: Production
Add to Production: ✓
```

```
Key: GITHUB_CLIENT_SECRET
Value: [paste from GitHub OAuth App - Client Secret]
Environment: Production
Add to Production: ✓
```

```
Key: NODE_ENV
Value: production
Environment: Production
Add to Production: ✓
```

- [ ] All 8 variables added to Production
- [ ] All variables visible in Environment Variables list
- [ ] Verified no variables in Preview environment

### ✅ Step 3: Deploy

Option A (Automatic - Recommended):
1. In terminal: `git push origin main`
2. Vercel will auto-redeploy
3. Wait for "Ready" status

Option B (Manual):
1. Go to Vercel → Deployments tab
2. Find latest deployment
3. Click ⋮ (three dots) → Redeploy

- [ ] Deployment shows "Ready" (not "Building" or "Failed")
- [ ] Build took ~2 minutes
- [ ] Checked build logs (no errors)

## Production Testing Checklist

### ✅ Test Credentials Registration

1. Open https://fulling.vercel.app/login
2. Enter:
   - Username: `testuser1`
   - Password: `mypassword123`
3. Click "Sign in / Register"
4. Result: Should redirect to `/projects` page
5. - [ ] Registration succeeded (first login auto-creates account)

### ✅ Test Credentials Login

1. Go back to https://fulling.vercel.app/login
2. Logout first (if session exists): Open dev tools, find `/projects` page, logout
3. Enter same credentials:
   - Username: `testuser1`
   - Password: `mypassword123`
4. Click "Sign in / Register"
5. Result: Should redirect to `/projects` page immediately
6. - [ ] Login succeeded (user already exists, no registration)

### ✅ Test GitHub OAuth

1. Go to https://fulling.vercel.app/login
2. Click "Continue with GitHub" button
3. Result: Redirects to github.com and shows authorize dialog
4. Click "Authorize" button
5. Result: Redirects back to `fulling.vercel.app` and shows `/projects` page
6. - [ ] GitHub login succeeded (user created or logged in)

### ✅ Test Session Persistence

1. While logged in on `/projects` page
2. Refresh the page (F5)
3. Result: Page reloads and user still logged in (session persists)
4. - [ ] Session works correctly

### ✅ Check Debug Logs (Optional)

1. Go to Vercel Dashboard → Project → Logs (top menu)
2. Click "Function Logs" tab
3. Trigger a login from `/login` page
4. Look for log lines like:
   ```
   [Credentials] Attempting login for: testuser1
   [Auth Success] User logged in: testuser1
   ```
   OR
   ```
   [GitHub] signIn callback triggered
   [GitHub] Creating new user from GitHub profile
   ```
5. - [ ] Auth debug logs appear in Vercel logs

## Troubleshooting

### Issue: Build fails with "Prisma migration" error

**Check these in order:**
1. Verify DATABASE_URL syntax is correct
2. Test DATABASE_URL locally:
   ```bash
   psql "postgresql://user:pass@host/db"
   ```
3. Confirm database server is running
4. Redeploy after fixing

### Issue: "Invalid username or password" persists

**Check these:**
1. DATABASE_URL exists in Vercel env vars
2. Database was created and migrations ran
3. Browser cookies cleared (Settings → Cookies)
4. Check Vercel Function Logs for `[Auth Error]`

### Issue: "Continue with GitHub" does nothing

**Check these:**
1. ENABLE_GITHUB_AUTH = `true` in Vercel
2. GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET are set
3. GitHub OAuth app settings:
   - Homepage URL: `https://fulling.vercel.app` (exactly)
   - Callback URL: `https://fulling.vercel.app/api/auth/callback/github` (exactly)
4. Check Vercel logs for `[GitHub]` messages

### Issue: "NEXTAUTH_SECRET not set" error

**Steps:**
1. Verify NEXTAUTH_SECRET is in Vercel env vars
2. Redeploy (settings change requires rebuild)
3. Generate new secret if needed: `openssl rand -base64 32`

## Success Criteria

✅ All of these work:
- [ ] New user registration via credentials (auto-creates account)
- [ ] Existing user login via credentials
- [ ] GitHub OAuth redirect and authorization
- [ ] GitHub user auto-creation and login
- [ ] Session persists after page refresh
- [ ] `/projects` page loads when authenticated

## Next Steps

1. Share https://fulling.vercel.app/login with users
2. Users can:
   - Sign in / Register with username/password
   - Sign in with GitHub
3. Monitor Vercel logs for any auth errors

---

**Completed all steps?** You're done! Both credentials and GitHub auth should work on Vercel.

**Questions?** See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed explanations.
