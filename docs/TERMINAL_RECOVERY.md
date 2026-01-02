# Terminal Recovery Guide

When the interactive terminal is unavailable or restricted in Codespaces/github.dev, use this guide to restore it or work around it.

## PHASE 1 — Quick Fixes (Highest Probability)

### A) Reload + Reset UI
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type `Developer: Reload Window` → Press Enter
3. Wait for reload to complete
4. Press `Ctrl+Shift+P` → Type `Terminal: Create New Terminal` → Press Enter
5. If terminal still fails, try: `Terminal: Kill All Terminals` then create a new one

**Result if working:** A terminal prompt appears at the bottom of VS Code

---

### B) Browser/Network Blockers (Common on Mobile)
If the terminal opens but immediately disconnects or shows "Reconnecting...":

1. **Disable network blockers:**
   - Disable VPN / Private DNS / Adblock on your device
   - Disable Brave Shields (if using Brave browser)
   - Disable any Pi-hole or DNS filtering

2. **Switch networks:**
   - Try Wi-Fi instead of mobile data (or vice versa)
   - Or tether to a different phone's hotspot

3. **Try another browser:**
   - If using Samsung Internet → try Chrome
   - If using Firefox → try Safari or Chrome
   - Clear cookies/cache for github.com and github.dev

4. **Confirm settings:**
   - Ensure cookies are enabled for github.com
   - Ensure javascript is enabled
   - No "Restricted mode" warnings in VS Code

**Result if working:** Terminal connects and stays connected

---

### C) Codespace Restart / Rebuild (Most Common Real Fix)

#### Option C1: Stop + Start (Fastest)
1. Open https://github.com/FullAgent/fulling
2. Click **Code** → **Codespaces**
3. Find your active Codespace
4. Click **⋯** → **Stop**
5. Wait 10 seconds, then click **Start**
6. Wait for reconnect (2-3 minutes)

#### Option C2: Rebuild (Medium)
1. Same as C1, but instead: Click **⋯** → **Rebuild container**
2. Wait 5-10 minutes
3. Codespace will restart with a fresh environment

#### Option C3: Delete + Create New (Most Thorough)
1. Same location, click **⋯** → **Delete**
2. Wait for deletion
3. Click **Create Codespace on main**
4. Wait 5-10 minutes for new environment

**Result if working:** After restart/rebuild, a fresh terminal connection should work

---

### D) Organization Policies / Restricted Mode

1. **Check for warnings in VS Code:**
   - Look for a red banner at the top or a warning icon in the sidebar
   - If you see "Restricted Mode" or "Sandboxed" warnings, you may have account/org restrictions

2. **Check if your org has Codespace restrictions:**
   - Open https://github.com/orgs/YOUR-ORG/settings/codespaces
   - Look for "Codespace access" or "Terminal restrictions"
   - If restricted, contact your org admin

3. **Workaround if restricted:**
   - Use **Vercel preview deployments** for testing (no terminal needed)
   - Use **GitHub Actions** to run builds/tests/lint (watch in Actions tab)
   - Use **browser-based API endpoints** to verify application state

---

## TERMINALLESS WORKFLOW (When Terminal is Unavailable)

If the terminal remains broken after all steps above, this repo includes fallback systems:

### 1) **Verify CI Passes (No Terminal)**
- Push code to main
- Go to https://github.com/FullAgent/fulling/actions
- Watch the **CI** workflow run
- If it passes: ✅ Lint, build, and tests all passed
- If it fails: Click the failed step to see error details

### 2) **Verify Vercel Deploy Works (No Terminal)**
- After CI passes, Vercel automatically deploys
- Go to https://vercel.com/fulling/deployments
- Watch the latest deployment
- When done: Click "Visit" to see your live app
- Check Vercel logs for any runtime errors

### 3) **Diagnose App State (No Terminal)**
- Visit `/api/health` → Should return `{ ok: true }`
- Visit `/api/diag` → Shows provider flags and env var status
- These endpoints never expose secrets, only boolean flags

### 4) **Add npm Scripts Without Terminal**
Edit `package.json` and add/verify these scripts:
```json
{
  "scripts": {
    "build": "next build",
    "lint": "eslint . --max-warnings=0",
    "test": "jest",
    "typecheck": "tsc --noEmit",
    "dev": "next dev"
  }
}
```

Then:
- Commit the change
- Push to main
- GitHub Actions runs `npm run build` and `npm run lint` automatically
- Results visible in Actions tab (no terminal needed)

---

## Decision Tree

```
Terminal not working?
│
├─→ Does reload + new terminal fix it?
│   ├─ Yes: ✅ Done
│   └─ No: Continue
│
├─→ Is "Reconnecting..." loop or frequent disconnects?
│   ├─ Yes: Try different network/browser (Phase 1B)
│   └─ No: Continue
│
├─→ Can you stop/start the Codespace?
│   ├─ Yes: Try stop+start, then rebuild (Phase 1C)
│   └─ No: Check org restrictions (Phase 1D)
│
├─→ Still broken after rebuild?
│   ├─ Yes: Use Terminalless Workflow above
│   └─ No: ✅ Terminal should now work
│
└─→ Use Terminalless Workflow for all development
```

---

## Files Supporting Terminalless Mode

- **`.github/workflows/ci.yml`** — Runs lint/build/test on every push
- **`app/api/health/route.ts`** — Health check endpoint
- **`app/api/diag/route.ts`** — Diagnostics endpoint (no secrets)
- **`package.json`** — Scripts for lint/build/test/typecheck
- **`README.md`** — One-line confirmation checks

No terminal required for any of these.
