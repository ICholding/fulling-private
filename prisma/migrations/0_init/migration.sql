-- CreateEnum for AuthProvider
CREATE TYPE "AuthProvider" AS ENUM ('PASSWORD', 'GITHUB', 'GOOGLE', 'SEALOS');

-- CreateEnum for ProjectStatus
CREATE TYPE "ProjectStatus" AS ENUM ('RUNNING', 'STOPPED', 'TERMINATED', 'CREATING', 'UPDATING', 'STARTING', 'STOPPING', 'TERMINATING', 'ERROR', 'PARTIAL');

-- CreateEnum for ResourceStatus
CREATE TYPE "ResourceStatus" AS ENUM ('CREATING', 'STARTING', 'RUNNING', 'STOPPING', 'STOPPED', 'TERMINATING', 'TERMINATED', 'ERROR', 'UPDATING');

-- CreateTable User
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable UserIdentity
CREATE TABLE "UserIdentity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserIdentity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex unique_provider_user
CREATE UNIQUE INDEX "unique_provider_user" ON "UserIdentity"("provider", "providerUserId");

-- CreateIndex idx_user_provider
CREATE INDEX "idx_user_provider" ON "UserIdentity"("userId", "provider");

-- CreateTable UserConfig
CREATE TABLE "UserConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "UserConfig_userId_key_key" ON "UserConfig"("userId", "key");

-- CreateIndex
CREATE INDEX "UserConfig_userId_category_idx" ON "UserConfig"("userId", "category");

-- CreateTable Project
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "githubRepo" TEXT,
    "status" "ProjectStatus" NOT NULL DEFAULT 'CREATING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateTable Environment
CREATE TABLE "Environment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT,
    "isSecret" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Environment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Environment_projectId_key_key" ON "Environment"("projectId", "key");

-- CreateIndex
CREATE INDEX "Environment_projectId_idx" ON "Environment"("projectId");

-- CreateTable Database
CREATE TABLE "Database" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "k8sNamespace" TEXT NOT NULL,
    "databaseName" TEXT NOT NULL,
    "host" TEXT,
    "port" INTEGER DEFAULT 5432,
    "database" TEXT DEFAULT 'postgres',
    "username" TEXT,
    "password" TEXT,
    "connectionUrl" TEXT,
    "status" "ResourceStatus" NOT NULL DEFAULT 'CREATING',
    "lockedUntil" TIMESTAMP(3),
    "storageSize" TEXT DEFAULT '3Gi',
    "cpuRequest" TEXT DEFAULT '100m',
    "cpuLimit" TEXT DEFAULT '1000m',
    "memoryRequest" TEXT DEFAULT '102Mi',
    "memoryLimit" TEXT DEFAULT '1024Mi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Database_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Database_projectId_name_key" ON "Database"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Database_k8sNamespace_databaseName_key" ON "Database"("k8sNamespace", "databaseName");

-- CreateIndex
CREATE INDEX "Database_projectId_idx" ON "Database"("projectId");

-- CreateIndex
CREATE INDEX "Database_databaseName_idx" ON "Database"("databaseName");

-- CreateTable Sandbox
CREATE TABLE "Sandbox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "k8sNamespace" TEXT NOT NULL,
    "sandboxName" TEXT NOT NULL,
    "publicUrl" TEXT,
    "ttydUrl" TEXT,
    "fileBrowserUrl" TEXT,
    "status" "ResourceStatus" NOT NULL DEFAULT 'CREATING',
    "lockedUntil" TIMESTAMP(3),
    "runtimeImage" TEXT,
    "cpuRequest" TEXT DEFAULT '100m',
    "cpuLimit" TEXT DEFAULT '2000m',
    "memoryRequest" TEXT DEFAULT '200Mi',
    "memoryLimit" TEXT DEFAULT '4096Mi',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Sandbox_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Sandbox_projectId_name_key" ON "Sandbox"("projectId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Sandbox_k8sNamespace_sandboxName_key" ON "Sandbox"("k8sNamespace", "sandboxName");

-- CreateIndex
CREATE INDEX "Sandbox_projectId_idx" ON "Sandbox"("projectId");

-- CreateIndex
CREATE INDEX "Sandbox_sandboxName_idx" ON "Sandbox"("sandboxName");
