### **Reshaped Product Requirements Document: AI Full-Stack Engineering Agent Platform**

### **1. Project Core and Vision**

- **Core Problem:** Even with modern technology stacks (like Next.js), building, deploying, and maintaining a fully functional full-stack web application from an idea remains a complex, time-consuming, and challenging process. Developers need to handle extensive boilerplate code, infrastructure configuration, deployment processes, and ongoing maintenance work.
- **Product Vision:** We are no longer just providing tools for developers—**we are the ultimate form of development tools—an AI-driven full-stack engineering Agent**. Our vision is to create an intelligent, automated SaaS platform that can understand users' natural language requirements and autonomously complete the entire process from project creation, coding, configuration, deployment to iteration.
- **Ultimate Value:** Fundamentally transform the development paradigm of web applications. Enable any user (whether professional developers or product managers) to transform an application concept into a production-ready full-stack application deployed in an **isolated sandbox environment** within minutes through dialogue with an AI Agent. We **solidify and optimize the best practice technology stack (Next.js, PostgreSQL, Shadcn/UI)**, completely freeing users from infrastructure complexity to focus on "what to create" rather than "how to create."

### **2. Target Users and Key Scenarios**

- **Target Users:**
    - **Core Users:** TypeScript/Next.js developers, independent developers (Indie Hackers), AI enthusiasts, and tech startups. They pursue extreme development efficiency and want to focus their energy on business logic and product innovation.
    - **Extended Users:** Product managers, designers, and founders with limited technical backgrounds. They can use this platform to quickly validate ideas, create functional prototypes (MVPs), or even formal products.
- **User Core Workflow and Core Functions:**
    - Core Workflow: Automated application creation from zero to one
        1. Users create a Project on the platform.
        2. The system calls the Kubernetes API to create a PostgreSQL database. For creation reference, see examples in the yaml/database directory and Readme.
        3. The system calls the Kubernetes (k8s) API (kubeconfig is placed in the .secret directory, example YAML for service deployment is in the yaml/sandbox directory) to create an isolated development environment sandbox for the application (including Next.js service and PostgreSQL database client). The sandbox Docker image has been built.
        4. Need to set up Claude Code environment variables for the deployment, obtained from .secret/.env. For database environment variables, call the Kubernetes API to get secrets and services—check specific names yourself.
        5. The system main interface automatically opens the sandbox's web terminal and automatically calls the Claude Code command.
        6. Users copy their requirements and have Claude Code implement the code.
        7. Commit all code to a GitHub repository. This requires users to authorize their GitHub account, either linking to an existing project or helping users create a GitHub repository. Two options: creating a repository requires repository creation permissions; authorizing an existing repository directly commits code to the repository.
        8. Complete deployment, displaying a publicly accessible URL in the interface.
    - Support user configuration features: Environment configuration
        Users need to configure API keys for third-party services (like Stripe). They can easily add these keys through the platform's environment variable management interface, and the Agent will ensure the runtime environment can securely access them. Users can configure environment variables and secrets, both stored as KV pairs in the sandbox's .env environment variables.
        For authentication configuration, provide explicit configuration interfaces such as Google authentication, GitHub authentication, etc., with parameters consistent with third-party services for user convenience.
        For payment configuration, provide explicit configuration interfaces, starting with Stripe payment configuration. This information is stored in environment variables and provided to the model as context for easy reference during coding.

## System Architecture

```
FullstackAgent pod --> User Runtime pod and a pgsql database
                    |
                    +-> UserRuntime pod and a pgsql database

```
The FullstackAgent pod creates a container for each Project by calling the Kubernetes interface. Each User Runtime pod exposes multiple ports, including the ttyd port and user business access ports.

The FullstackAgent pod page directly embeds the ttyd link via iframe and displays the User Runtime pod's business access URL on the interface.

FullstackAgent creates an independent database instance for each project when creating projects, implemented by calling the Kubernetes interface. Example YAML is in the yaml directory, and notes are in yaml/README.md.

## Implementation Method

This project's technology stack also uses Next.js, PostgreSQL, Shadcn/UI. The interface should be simple and beautiful, with a black, white, and gray color scheme, and friendly interactions.

This project uses remote development, with external domain and port being https://dgkwlntjskms.usw.sealos.io, so please listen on port 0.0.0.0:3000 during implementation.

The database for this project has already been created, see the DATABASE environment variable in .env.

The kubeconfig does not have create namespace permissions, so use the existing namespace in the kubeconfig directly.