# Technical Notes

This directory contains comprehensive technical documentation explaining the architecture, implementation, and workflows of FullstackAgent.

## 📋 Files

### TECHNICAL_DOCUMENTATION.md
**Purpose**: Complete technical implementation guide covering all aspects of the platform architecture.

**Key Content**:
- **System Architecture**: Control plane and data plane separation
- **Core Components**:
  - KubernetesService (`lib/kubernetes.ts`) - Cluster orchestration
  - Database Management - KubeBlocks PostgreSQL integration
  - Sandbox Management - Runtime container deployment
  - Authentication System - NextAuth v5 with GitHub OAuth
- **Kubernetes Integration**: Namespace management, resource naming, label strategy, ingress configuration
- **API Design**: RESTful endpoints with comprehensive error handling
- **Security Implementation**: Authentication, Kubernetes security, secret management
- **Performance Optimizations**: Resource allocation, connection pooling, caching
- **Troubleshooting Guide**: Common issues, debugging commands, log locations

**Last Updated**: 2025-10-11

**Audience**: Backend developers, DevOps engineers, system architects

---

### RUNTIME_WORKFLOW.md
**Purpose**: Complete end-to-end workflow documentation from project creation to deployment with detailed diagrams and examples.

**Key Content**:
- **Overview**: Platform concept and core features
- **Runtime Image Details**:
  - Image: `fullstackagent/fullstack-web-runtime:v0.0.1-alpha.9`
  - Contents: Ubuntu 24.04, Node.js 22.x, Claude Code CLI, ttyd, development tools
  - Auto-start behavior via `.bashrc`
- **Complete Workflow**:
  - Step-by-step process with ASCII diagrams
  - User interaction flows
  - Kubernetes resource creation
  - Container startup and terminal connection
- **Technology Stack Layers**: 5-layer architecture breakdown
- **Development Flow Example**: Practical scenario of building a blog application
- **Key Components**: Main app, runtime container, Kubernetes configuration
- **Conceptual Comparison**: Traditional vs FullstackAgent development

**Last Updated**: 2025-10-26

**Audience**: All developers, new team members, technical documentation readers

---

### runtime.md
**Purpose**: Detailed documentation for the sandbox runtime Docker image, including usage, configuration, and troubleshooting.

**Key Content**:
- **Image Information**: `fullstackagent/fullstack-web-runtime:latest`
- **Features**: Complete list of pre-installed tools
- **Quick Start**: Using pre-built image and building from source
- **Build Methods**:
  - GitHub Actions (recommended for restricted environments)
  - Build script with local/remote options
  - Manual Docker build
  - Manual Buildah build (rootless)
- **Environment Variables**: Core configuration, ttyd web terminal settings
- **Usage Examples**: Creating Next.js apps, running dev server, using Claude Code CLI
- **Exposed Ports**: 3000, 3001, 5000, 5173, 8080, 8000, 5432, 7681
- **Installed Tools**: Complete inventory of development tools
- **Security Notes**: Running as root, privileged mode, secrets management
- **Troubleshooting**: Permission errors, port conflicts, storage issues

**Audience**: Runtime image maintainers, sandbox environment developers

---

## 🎯 Purpose of This Directory

The `technical-notes/` directory serves as the **technical knowledge base** for FullstackAgent. These documents:

1. **Explain the "How"**: How the system works internally
2. **Guide Implementation**: Detailed technical specifications for developers
3. **Document Architecture**: System design decisions and patterns
4. **Enable Debugging**: Troubleshooting guides and debugging procedures

## 📖 How to Use

### For New Developers
1. Start with `RUNTIME_WORKFLOW.md` - Understand the complete flow
2. Read `TECHNICAL_DOCUMENTATION.md` - Deep dive into architecture
3. Reference `runtime.md` - Work with the runtime environment

### For Debugging
1. Check `TECHNICAL_DOCUMENTATION.md` troubleshooting section
2. Review component-specific sections for detailed implementation
3. Refer to `runtime.md` for container-level issues

### For Architecture Decisions
1. Consult `TECHNICAL_DOCUMENTATION.md` for established patterns
2. Review `RUNTIME_WORKFLOW.md` for workflow implications
3. Consider runtime constraints from `runtime.md`

## 🔗 Related Documentation

- [`../prompt/`](../prompt/) - Product requirements and specifications
- [`../fixes/`](../fixes/) - Detailed bug fix documentation
- [`../troubleshooting/`](../troubleshooting/) - User-facing issue guides
- `/.github/CLAUDE.md` - Quick reference for Claude Code
- `/lib/kubernetes.ts` - Actual implementation code