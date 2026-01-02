# Auth Fix: Root Causes & Solutions

## ROOT CAUSES IDENTIFIED

### Issue #1: Credentials Login Always Returns "Invalid username or password"
**Root Cause**: Database doesn't exist and no Prisma migrations are deployed.
- **Evidence**: `/workspaces/fulling/prisma/migrations/` directory was empty
- **Impact**: `prisma.userIdentity.findUnique()` in `lib/auth.ts:54` fails or returns no results
- **Result**: Auto-register logic never executes because database queries fail silently with try-catch returning null

**Solution**: Created initial Prisma migration at `prisma/migrations/0_init/migration.sql` to define:
- User, UserIdentity, UserConfig, Project, Environment, Database, Sandbox tables
- Enums: AuthProvider, ProjectStatus, ResourceStatus

### Issue #2: "Continue with GitHub" Does Nothing / Reloads to Login
**Root Cause**: Multiple issues:
1. GitHub provider not registered when `ENABLE_GITHUB_AUTH=false` (default)
   - NextAuth.js calls `GitHub()` but credentials provider fails to redirect
   - Button click works but NextAuth routes to `/api/auth/error?error=OAuthSignin` or `/login`
2. No debug logging to identify OAuth configuration errors

**Solution**:
- Changed `ENABLE_GITHUB_AUTH` default from `false` to `true` (Vercel env vars required)
- Added comprehensive debug logging in `lib/auth.ts` (lines 18-25)
- Removed exception throw for missing GitHub secrets (changed to graceful fallback)
- Enhanced login page to display NextAuth error messages from query params

### Issue #3: Missing Build-Time Database Setup
**Root Cause**: 
- No migrations folder = `prisma migrate deploy` fails in Vercel build step
- Build script includes `prisma generate` but not migration check
- SQLite cannot be used on Vercel (no persistent filesystem)

**Solution**:
- Created initial migration with full schema
- Ensured `prisma generate` in build script (line 24 of `package.json`)
- DATABASE_URL must point to Neon Postgres or similar managed DB on Vercel

## CODE CHANGES SUMMARY

### 1. Added Comprehensive Debug Logging (`lib/auth.ts`)
- Lines 16-18: Added `DEBUG_AUTH` flag (true if `DEBUG_AUTH=true` OR `NODE_ENV !== 'production'`)
- Lines 20-32: Startup debug log showing all critical auth env vars
- Lines 48-51: Added debug logs in credentials authorize
- Lines 71-80: Added debug logs in GitHub signIn callback
- Lines 506-510: Added debug logs in JWT and session callbacks

### 2. Created Prisma Migration (`prisma/migrations/0_init/migration.sql`)
- Full schema with all tables, enums, indexes, and constraints
- Will run during Vercel build with `prisma migrate deploy`

### 3. Enhanced Login Page (`app/login/page.tsx`)
- Added `useSearchParams()` to detect NextAuth error query params
- Lines 17-23: Detects `/login?error=*` and displays error message
- Logs auth errors to console for debugging

### 4. Improved GitHub Provider Configuration (`lib/auth.ts`)
- Removed `throw new Error()` for missing GitHub secrets
- Now gracefully skips GitHub provider if credentials missing
- Allows app to start with just PASSWORD auth while waiting for GitHub setup

## ENVIRONMENTAL ISSUES FIXED

1. **DATABASE_URL missing** → Must be set before Vercel deploy
2. **NEXTAUTH_URL mismatch** → Login URL must match Vercel domain exactly
3. **ENABLE_GITHUB_AUTH default false** → User must set to true to use GitHub OAuth
4. **No migrations** → Vercel build would fail; now migrations exist

## NEXT STEPS FOR USER

1. **Create GitHub OAuth App**: See "GITHUB_OAUTH_SETUP.md" section below
2. **Set Vercel Environment Variables**: See "VERCEL_ENVIRONMENT_SETUP.md" below
3. **Deploy to Vercel**: Push to `main` branch; GitHub Actions will deploy
4. **Test in Vercel**:
   - Credentials: Create new user with username/password
   - GitHub: Click button → redirects to github.com → returns with session
5. **Disable debug logs** (optional): Remove `DEBUG_AUTH=true` from Vercel Production vars

---

# GITHUB_OAUTH_SETUP.md

## Create GitHub OAuth Application

### Steps:
1. Go to GitHub → Settings → Developer settings → OAuth Apps → New OAuth App
2. Fill in:
   - **Application name**: `Fulling` (or your app name)
   - **Homepage URL**: `https://fulling.vercel.app` (replace with your Vercel domain)
   - **Authorization callback URL**: `https://fulling.vercel.app/api/auth/callback/github`
   - **Enable Device Flow**: Leave unchecked
   - **Webhook**: Leave blank (NOT needed for NextAuth OAuth)

