-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('free', 'premium', 'test');

-- CreateEnum
CREATE TYPE "Chain" AS ENUM ('mina_mainnet', 'mina_devnet', 'zeko_mainnet', 'zeko_devnet');

-- CreateTable
CREATE TABLE "APIKey" (
    "address" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "discord" VARCHAR(100) NOT NULL,
    "expiry" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "plan" "Plan" NOT NULL DEFAULT 'free',

    CONSTRAINT "APIKey_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "AddressBlacklist" (
    "address" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "AddressBlacklist_pkey" PRIMARY KEY ("address")
);

-- CreateTable
CREATE TABLE "EmailBlacklist" (
    "email" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "EmailBlacklist_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "DiscordBlacklist" (
    "discord" TEXT NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "DiscordBlacklist_pkey" PRIMARY KEY ("discord")
);

-- CreateTable
CREATE TABLE "APIKeyChain" (
    "address" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "activated" BOOLEAN NOT NULL,

    CONSTRAINT "APIKeyChain_pkey" PRIMARY KEY ("address","chain")
);

-- CreateTable
CREATE TABLE "APIKeyUsage" (
    "address" TEXT NOT NULL,
    "chain" "Chain" NOT NULL,
    "jobId" TEXT NOT NULL,

    CONSTRAINT "APIKeyUsage_pkey" PRIMARY KEY ("address","chain","jobId")
);

-- CreateTable
CREATE TABLE "JobData" (
    "jobId" TEXT NOT NULL,
    "address" TEXT,
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "developer" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "task" TEXT,
    "userId" TEXT,
    "args" TEXT,
    "metadata" TEXT,
    "chain" "Chain" NOT NULL,
    "filename" TEXT,
    "txNumber" INTEGER NOT NULL,
    "timeCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timeStarted" TIMESTAMP(3),
    "timeFinished" TIMESTAMP(3),
    "timeFailed" TIMESTAMP(3),
    "timeUsed" TIMESTAMP(3),
    "jobStatus" TEXT NOT NULL,
    "billedDuration" INTEGER,
    "result" TEXT,
    "logStreams" JSONB,
    "logs" TEXT[],
    "isFullLog" BOOLEAN,

    CONSTRAINT "JobData_pkey" PRIMARY KEY ("jobId")
);

-- CreateIndex
CREATE INDEX "APIKey_email_idx" ON "APIKey"("email");

-- CreateIndex
CREATE INDEX "APIKey_plan_idx" ON "APIKey"("plan");

-- CreateIndex
CREATE INDEX "APIKey_address_idx" ON "APIKey"("address");

-- CreateIndex
CREATE INDEX "APIKey_discord_idx" ON "APIKey"("discord");

-- CreateIndex
CREATE INDEX "APIKeyChain_address_idx" ON "APIKeyChain"("address");

-- CreateIndex
CREATE INDEX "APIKeyChain_chain_idx" ON "APIKeyChain"("chain");

-- CreateIndex
CREATE INDEX "APIKeyChain_activated_idx" ON "APIKeyChain"("activated");

-- CreateIndex
CREATE INDEX "APIKeyUsage_address_idx" ON "APIKeyUsage"("address");

-- CreateIndex
CREATE INDEX "APIKeyUsage_jobId_idx" ON "APIKeyUsage"("jobId");

-- CreateIndex
CREATE INDEX "APIKeyUsage_chain_idx" ON "APIKeyUsage"("chain");

-- CreateIndex
CREATE INDEX "JobData_chain_idx" ON "JobData"("chain");

-- CreateIndex
CREATE INDEX "JobData_jobId_idx" ON "JobData"("jobId");

-- CreateIndex
CREATE INDEX "JobData_timeCreated_idx" ON "JobData"("timeCreated");

-- CreateIndex
CREATE INDEX "JobData_jobStatus_idx" ON "JobData"("jobStatus");

-- CreateIndex
CREATE INDEX "JobData_chain_jobStatus_idx" ON "JobData"("chain", "jobStatus");

-- AddForeignKey
ALTER TABLE "APIKeyChain" ADD CONSTRAINT "APIKeyChain_address_fkey" FOREIGN KEY ("address") REFERENCES "APIKey"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIKeyUsage" ADD CONSTRAINT "APIKeyUsage_address_fkey" FOREIGN KEY ("address") REFERENCES "APIKey"("address") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APIKeyUsage" ADD CONSTRAINT "APIKeyUsage_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobData"("jobId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobData" ADD CONSTRAINT "JobData_address_fkey" FOREIGN KEY ("address") REFERENCES "APIKey"("address") ON DELETE CASCADE ON UPDATE CASCADE;
