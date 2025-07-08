-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocationRole" (
    "id" TEXT NOT NULL,
    "userLocationId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "UserLocationRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userLocationId" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPlan" (
    "id" TEXT NOT NULL,
    "monat" TEXT NOT NULL,
    "bezug" TEXT NOT NULL,
    "mehrwert" TEXT,
    "mechanikThema" TEXT NOT NULL,
    "idee" TEXT NOT NULL,
    "platzierung" TEXT NOT NULL,
    "implementationLevel" TEXT,
    "creativeFormat" TEXT,
    "creativeBriefingExample" TEXT,
    "copyExample" TEXT,
    "copyExampleCustomized" TEXT,
    "firstCommentForEngagement" TEXT,
    "notes" TEXT,
    "action" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "statusChangedAt" TIMESTAMP(3),
    "statusChangedById" TEXT,

    CONSTRAINT "ContentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputPlan" (
    "id" TEXT NOT NULL,
    "contentPlanId" TEXT,
    "monat" TEXT NOT NULL,
    "bezug" TEXT NOT NULL,
    "mehrwert" TEXT,
    "mechanikThema" TEXT NOT NULL,
    "idee" TEXT NOT NULL,
    "platzierung" TEXT NOT NULL,
    "implementationLevel" TEXT,
    "creativeFormat" TEXT,
    "creativeBriefingExample" TEXT,
    "copyExample" TEXT,
    "copyExampleCustomized" TEXT,
    "firstCommentForEngagement" TEXT,
    "notes" TEXT,
    "action" TEXT,
    "zusatzinfo" TEXT,
    "gptResult" TEXT,
    "n8nResult" TEXT,
    "flag" BOOLEAN NOT NULL DEFAULT false,
    "voe" TIMESTAMP(3),
    "voeDate" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "locationId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "InputPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputPlanHistory" (
    "id" TEXT NOT NULL,
    "inputPlanId" TEXT NOT NULL,
    "action" TEXT NOT NULL DEFAULT 'UPDATE',
    "changedBy" TEXT NOT NULL DEFAULT 'System',
    "changedById" TEXT NOT NULL,
    "previousData" JSONB,
    "newData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "field" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,

    CONSTRAINT "InputPlanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RedakPlan" (
    "id" TEXT NOT NULL,
    "inputPlanId" TEXT,
    "monat" TEXT NOT NULL,
    "bezug" TEXT NOT NULL,
    "mechanikThema" TEXT NOT NULL,
    "idee" TEXT NOT NULL,
    "platzierung" TEXT NOT NULL,
    "voe" TIMESTAMP(3) NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publiziert" BOOLEAN NOT NULL DEFAULT false,
    "locationId" TEXT NOT NULL,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RedakPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentPlanHistory" (
    "id" TEXT NOT NULL,
    "contentPlanId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "ContentPlanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_name_key" ON "UserRole"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Location_name_key" ON "Location"("name");

-- CreateIndex
CREATE INDEX "UserLocation_userId_idx" ON "UserLocation"("userId");

-- CreateIndex
CREATE INDEX "UserLocation_locationId_idx" ON "UserLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_userId_locationId_key" ON "UserLocation"("userId", "locationId");

-- CreateIndex
CREATE INDEX "UserLocationRole_userLocationId_idx" ON "UserLocationRole"("userLocationId");

-- CreateIndex
CREATE INDEX "UserLocationRole_roleId_idx" ON "UserLocationRole"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocationRole_userLocationId_roleId_key" ON "UserLocationRole"("userLocationId", "roleId");

-- CreateIndex
CREATE INDEX "Permission_userLocationId_idx" ON "Permission"("userLocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_userLocationId_name_key" ON "Permission"("userLocationId", "name");

-- CreateIndex
CREATE INDEX "ContentPlan_locationId_idx" ON "ContentPlan"("locationId");

-- CreateIndex
CREATE INDEX "ContentPlan_createdById_idx" ON "ContentPlan"("createdById");

-- CreateIndex
CREATE INDEX "ContentPlan_updatedById_idx" ON "ContentPlan"("updatedById");

-- CreateIndex
CREATE INDEX "ContentPlan_statusChangedById_idx" ON "ContentPlan"("statusChangedById");

-- CreateIndex
CREATE INDEX "InputPlan_locationId_idx" ON "InputPlan"("locationId");

-- CreateIndex
CREATE INDEX "InputPlan_contentPlanId_idx" ON "InputPlan"("contentPlanId");

-- CreateIndex
CREATE INDEX "InputPlan_status_idx" ON "InputPlan"("status");

-- CreateIndex
CREATE INDEX "InputPlan_monat_idx" ON "InputPlan"("monat");

-- CreateIndex
CREATE INDEX "InputPlan_createdById_idx" ON "InputPlan"("createdById");

-- CreateIndex
CREATE INDEX "InputPlan_updatedById_idx" ON "InputPlan"("updatedById");

-- CreateIndex
CREATE INDEX "RedakPlan_locationId_idx" ON "RedakPlan"("locationId");

-- CreateIndex
CREATE INDEX "RedakPlan_inputPlanId_idx" ON "RedakPlan"("inputPlanId");

-- CreateIndex
CREATE INDEX "RedakPlan_status_idx" ON "RedakPlan"("status");

-- CreateIndex
CREATE INDEX "RedakPlan_monat_idx" ON "RedakPlan"("monat");

-- CreateIndex
CREATE INDEX "RedakPlan_publiziert_idx" ON "RedakPlan"("publiziert");

-- CreateIndex
CREATE INDEX "RedakPlan_createdById_idx" ON "RedakPlan"("createdById");

-- CreateIndex
CREATE INDEX "RedakPlan_updatedById_idx" ON "RedakPlan"("updatedById");

-- CreateIndex
CREATE INDEX "ContentPlanHistory_contentPlanId_idx" ON "ContentPlanHistory"("contentPlanId");

-- CreateIndex
CREATE INDEX "ContentPlanHistory_changedById_idx" ON "ContentPlanHistory"("changedById");

-- CreateIndex
CREATE INDEX "ContentPlanHistory_changedAt_idx" ON "ContentPlanHistory"("changedAt");

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocationRole" ADD CONSTRAINT "UserLocationRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "UserRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocationRole" ADD CONSTRAINT "UserLocationRole_userLocationId_fkey" FOREIGN KEY ("userLocationId") REFERENCES "UserLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_userLocationId_fkey" FOREIGN KEY ("userLocationId") REFERENCES "UserLocation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPlan" ADD CONSTRAINT "ContentPlan_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPlan" ADD CONSTRAINT "ContentPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPlan" ADD CONSTRAINT "ContentPlan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPlan" ADD CONSTRAINT "ContentPlan_statusChangedById_fkey" FOREIGN KEY ("statusChangedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPlan" ADD CONSTRAINT "InputPlan_contentPlanId_fkey" FOREIGN KEY ("contentPlanId") REFERENCES "ContentPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPlan" ADD CONSTRAINT "InputPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPlan" ADD CONSTRAINT "InputPlan_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPlan" ADD CONSTRAINT "InputPlan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPlanHistory" ADD CONSTRAINT "InputPlanHistory_inputPlanId_fkey" FOREIGN KEY ("inputPlanId") REFERENCES "InputPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputPlanHistory" ADD CONSTRAINT "InputPlanHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedakPlan" ADD CONSTRAINT "RedakPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedakPlan" ADD CONSTRAINT "RedakPlan_inputPlanId_fkey" FOREIGN KEY ("inputPlanId") REFERENCES "InputPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedakPlan" ADD CONSTRAINT "RedakPlan_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedakPlan" ADD CONSTRAINT "RedakPlan_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPlanHistory" ADD CONSTRAINT "ContentPlanHistory_contentPlanId_fkey" FOREIGN KEY ("contentPlanId") REFERENCES "ContentPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentPlanHistory" ADD CONSTRAINT "ContentPlanHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
