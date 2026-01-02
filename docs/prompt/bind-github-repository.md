# Use Case: Bind GitHub Repository to Project

## Overview

This use case describes the process of connecting an existing GitHub repository to a FullStack Agent project, enabling version control, automated commits, and GitHub integration features.

## Actors

- **Primary Actor**: Authenticated user with GitHub OAuth connection
- **System**: FullStack Agent platform
- **External Service**: GitHub API

## Preconditions

1. **User Authentication**:
   - User is logged into FullStack Agent
   - User has authenticated via GitHub OAuth
   - User's GitHub token is stored in database (`User.githubToken`)
   - Token has `repo read:org` scope access (updated in v0.2.2)

2. **Project Existence**:
   - User has at least one project created
   - Project is in any status (PENDING, READY, DEPLOYED, etc.)
   - Project is not currently connected to a repository (optional - can rebind)

3. **GitHub Repositories**:
   - User owns at least one repository on GitHub
   - Repositories are accessible via authenticated API calls

## Start Point

User navigates to the GitHub Repository page for a specific project:
- **URL Pattern**: `/projects/[projectId]/github`
- **Navigation**: From project page → Configuration → "GitHub Repository"

## Main Flow

### Step 1: Page Load & Initial Fetch

**Server-Side (Page Component)**:
1. System verifies user authentication
2. System retrieves project from database
   ```sql
   SELECT * FROM Project WHERE id = {projectId} AND userId = {userId}
   ```
3. System renders page with `currentRepo={project.githubRepo}`

**Client-Side (Component Mount)**:
4. Component initializes with `currentRepo` prop
5. Component enters loading state
6. Component calls `GET /api/github/repositories`

### Step 2: Repository List Retrieval

**API Processing**:
7. System verifies user session
8. System retrieves user's GitHub token from database
   ```sql
   SELECT githubToken FROM User WHERE id = {userId}
   ```
9. System initializes GitHub client with token
10. System fetches data from GitHub API in parallel:
    ```javascript
    Promise.all([
      GET https://api.github.com/user,
      GET https://api.github.com/user/orgs,
      GET https://api.github.com/user/repos?affiliation=owner,organization_member
    ])
    ```
    **Note**: Requires `read:org` scope for `/user/orgs` endpoint (v0.2.2+)
11. System builds accounts array (personal + organizations)
12. System formats and returns accounts + repositories
    ```json
    {
      "accounts": [
        { "login": "Che-Zhu", "type": "User", "avatarUrl": "...", "name": "..." },
        { "login": "anthropic", "type": "Organization", "avatarUrl": "...", "name": "..." }
      ],
      "repositories": [
        {
          "name": "repo-name",
          "fullName": "username/repo-name",
          "private": false,
          "description": "...",
          "owner": { "login": "username", "type": "User" }
        },
        {
          "name": "claude-app",
          "fullName": "anthropic/claude-app",
          "private": true,
          "description": "...",
          "owner": { "login": "anthropic", "type": "Organization" }
        }
      ],
      "count": 48
    }
    ```

**Client-Side (Response)**:
13. Component receives accounts and repository list
14. Component exits loading state
15. Component auto-selects personal account (first in accounts array)
16. Component renders account selector dropdown
17. Component filters repositories by selected account
18. Component renders repository dropdown with filtered repositories

### Step 3: Account Selection (Optional - v0.2.1)

**User Action**:
19. User reviews account dropdown (pre-selected to personal account)
20. **[Optional]** User clicks account dropdown to switch to organization
21. **[Optional]** User selects organization (e.g., "anthropic")

**Client-Side (Account Switch)**:
22. **[Optional]** Component updates `selectedAccount` state
23. **[Optional]** Component re-filters repositories to show only org repos
24. Repository dropdown updates to show filtered repositories

### Step 4: Repository Selection

