# Vercel Deployment Guide for Fulling

## Quick Start (Fastest - Disabled Auth Mode)

For the fastest deployment without any authentication:

### Step 1: Deploy to Vercel

```bash
vercel deploy --prod
```

### Step 2: Set Environment Variables in Vercel Dashboard

Go to your project → Settings → Environment Variables and add:

```bash
# Disabled Auth Mode (No login required)
AUTH_MODE=disabled
SKIP_ENV_VALIDATION=1
DATABASE_URL=postgresql://user:pass@localhost:5432/fulling
```

That's it! Your app will deploy and allow instant access without any login.

---

## Production Deployment Options

### Option 1: Disabled Mode (Development/Testing Only)

**Use Case**: Quick prototyping, demos, internal tools without sensitive data

**Required Variables**:
```bash
AUTH_MODE=disabled
DATABASE_URL=postgresql://your-db-url  # Optional for project features
```

**Optional Variables**:
```bash
SINGLE_USER_EMAIL=owner@example.com    # Default user email
SKIP_ENV_VALIDATION=1                  # Skip env validation
```

**⚠️ WARNING**: Do not use disabled mode with sensitive data in production.

---

### Option 2: Single-User Mode (Recommended for Production)

**Use Case**: Single admin/owner deployment, maximum security

**Required Variables**:
```bash
# Auth Configuration
AUTH_MODE=single_user
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-min-32-chars

# Single User Credentials
ENABLE_PASSWORD_AUTH=true
ENABLE_GITHUB_AUTH=false
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD_HASH=bcrypt-hash-here

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

**Generate Password Hash**:
```bash
node scripts/hash-password.cjs "YourSecurePassword"
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

---

### Option 3: Multi-User Mode (Team Deployments)

**Use Case**: Multiple users with GitHub OAuth

**Required Variables**:
```bash
# Auth Configuration
AUTH_MODE=multi_user
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-secret-min-32-chars

# GitHub OAuth
ENABLE_PASSWORD_AUTH=true
ENABLE_GITHUB_AUTH=true
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Database (Required)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

**Setup GitHub OAuth**:
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Set Homepage URL: `https://your-app.vercel.app`
4. Set Callback URL: `https://your-app.vercel.app/api/auth/callback/github`
5. Copy Client ID and Client Secret to Vercel

---

## Environment Variable Reference

### Core Variables (Always Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `AUTH_MODE` | Authentication mode | `disabled`, `single_user`, or `multi_user` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |

### Auth Variables (Mode-Specific)

#### For `AUTH_MODE=disabled`:
- `SINGLE_USER_EMAIL` (optional): Default user email

#### For `AUTH_MODE=single_user`:
- `NEXTAUTH_URL` (required): Your app URL
- `NEXTAUTH_SECRET` (required): Min 32 chars
- `ADMIN_USERNAME` (required): Admin username
- `ADMIN_PASSWORD_HASH` (required): Bcrypt hash

#### For `AUTH_MODE=multi_user`:
- `NEXTAUTH_URL` (required): Your app URL
- `NEXTAUTH_SECRET` (required): Min 32 chars
- `GITHUB_CLIENT_ID` (required): GitHub OAuth Client ID
- `GITHUB_CLIENT_SECRET` (required): GitHub OAuth Client Secret

### Optional Variables

```bash
# Kubernetes Runtime
RUNTIME_IMAGE=your-runtime-image

# AI/LLM Configuration
AIPROXY_ENDPOINT=https://your-aiproxy
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Logging
LOG_LEVEL=info
DEBUG_AUTH=false

# Build
SKIP_ENV_VALIDATION=1  # Skip validation during build
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] Choose auth mode (disabled/single_user/multi_user)
- [ ] Generate `NEXTAUTH_SECRET` (if not disabled mode)
- [ ] Generate `ADMIN_PASSWORD_HASH` (if single_user mode)
- [ ] Set up GitHub OAuth (if multi_user mode)
- [ ] Provision PostgreSQL database (Neon, Railway, Supabase)
- [ ] Set all required environment variables in Vercel

### Post-Deployment

- [ ] Visit `/api/health` - Should return 200 OK
- [ ] Visit `/api/health/config` - Check configuration status
- [ ] Test authentication flow
- [ ] Verify database connectivity (if using DB features)
- [ ] Check logs for any warnings/errors

---

## Rotating Secrets

### Rotate NEXTAUTH_SECRET

1. Generate new secret: `openssl rand -base64 32`
2. Update in Vercel: Settings → Environment Variables
3. Redeploy: `vercel deploy --prod`

**⚠️ WARNING**: This will invalidate all existing sessions. Users must re-authenticate.

### Rotate Admin Password

1. Generate new hash: `node scripts/hash-password.cjs "NewPassword"`
2. Update `ADMIN_PASSWORD_HASH` in Vercel
3. Redeploy

---

## Troubleshooting

### Build Fails with "AUTH_CONFIGURATION_ERROR"

**Solution**: Set `SKIP_ENV_VALIDATION=1` in Vercel environment variables for the build phase. Auth validation will still happen at runtime.

### "NEXTAUTH_URL must be https://fulling.vercel.app"

**Solution**: Ensure `NEXTAUTH_URL` matches your actual Vercel deployment URL exactly, including `https://` prefix.

### Database Connection Fails

**Solution**: 
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
- Ensure database is accessible from Vercel (check IP allowlist)
- For Neon: Enable "Allow all IP addresses"

### Auth Loop / Redirect Loop

**Solution**:
- Verify `NEXTAUTH_URL` matches your deployment URL exactly
- Check GitHub OAuth callback URL matches: `https://your-app.vercel.app/api/auth/callback/github`
- Ensure `NEXTAUTH_SECRET` is set and min 32 chars

### Login Page Shows When AUTH_MODE=disabled

**Solution**: Verify `AUTH_MODE=disabled` is set in Production environment variables, not just Preview.

---

## Health Check Endpoints

### `/api/health`
Returns basic health status

### `/api/health/config`
Returns configuration validation (safe, no secrets exposed)

**Example Response**:
```json
{
  "ok": true,
  "featureFlags": {
    "authDisabled": false,
    "singleUserMode": true,
    "passwordAuthEnabled": true,
    "githubAuthEnabled": false
  },
  "warnings": []
}
```

---

## Security Best Practices

1. **Never commit `.env` files** - They're git-ignored by default
2. **Use strong secrets** - Minimum 32 chars for `NEXTAUTH_SECRET`
3. **Rotate secrets regularly** - Every 90 days recommended
4. **Use disabled mode only for development** - Not for production with sensitive data
5. **Enable HTTPS** - Vercel handles this automatically
6. **Restrict database access** - Use connection pooling, set max connections
7. **Monitor logs** - Check Vercel logs for suspicious activity

---

## Support & Resources

- **GitHub Issues**: https://github.com/ICholding/fulling-private/issues
- **NextAuth Docs**: https://next-auth.js.org/
- **Vercel Docs**: https://vercel.com/docs
- **Prisma Docs**: https://www.prisma.io/docs
