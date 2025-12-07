-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('PENDING', 'VERIFIED', 'ACTIVE', 'ERROR', 'PAUSED');

-- CreateEnum
CREATE TYPE "HealthCheckType" AS ENUM ('HTTP', 'HTTPS', 'TCP', 'DNS', 'SSL');

-- CreateEnum
CREATE TYPE "AgentTaskStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AgentType" AS ENUM ('MONITORING', 'INCIDENT', 'RCA', 'REMEDIATION', 'DEPLOYMENT', 'SECURITY');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "anthropicApiKey" TEXT,
ADD COLUMN     "defaultLlmProvider" TEXT DEFAULT 'openai',
ADD COLUMN     "geminiApiKey" TEXT,
ADD COLUMN     "openaiApiKey" TEXT;

-- CreateTable
CREATE TABLE "websites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" "WebsiteStatus" NOT NULL DEFAULT 'PENDING',
    "verificationMethod" TEXT,
    "verificationToken" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "stackType" TEXT,
    "framework" TEXT,
    "healthStatus" TEXT NOT NULL DEFAULT 'unknown',
    "lastHealthCheck" TIMESTAMP(3),
    "uptimePercent" DOUBLE PRECISION,
    "avgResponseTime" INTEGER,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "websites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_checks" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "type" "HealthCheckType" NOT NULL DEFAULT 'HTTPS',
    "endpoint" TEXT NOT NULL DEFAULT '/',
    "status" TEXT NOT NULL,
    "statusCode" INTEGER,
    "responseTime" INTEGER,
    "errorMessage" TEXT,
    "sslValid" BOOLEAN,
    "sslExpiresAt" TIMESTAMP(3),
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_tasks" (
    "id" TEXT NOT NULL,
    "agentType" "AgentType" NOT NULL,
    "trigger" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "input" JSONB,
    "output" JSONB,
    "status" "AgentTaskStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "websiteId" TEXT,
    "incidentId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_task_logs" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_task_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "websites_tenantId_domain_key" ON "websites"("tenantId", "domain");

-- AddForeignKey
ALTER TABLE "websites" ADD CONSTRAINT "websites_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_checks" ADD CONSTRAINT "health_checks_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "websites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "websites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_tasks" ADD CONSTRAINT "agent_tasks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_task_logs" ADD CONSTRAINT "agent_task_logs_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "agent_tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