**User Action**:
25. User clicks repository dropdown trigger
26. Dropdown opens, displaying repositories for selected account
27. User scrolls/searches through list
28. User clicks on desired repository (e.g., "Che-Zhu/FullstackAgent" or "anthropic/claude-app")

**Client-Side (Selection)**:
29. Component captures `onValueChange` event
30. Component enters connecting state
31. Component disables dropdown
32. Component shows "Connecting repository..." loading indicator
33. Component calls `POST /api/projects/{projectId}/github`
    ```json
    {
      "repoName": "Che-Zhu/FullstackAgent"
      // or "anthropic/claude-app" for organization repo
    }
    ```

### Step 5: Repository Connection

**API Processing**:
34. System verifies user session
35. System validates project ownership
    ```sql
    SELECT * FROM Project WHERE id = {projectId} AND userId = {userId}
    ```
36. System validates repository name format (`username/repository` or `organization/repository`)
37. System updates project record
    ```sql
    UPDATE Project
    SET githubRepo = 'Che-Zhu/FullstackAgent', updatedAt = NOW()
    -- or 'anthropic/claude-app' for organization repository
    WHERE id = {projectId}
    ```
38. System returns success response
    ```json
    {
      "success": true,
      "githubRepo": "Che-Zhu/FullstackAgent"
      // or "anthropic/claude-app"
    }
    ```

**Client-Side (Success)**:
39. Component receives success response
40. Component updates local state `setSelectedRepo(data.githubRepo)`
41. Component exits connecting state
42. Component displays success toast notification
43. Component renders "Connected" state:
    - Green checkmark icon
    - Repository link to GitHub (personal or organization repo)
    - Disconnect button

## Expected Outcome

### UI State
- **Before**: "Not connected" message with dropdown selector
- **After**: "Connected to GitHub" with repository link and disconnect button

### Database State
```sql
-- Before
Project.githubRepo = NULL

-- After
Project.githubRepo = 'Che-Zhu/FullstackAgent'
```

### User Feedback
- Success toast: "Repository connected successfully!"
- Visual confirmation: Green checkmark + repository name displayed

### Enabled Features
Once connected, the following features become available:
- Automatic git commits from AI agent
- Pull request creation
- Repository viewing on GitHub
- Version control integration

## Alternative Flows

### Alt Flow 1: Repository Disconnection

**Trigger**: User clicks "Disconnect" button on connected repository

**Flow**:
1. Component enters disconnecting state
2. Component calls `DELETE /api/projects/{projectId}/github`
3. System updates database: `SET githubRepo = NULL`
4. Component resets to "Not connected" state
5. Dropdown becomes available again

**Outcome**: Repository unbound from project

### Alt Flow 2: Rebind Different Repository

**Trigger**: User connects a repository when one is already connected

**Flow**:
1. User clicks "Disconnect"
2. Follow Alt Flow 1 (disconnection)
3. User selects new repository from dropdown
4. Follow Main Flow steps 19-43

**Outcome**: Old repository replaced with new one

---

### Alt Flow 3: Switch Account and Select Repository (v0.2.1)

**Trigger**: User wants to bind a repository from an organization instead of personal account

**Flow**:
1. Component loads with personal account pre-selected
2. User clicks account dropdown
3. User selects organization (e.g., "anthropic")
4. Component filters repositories to show only organization repos
5. Repository dropdown updates with filtered list
6. User selects organization repository
7. Follow Main Flow steps 29-43

**Outcome**: Organization repository bound to project

---

### Alt Flow 4: Organization with No Repositories (v0.2.1)

**Trigger**: User selects an organization that has no accessible repositories

**Flow**:
1. User clicks account dropdown
2. User selects organization with no repos
3. Component filters repositories → empty array
4. Repository dropdown shows "No repositories found in [org-name]"
5. Repository dropdown is disabled (no repos to select)

**Outcome**: User must either:
- Switch back to personal account
- Create repositories in the organization
- Request access to organization repositories

