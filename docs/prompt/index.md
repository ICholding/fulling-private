# Prompt Documentation

This directory contains product requirements and design specifications that define the vision and features of FullstackAgent.

## 📋 Files

### PRD.md - Product Requirements Document
**Purpose**: Defines the core vision, user workflows, and technical requirements for FullstackAgent.

**Key Content**:
- **Product Vision**: AI-driven full-stack engineering agent platform that transforms ideas into deployed applications through natural language
- **Target Users**: TypeScript/Next.js developers, indie hackers, AI enthusiasts, and non-technical users
- **Core Workflow**:
  1. User creates project
  2. System creates PostgreSQL database
  3. System deploys isolated sandbox environment
  4. System opens web terminal with Claude Code CLI
  5. User builds application with AI assistance
  6. Commit to GitHub and deploy
- **System Architecture**: Control plane (Next.js app) orchestrating Kubernetes sandboxes
- **Technology Stack**: Next.js, PostgreSQL, Shadcn/UI, Claude Code CLI
- **Implementation Notes**: Deployment on Sealos, kubeconfig in `.secret/` directory

**Audience**: Product managers, stakeholders, and developers starting new features

---

### auth.md - Authentication Configuration Specifications
**Purpose**: Defines how authentication providers should be configured and displayed in the platform.

**Key Content**:
- **GitHub Authentication**: Client ID, Client Secret, Homepage URL, Authorization callback URL
- **Google Authentication**: Same fields as GitHub
- **NextAuth Settings**: Auto-fill project domain, auto-generate NextAuth secret
- **UI Guidelines**: Display in main area (not sidebar), show corresponding environment variable names
- **Implementation**: Store as environment variables for sandbox injection

**Audience**: Developers implementing authentication features, UI designers

---

## 🎯 Purpose of This Directory

The `prompt/` directory serves as the **product specification source** for FullstackAgent. These documents:

1. **Define the "What"**: What features the platform should have
2. **Guide Development**: Provide clear requirements for implementation
3. **Maintain Vision**: Ensure consistency with the original product goals
4. **Reference for AI**: Used as context for AI-assisted development

## 📖 How to Use

- **Before implementing features**: Read relevant specifications to understand requirements
- **During development**: Reference for configuration formats and expected behavior
- **When unclear**: These documents define the intended functionality

## 🔗 Related Documentation

- [`../technical-notes/`](../technical-notes/) - Technical implementation details
- [`../iteration/`](../iteration/) - Version-specific feature planning
- `/.github/CLAUDE.md` - Code-level implementation guide