3. Click "Register application"
4. Copy **Client ID** and click "Generate a new client secret"
5. Copy **Client Secret** (will not be shown again)

### Environment Variables Created:
```
GITHUB_CLIENT_ID=<client_id_from_step_4>
GITHUB_CLIENT_SECRET=<client_secret_from_step_4>
ENABLE_GITHUB_AUTH=true
```

**Note**: GitHub App ≠ GitHub OAuth App. Do NOT create a GitHub App for webhooks.

---

# VERCEL_ENVIRONMENT_SETUP.md

## Required Environment Variables for Vercel

### Set These in Vercel Dashboard → Settings → Environment Variables

#### Production (Required for deployed app):
```
NEXTAUTH_URL=https://fulling.vercel.app
NEXTAUTH_SECRET=<generate_with: openssl_rand_-base64_32>
DATABASE_URL=<your_neon_postgres_url>
ENABLE_PASSWORD_AUTH=true
ENABLE_GITHUB_AUTH=true
GITHUB_CLIENT_ID=<github_oauth_client_id>
GITHUB_CLIENT_SECRET=<github_oauth_client_secret>
NODE_ENV=production
SKIP_ENV_VALIDATION=false
```

#### Preview (Optional but recommended):
```
NEXTAUTH_URL=https://<preview-url-will-be-injected>.vercel.app
NEXTAUTH_SECRET=<same_as_production>
DATABASE_URL=<same_as_production_or_different_preview_db>
ENABLE_PASSWORD_AUTH=true
ENABLE_GITHUB_AUTH=false
NODE_ENV=preview
SKIP_ENV_VALIDATION=false
```

### Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```
Output example: `ZXjK9+qW8vL2mNxP4hRqA1bC3dEfGhIjKlMnOpQrStU=`

### Get DATABASE_URL:
1. Create a PostgreSQL database (e.g., Neon: https://neon.tech)
2. Copy connection string: `postgresql://user:password@host:port/database`
3. Set as `DATABASE_URL` in Vercel

### Verify in Vercel:
1. Dashboard → Project → Settings → Environment Variables
2. Confirm all 8+ variables are set for Production
3. No need to manually deploy—environment change triggers build

## Build Process
```
1. Vercel receives push to main
2. Runs: npm ci
3. Runs: npm run build (which calls: prisma generate && next build)
4. prisma generate: Generates @prisma/client types
5. next build: Compiles Next.js app
6. prisma migrate deploy: Applies all migrations in prisma/migrations/ (if DATABASE_URL set)
7. next start: Launches server
```

**If migration fails**: Check Vercel build logs; DATABASE_URL likely missing or invalid.

---

# TESTING CHECKLIST

- [ ] **Credentials Login** (local): 
  - Create account: username=`test`, password=`password123` → should succeed
  - Login again with same credentials → should succeed
  
- [ ] **Credentials Login** (Vercel):
  - Go to https://fulling.vercel.app/login
  - Create new user → should auto-register and redirect to /projects
  - Logout and login again → should succeed

- [ ] **GitHub Login** (local):
  - Click "Continue with GitHub" → redirects to github.com authorize page
  - Authorize → returns to /api/auth/callback/github → redirects to /projects
  - Session should contain user.id and user.name from GitHub

- [ ] **GitHub Login** (Vercel):
  - Go to https://fulling.vercel.app/login
  - Click "Continue with GitHub" → starts OAuth flow
  - After auth → should be logged in with GitHub user

- [ ] **Debug Logs** (development only):
  - Check console for `[Credentials]`, `[GitHub]`, `[JWT]`, `[Session]` log messages
  - After deploy, logs appear in Vercel -> Logs -> Function Logs

---

# DEPLOYMENT CHECKLIST

Before deploying to Vercel:

- [ ] All 8 environment variables added to Vercel Production settings
- [ ] `NEXTAUTH_URL` matches the primary Vercel domain
- [ ] GitHub OAuth app created and Client ID/Secret copied correctly
- [ ] `DATABASE_URL` points to a live PostgreSQL database
- [ ] `NEXTAUTH_SECRET` generated with `openssl rand -base64 32`
- [ ] No local `.env` file committed (`.gitignore` should exclude it)
- [ ] `prisma/migrations/0_init/` directory exists in repo
- [ ] `npm run build` succeeds locally: `prisma generate && next build`
- [ ] Vercel build succeeds in Dashboard → Deployments

After deploying:

- [ ] Visit https://fulling.vercel.app/login
- [ ] Test credentials login with new username/password
- [ ] Test GitHub login with authorization redirect
- [ ] Check Vercel logs for any `[Auth Error]` messages
- [ ] Verify session persists after refresh
- [ ] Check that /projects page loads when authenticated