---

### Alt Flow 5: User with No Organizations (v0.2.1)

**Trigger**: User has no organization memberships

**Flow**:
1. API returns accounts array with single item (personal account only)
2. Account dropdown shows only personal account ("Che-Zhu")
3. Account dropdown displays "1 account available"
4. Repository dropdown shows all personal repositories
5. **UI appears identical to v0.2.0** (backward compatible)

**Outcome**: Feature works exactly as v0.2.0, no visible change for users without organizations

## Unexpected Outcomes

### 1. No GitHub Token Found

**Cause**: User's GitHub token missing or deleted from database

**Symptoms**:
- Component shows error state
- Error message: "GitHub account not connected. Please reconnect your GitHub account."
- HTTP Status: 400 Bad Request

**UI Behavior**:
- Red alert icon displayed
- Error message in red text
- No dropdown shown

**Resolution**:
- User must re-authenticate with GitHub OAuth
- Navigate to Settings → Re-connect GitHub

---

### 2. No Repositories Available

**Cause**: User has no repositories on GitHub, or all repos are organization-owned

**Symptoms**:
- Component shows empty state
- Message: "No repositories found"
- Subtext: "Create a repository on GitHub to get started"
- HTTP Status: 200 OK (but empty array)

**UI Behavior**:
- Gray alert icon
- Informational message
- No dropdown shown

**Resolution**:
- User creates a repository on GitHub
- User refreshes the page or re-navigates

---

### 3. Network Failure / Server Down

**Cause**: Network connectivity issues or dev server stopped

**Symptoms**:
- Console error: `Failed to load resource: net::ERR_CONNECTION_REFUSED`
- Toast notification: "Failed to connect repository"
- Component state: connecting → not connected (reverted)

**UI Behavior**:
- Error toast shown (red)
- Component returns to initial state
- Dropdown re-enabled for retry

**Resolution**:
- Check network connection
- Verify dev server is running
- Retry operation

---

### 4. Invalid or Expired GitHub Token

**Cause**: GitHub token revoked or expired

**Symptoms**:
- Error message: "GitHub token is invalid or expired. Please reconnect your GitHub account."
- HTTP Status: 401 Unauthorized

**UI Behavior**:
- Error state displayed
- No dropdown shown
- Clear error message to user

**Resolution**:
- User must re-authenticate with GitHub
- Token will be refreshed during OAuth flow

---

### 5. GitHub API Rate Limit Exceeded

**Cause**: Too many API requests to GitHub (5000/hour limit)

**Symptoms**:
- Error message: "GitHub API rate limit exceeded. Please try again later."
- HTTP Status: 429 Too Many Requests

**UI Behavior**:
- Error toast displayed
- Dropdown not loaded
- Rate limit message shown

**Resolution**:
- Wait for rate limit window to reset (1 hour)
- For production: implement caching strategy
- For development: use multiple test accounts

---

### 6. Repository Name Validation Failure

**Cause**: Malformed repository name (missing slash or invalid format)

**Symptoms**:
- Error: "Invalid repository format. Use: username/repository"
- HTTP Status: 400 Bad Request

**UI Behavior**:
- Error toast shown
- Connection fails
- State reverts to not connected

**Resolution**:
- **Note**: This should never happen with dropdown selector (only if API is called directly)
- Format is guaranteed by dropdown values

---

### 7. Project Not Found or Unauthorized

**Cause**: Project ID doesn't exist or doesn't belong to user

**Symptoms**:
- Error: "Project not found"
- HTTP Status: 404 Not Found

**UI Behavior**:
- Error state
- No data loaded

**Resolution**:
- Verify correct project URL
- Ensure user has access to project
- Check if project was deleted

---

### 8. Database Connection Failure

**Cause**: PostgreSQL database unreachable

**Symptoms**:
- Error: "Failed to connect GitHub repository"
- HTTP Status: 500 Internal Server Error
- Server logs: Prisma connection errors

