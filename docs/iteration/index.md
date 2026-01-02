# Iteration Documentation

This directory contains version-specific release notes, feature planning documents, and improvement roadmaps tracking the evolution of FullstackAgent.

## 📋 Files

### v0.0.2.md - UI/UX Optimization Requirements
**Purpose**: Defines major UI/UX improvements for version 0.0.2 focusing on layout, navigation, and user experience.

**Key Content**:
- **Project Main Page Optimization**:
  - Compact VSCode-like layout with left sidebar navigation
  - Two-level navigation: Project list (L1) → Settings/Config (L2)
  - Terminal-focused main area with multi-tab support
  - Network configuration panel for domain/port management
  - Operation buttons (Start/Stop/Restart/Delete)
- **Project List Optimization**: Visual status indicators (green/red/yellow dots)
- **Terminal Path Optimization**: Shortened naming from `root@aaa-agentruntime-w43o9o-6d57cbbd76-n4lqf:/workspace/test/project#` to `root@aaa-agent-w43o9o:project#`
- **Overall Style**: Cleaner, more professional appearance

**Status**: Planning/Design phase

**Audience**: UI/UX designers, frontend developers

---

### v0.0.3.md - Feature Enhancements
**Purpose**: Lists additional feature improvements planned for version 0.0.3.

**Key Content**:
- Feature additions and enhancements (minimal documentation)
- Follow-up improvements after v0.0.2

**Status**: Planning phase

**Audience**: Product managers, developers

---

### v0.1.0.md - Feature Roadmap and Todo List
**Purpose**: Comprehensive todo list for version 0.1.0 major release.

**Key Content**:
- **Network Configuration**: Support for creating new ports and CNAME configuration
- **Environment Variables**:
  - Default Claude Code environment variables
  - Display sensitive variables in secrets section
- **Auth Configuration**: Ensure settings are effective in sandbox environment
- **Payment Configuration**: Stripe and PayPal integration with proper parameter mapping
- **GitHub Integration**: Repository association functionality, binding to existing repos
- **Deployment Functionality**:
  - Prerequisite: GitHub association
  - Auto-generate GitHub Actions in sandbox
  - Deploy to Sealos using current kubeconfig

**Status**: Active development

**Audience**: All team members, project managers

---

### v0.1.0-issues.md - Known Issues and Planned Improvements
**Purpose**: Documents known issues, limitations, and improvements planned for v0.1.0.

**Key Content**:
- Bug reports and their status
- Technical debt items
- Performance improvements needed
- Feature gaps to be addressed

**Status**: Living document

**Audience**: Developers, QA team, product managers

---

## 🎯 Purpose of This Directory

The `iteration/` directory serves as the **version planning and tracking hub** for FullstackAgent. These documents:

1. **Track Evolution**: Record how the platform grows over time
2. **Plan Features**: Define what features go into which version
3. **Coordinate Work**: Help team members understand priorities
4. **Document Changes**: Provide historical context for decisions

## 📖 How to Use

### For Planning New Work
1. Check latest version file (currently `v0.1.0.md`) for planned features
2. Review issues file (`v0.1.0-issues.md`) for known problems
3. Add new features to appropriate version document

### For Understanding History
1. Read version files in order (v0.0.2 → v0.0.3 → v0.1.0)
2. See how requirements evolved
3. Understand why certain features were prioritized

### For Tracking Progress
1. Update issue status in `-issues.md` files
2. Move completed items from todo to done
3. Add new discovered issues

## 📊 Version Numbering

- **v0.0.x**: Early development, UI/UX improvements, core features
- **v0.1.x**: Major milestone with deployment, GitHub integration, enhanced configuration
- **v1.0.0**: (Future) Production-ready release

## 🔗 Related Documentation

- [`../prompt/PRD.md`](../prompt/PRD.md) - Original product vision
- [`../technical-notes/`](../technical-notes/) - Implementation details
- [`../fixes/`](../fixes/) - Bug fix documentation
- Root `/CLAUDE.md` - Current implementation state