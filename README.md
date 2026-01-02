# Fulling - AI-Powered Full-Stack Development Platform

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-15.5.4-black?style=for-the-badge&logo=next.js" alt="Next.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/PostgreSQL-14-blue?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Kubernetes-1.28-326ce5?style=for-the-badge&logo=kubernetes" alt="Kubernetes"/>
  <img src="https://img.shields.io/badge/Claude_Code-AI-purple?style=for-the-badge" alt="Claude Code"/>
</div>

## 🚀 Overview

Fulling provides a sandboxed environment with Claude Code and PostgreSQL — everything you need to vibe code full-stack apps.

Fulling automatically sets up the following for your project, ready in a minute:
- Next.js environment with shadcn/ui
- Dedicated PostgreSQL (pre-configured)
- Claude Code (pre-configured)
- A live domain

![fulling-frame](https://github.com/user-attachments/assets/5b535c93-8bf0-4014-8984-ef835d548dbc)

<img width="3022" height="1532" alt="project_details" src="https://github.com/user-attachments/assets/b100a833-fa3d-459e-83d9-3b590beb79a3" />


### ✨ Key Features

Fulling is designed to streamline the entire full-stack development lifecycle using an AI-centric approach. Its core capabilities are delivered through a highly orchestrated, self-contained development sandbox:

* **Pre-Configured AI Development Environment:**
    * A complete, immediately usable development environment is provisioned, featuring **Next.js**, **shadcn/ui**, and the **Claude Code CLI**.
    * Essential AI-related environment variables (e.g., `BASE_URL`, `KEY`, etc.) are automatically configured and injected, allowing the AI agent to begin coding instantly without manual setup.

* **Isolated PostgreSQL Database Provisioning:**
    * A dedicated and isolated **PostgreSQL** database instance is automatically created for each project using **KubeBlocks**.
    * The database connection string is securely injected into the development environment as an environment variable (`DATABASE_URL`), ensuring the AI can access and configure the persistence layer.

* **Automated Public Endpoint and Domain Mapping:**
    * Multiple accessible subdomains are automatically allocated and managed (**HTTPS ingress with SSL termination**).
    * These subdomains are configured to map to the specific application ports you wish to expose (e.g., ports 3000, 5000, 8080), providing immediate external access for testing and live development.

* **Natural Language Interaction via Web Terminal:**
    * All core development and configuration tasks are performed through a built-in **Web Terminal (ttyd)** using natural language instructions.
    * This provides a direct, low-friction interface for interacting with the AI engineer, receiving code, running commands, and monitoring the development process.

* **AI-Aware Business Configuration:**
    * Specific business configurations, such as **OAuth settings** (e.g., GitHub authentication) and **Payment configurations**, can be fed into the platform.
    * This configuration metadata is made accessible as contextual prompts, allowing the Claude Code agent to intelligently perceive and implement corresponding features (e.g., configuring NextAuth) directly into the generated code.

* **Seamless GitHub Repository Integration:**
    * The platform is designed for easy association with an external **GitHub repository**.
    * This facilitates standard code repository management, version control, and collaboration by connecting the AI's generated code to your preferred source control workflow.

* **Automated High-Availability Deployment:**
    * Projects can be automatically deployed from the development sandbox to a high-availability production environment, leveraging the underlying **Kubernetes** infrastructure.
    * This aims to abstract away the complexities of deployment, allowing the AI to manage the transition from development to live application.

## Star Fulling on GitHub can get the latest released information.

![star-demo](https://github.com/user-attachments/assets/bc497e0b-bd23-4ded-a231-1e382d56f92e)

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.5.4 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js
- **API**: Next.js API Routes
- **Database ORM**: Prisma
- **Authentication**: NextAuth v5 with GitHub OAuth

### Infrastructure
- **Container Orchestration**: Kubernetes
- **Database**: PostgreSQL (via KubeBlocks)
- **Web Terminal**: ttyd
- **Container Image**: fullstack-web-runtime (Custom Docker image with development tools)

## 📦 Installation

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database
- Kubernetes cluster with KubeBlocks installed
- GitHub OAuth application credentials

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/FullstackAgent/fulling.git
cd fulling
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Then update `.env.local` with your values:
```env
# Required - Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/fulling"

# Required - NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-min-32-chars-required"
AUTH_TRUST_HOST="true"

# Optional - GitHub OAuth (set ENABLE_GITHUB_AUTH=true to use)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Optional - Other configurations
SEALOS_JWT_SECRET=""
RUNTIME_IMAGE=""
AIPROXY_ENDPOINT=""
ANTHROPIC_BASE_URL=""
LOG_LEVEL="info"
ENABLE_PASSWORD_AUTH="true"
ENABLE_GITHUB_AUTH="false"
ENABLE_SEALOS_AUTH="false"
```

4. Initialize database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the application.

### Database Schema

prisma/schema.prisma
## ⚡ Terminal Recovery & Terminalless Workflow

**Terminal unavailable?** See [docs/TERMINAL_RECOVERY.md](docs/TERMINAL_RECOVERY.md) for:
- Quick fixes (reload, network, Codespace restart)
- Decision tree to diagnose the issue
- Terminalless development workflow

### Verify CI/Build Without Terminal

1. **Push to main** → Watch GitHub Actions:
   - Go to **Actions** tab
   - Watch the **CI** workflow run lint/build/typecheck
   - Passes = ✅ Build is valid

2. **Verify diagnostics** (no terminal needed):
   ```
   https://fulling-git-main-leadteamllcs-projects.vercel.app/api/health  
   https://fulling-git-main-leadteamllcs-projects.vercel.app/api/diag
   ```

3. **Check Vercel deploy**:
   - Go to https://vercel.com/fulling/deployments
   - Watch latest deployment logs
   - When done: Click "Visit" to test live app
## � Automatic Deployment to Vercel

This repository is configured for automated deployment to Vercel using GitHub Actions.

### Setup Required

1. **Link Vercel Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Create a new project or import this GitHub repository
   - Note your **Project ID** and **Vercel Token**

2. **Add GitHub Secret:**
   - Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
   - Click **New repository secret**
   - Add the secret `VERCEL_TOKEN` with your Vercel API token value
   - Optional: Add the secret `VERCEL_PROJECT_ID` (if needed by your setup)

3. **Set Environment Variables in Vercel:**
   - In Vercel Dashboard → Project Settings → **Environment Variables**
   - **For Production** environment, add EXACTLY these variables:

```
NEXTAUTH_URL=https://fulling.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
GITHUB_CLIENT_ID=<from GitHub OAuth app>
GITHUB_CLIENT_SECRET=<from GitHub OAuth app>
ENABLE_PASSWORD_AUTH=true
ENABLE_GITHUB_AUTH=true
NODE_ENV=production
```

### Production Authentication Setup

**⚠️ CRITICAL: Auth will fail without these exact values**

Fulling supports two authentication modes:
1. **Single-User Mode** (Recommended for production) - One admin user, no GitHub OAuth
2. **Multi-User Mode** (Development/testing) - GitHub OAuth with multi-user support

---

### 🔐 Single-User Mode (Recommended)

**Best for production deployments with a single administrator.**

#### Step 1: Generate Password Hash

```bash
node scripts/hash-password.cjs "YourSecurePassword"
```

This will output a bcrypt hash like:
```
$2b$10$Q5mtZnZ4KDEpDgCEmrAP.u.6j0z7BT8WkaydX5H6W7QXFUfYMfMBq
```

#### Step 2: Set Environment Variables in Vercel

In Vercel Dashboard → Project Settings → **Environment Variables**, add:

```env
# Required - Core Auth
NEXTAUTH_URL=https://fulling.vercel.app
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>

# Required - Single-User Mode
AUTH_MODE=single_user
ENABLE_PASSWORD_AUTH=true
ENABLE_GITHUB_AUTH=false
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD_HASH=<hash from step 1>

# Required - Database (for project management)
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>

# Optional
NODE_ENV=production
```

#### Step 3: Deploy and Verify

After setting env vars, redeploy and check:
```
https://fulling.vercel.app/api/health-auth
```

Should return:
```json
{
  "status": "healthy",
  "ok": true,
  "mode": "single_user",
  "hasAdminUsername": true,
  "hasAdminPasswordHash": true,
  "passwordAuthEnabled": true,
  "githubAuthEnabled": false
}
```

#### Rotating the Admin Password

1. Generate new hash: `node scripts/hash-password.cjs "NewPassword"`
2. Update `ADMIN_PASSWORD_HASH` in Vercel
3. Redeploy

---

### 🌐 Multi-User Mode (Development/Testing)

**Supports GitHub OAuth and multiple users. Requires database for user management.**

#### Step 1: Create GitHub OAuth Application
1. Go to https://github.com/settings/developers
2. Click **OAuth Apps** → **New OAuth App**
3. Fill in:
   - **Application name**: `Fulling`
   - **Homepage URL**: `https://fulling.vercel.app` (EXACT match required)
   - **Authorization callback URL**: `https://fulling.vercel.app/api/auth/callback/github`
4. Copy **Client ID** and create **Client Secret**
5. Add both to Vercel as `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

#### Step 2: Set Up PostgreSQL Database
Use one of:
- **Neon** (recommended): https://neon.tech
- **Railway**: https://railway.app
- **Supabase**: https://supabase.com
- **Any managed PostgreSQL**

Get a connection string like: `postgresql://user:password@host:port/database`

⚠️ **SQLite WILL NOT WORK** on Vercel (no persistent filesystem)

#### Step 3: Generate NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```
Copy output (e.g., `ZXjK9+qW8vL2mNxP4hRqA1bC3dEfGhIjKlMnOpQrStU=`) to Vercel

#### Step 4: Set Environment Variables in Vercel

```env
# Required - Core Auth
NEXTAUTH_URL=https://fulling.vercel.app
NEXTAUTH_SECRET=<from step 3>

# Required - Multi-User Mode
AUTH_MODE=multi_user
ENABLE_PASSWORD_AUTH=true
ENABLE_GITHUB_AUTH=true
GITHUB_CLIENT_ID=<from step 1>
GITHUB_CLIENT_SECRET=<from step 1>

# Required - Database
DATABASE_URL=<from step 2>

# Optional
NODE_ENV=production
```

#### Step 5: Verify Configuration
After setting all env vars and redeploying, check:
```
https://fulling.vercel.app/api/health-auth
```

Should return:
```json
{
  "status": "healthy",
  "ok": true,
  "hasDatabase": true,
  "hasGitHub": true,
  "hasSecret": true,
  "issues": []
}
```

If not healthy, fix issues and redeploy.

#### Troubleshooting AUTH_CONFIG_ERROR

If you see "AUTH_CONFIG_ERROR" at login:

1. **Check /api/health-auth** for missing variables
2. **Verify env vars are set in Vercel** (not in `.env.local`)
3. **Redeploy after adding vars** (GitHub Actions → Vercel)
4. **Check Vercel logs**:
   - Vercel Dashboard → Project → Logs → Function Logs
   - Look for `AUTH_CONFIG` errors
5. **Ensure DATABASE_URL is PostgreSQL** (starts with `postgresql://`)
6. **Verify NEXTAUTH_URL is exactly** `https://fulling.vercel.app` (no trailing slash, no http)

### Environment Variables Reference

| Variable | Required | Type | Example / Notes |
|----------|----------|------|-----------------|
| `NEXTAUTH_URL` | ✅ | String | `https://fulling.vercel.app` (production) |
| `NEXTAUTH_SECRET` | ✅ | String | Generate: `openssl rand -base64 32` (min 32 chars) |
| `DATABASE_URL` | ✅ | PostgreSQL URL | `postgresql://user:pass@neon.tech:5432/fulling` |
| `GITHUB_CLIENT_ID` | ✅ | String | From GitHub OAuth app settings |
| `GITHUB_CLIENT_SECRET` | ✅ | String | From GitHub OAuth app settings (keep secret!) |
| `ENABLE_PASSWORD_AUTH` | Optional | Boolean | `true` or `false` (default: `true`) |
| `ENABLE_GITHUB_AUTH` | Optional | Boolean | `true` or `false` (default: `false` - set to `true` in Vercel) |
| `NODE_ENV` | Optional | String | `production` (Vercel) or `development` (local) |
| `DEBUG_AUTH` | Optional | Boolean | `true` to enable auth debug logs in production |
| `SEALOS_JWT_SECRET` | Optional | String | Only if using Sealos authentication |
| `ANTHROPIC_API_KEY` | Optional | String | For Claude API integration |
| `AIPROXY_ENDPOINT` | Optional | URL | For Aiproxy service integration |

**⚠️ PRODUCTION CHECKLIST:**
- [ ] All 5 "Required" variables above are set in Vercel
- [ ] `NEXTAUTH_URL` is exactly `https://fulling.vercel.app` (no http://, no trailing /)
- [ ] `DATABASE_URL` starts with `postgresql://` (not SQLite)
- [ ] GitHub OAuth app callback URL matches `NEXTAUTH_URL/api/auth/callback/github` exactly
- [ ] `/api/health-auth` returns `"ok": true`
- [ ] Login page works and GitHub button initiates OAuth

### How Auto-Deploy Works

- **Trigger:** Every push to the `main` branch automatically starts the deployment pipeline
- **Workflow:** `.github/workflows/vercel-deploy.yml` handles:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies with `npm ci` (or `npm install` if no lock file)
  4. Run `npm run build` to verify the build works
  5. Pull environment variables from Vercel
  6. Build the application with Vercel
  7. Deploy to production

- **View Deployment:**
  - Go to **Actions** tab in your GitHub repository
  - Click the latest workflow run for your push
  - Scroll to the deployment steps to see the **Vercel deployment URL**
  - You can also view deployments in [Vercel Dashboard](https://vercel.com/dashboard)

### GitHub Secrets Required

- **`VERCEL_TOKEN`** (required) - Your Vercel API authentication token
- All environment variables needed by the app should be set in Vercel dashboard, not as GitHub secrets

### Troubleshooting Deployments

- Check **Actions** tab for workflow logs
- Ensure `VERCEL_TOKEN` is correctly set in GitHub Secrets
- Verify all required environment variables are set in Vercel Project Settings
- The workflow uses `SKIP_ENV_VALIDATION=1` during build to allow missing optional vars

## 🔧 Development

### Project Structure

```
fullstack-agent/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── projects/          # Project management pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Shadcn/UI components
│   └── ...               # Feature components
├── lib/                   # Core libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Prisma client
│   ├── kubernetes.ts     # Kubernetes service
│   └── github.ts         # GitHub integration
├── prisma/               # Database schema
├── yaml/                 # Kubernetes templates
└── public/               # Static assets
```

### Key Services

#### KubernetesService (`lib/kubernetes.ts`)
- Manages all Kubernetes operations
- Creates databases and sandboxes
- Handles pod lifecycle management

#### Authentication (`lib/auth.ts`)
- GitHub OAuth integration
- Session management
- User authorization

#### Database (`lib/db.ts`)
- Prisma ORM configuration
- Connection pooling

## 📚 API Documentation

### Sandbox Management

#### Create Sandbox
```http
POST /api/sandbox/[projectId]
Content-Type: application/json

{
  "envVars": {
    "KEY": "value"
  }
}
```

#### Get Sandbox Status
```http
GET /api/sandbox/[projectId]
```

#### Delete Sandbox
```http
DELETE /api/sandbox/[projectId]
```

### Project Management

#### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "project-name",
  "description": "Project description"
}
```

## 🔒 Security

- **Authentication**: GitHub OAuth ensures only authorized users can access the platform
- **Isolation**: Each sandbox runs in its own Kubernetes namespace
- **Secrets Management**: Sensitive data stored in Kubernetes secrets
- **Network Policies**: Sandboxes isolated from each other
- **Resource Limits**: Prevents resource exhaustion attacks

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude Code
- [Sealos](https://sealos.io/) for Kubernetes platform
- [ttyd](https://github.com/tsl0922/ttyd) for web terminal

## 📞 Contact

- GitHub: [@fanux](https://github.com/fanux)
- Issues: [GitHub Issues](https://github.com/FullstackAgent/FullstackAgent/issues)

---

<div align="center">
100% AI-generated code. Prompted by fanux. Thanks for Claude code & Opus & Sonnet 4.5 & GLM & Kimi K2 Thinking
</div>