**UI Behavior**:
- Generic error message
- Error toast shown

**Resolution**:
- Check database connection string
- Verify database is running
- Check DATABASE_URL environment variable

---

### 9. Missing OAuth Scope for Organizations (RESOLVED in v0.2.2)

**Cause**: GitHub OAuth token missing `read:org` scope

**Symptoms**:
- User has organizations on GitHub (visible on Vercel, GitHub.com)
- Organizations dropdown shows only personal account ("1 account available")
- Organization repositories appear in repository list but owner shows as personal account
- No organization accounts available for selection
- HTTP Status: 200 OK (but organizations array is empty)

**Root Cause Analysis**:
- Original OAuth scope: `'read:user user:email repo'`
- GitHub API `/user/orgs` endpoint requires `read:org` scope
- Without proper scope, API returns empty array: `[]`
- This creates confusing UX where org repos are visible but org accounts aren't

**UI Behavior**:
- Account selector shows only personal account
- Repository filtering doesn't work for organizations
- User sees organization repos but can't filter by organization
- No error message (API succeeds but with incomplete data)

**Resolution** (v0.2.2):
- **Technical Fix**: Updated OAuth scope to `'read:user user:email repo read:org'`
- **User Action**: Sign out and sign back in to get new OAuth token
- **Verification**: Organizations appear in account dropdown after re-authentication
- **Backward Compatible**: Users without organizations see no change

**Prevention**:
- Include all required scopes in initial OAuth configuration
- Test with users who have organization memberships
- Monitor OAuth scope usage and API responses

## Success Metrics

- **Primary**: Repository successfully bound (database updated)
- **Secondary**: User sees confirmation UI (toast + connected state)
- **Tertiary**: Subsequent features work (commits, PRs)

## Frequency

- **Expected**: Once per project (initial setup)
- **Actual**: Low frequency after initial project creation
- **Re-binding**: Occasional (when switching repositories)

## Related Components

### Frontend
- `app/projects/[id]/github/page.tsx` (Server Component)
- `components/github-repository-selector.tsx` (Client Component)
- `components/ui/select.tsx` (Shadcn Select)

### Backend
- `app/api/github/repositories/route.ts` (GET)
- `app/api/projects/[id]/github/route.ts` (POST, DELETE)
- `lib/github.ts` (GitHub service)
- `lib/auth.ts` (Authentication)

### Database
- `Project` model (`githubRepo` field)
- `User` model (`githubToken` field)

### External
- GitHub REST API v3
  - `/user` - Get authenticated user
  - `/user/orgs` - List user organizations (v0.2.1)
  - `/user/repos` - List accessible repositories
- `@octokit/rest` package

## Security Considerations

1. **Token Storage**: GitHub tokens encrypted in database
2. **Authorization**: Each API call verifies project ownership
3. **Scope Requirement**: Uses `read:user user:email repo read:org` scopes for full access (updated in v0.2.2)
4. **Organization Access**: Respects organization OAuth app approval settings
5. **Input Validation**: Repository name format validated server-side (username/repo or org/repo)
6. **Rate Limiting**: GitHub API rate limits respected (3 parallel calls per page load)
7. **Private Repos**: Only shows repositories user has access to (respects permissions)

## Future Enhancements

1. **Server Component Revalidation**: Add `router.refresh()` after connection
2. **Repository Search**: Filter dropdown for users with 50+ repos/organizations
3. **Organization Avatars**: Display organization logos in account dropdown
4. **Repository Creation**: Add flow to create new repository in selected account
5. **Branch Selection**: Choose default branch for integration
6. **Metadata Display**: Show repo visibility, description, stars in dropdown
7. **Webhook Integration**: Auto-deploy on push events
8. **Multi-Repository Support**: Connect multiple repos per project
9. **Organization Favorites**: Pin frequently used organizations to top
