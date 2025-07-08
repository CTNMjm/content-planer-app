/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `InputPlan` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `InputPlan` table. All the data in the column will be lost.
  - You are about to drop the column `action` on the `InputPlanHistory` table. All the data in the column will be lost.
  - You are about to drop the column `changedBy` on the `InputPlanHistory` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `InputPlanHistory` table. All the data in the column will be lost.
  - You are about to drop the column `newData` on the `InputPlanHistory` table. All the data in the column will be lost.
  - You are about to drop the column `previousData` on the `InputPlanHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "InputPlanHistory" DROP CONSTRAINT "InputPlanHistory_inputPlanId_fkey";

-- AlterTable
ALTER TABLE "InputPlan" DROP COLUMN "deletedAt",
DROP COLUMN "deletedById";

-- AlterTable
ALTER TABLE "InputPlanHistory" DROP COLUMN "action",
DROP COLUMN "changedBy",
DROP COLUMN "createdAt",
DROP COLUMN "newData",
DROP COLUMN "previousData";

-- CreateTable
CREATE TABLE "RedakPlanHistory" (
    "id" TEXT NOT NULL,
    "redakPlanId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "fieldName" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT NOT NULL,
    "metadata" JSONB,

    CONSTRAINT "RedakPlanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RedakPlanHistory_redakPlanId_idx" ON "RedakPlanHistory"("redakPlanId");

-- CreateIndex
CREATE INDEX "RedakPlanHistory_changedById_idx" ON "RedakPlanHistory"("changedById");

-- CreateIndex
CREATE INDEX "RedakPlanHistory_changedAt_idx" ON "RedakPlanHistory"("changedAt");

-- CreateIndex
CREATE INDEX "InputPlanHistory_inputPlanId_idx" ON "InputPlanHistory"("inputPlanId");

-- CreateIndex
CREATE INDEX "InputPlanHistory_changedAt_idx" ON "InputPlanHistory"("changedAt");

-- AddForeignKey
ALTER TABLE "InputPlanHistory" ADD CONSTRAINT "InputPlanHistory_inputPlanId_fkey" FOREIGN KEY ("inputPlanId") REFERENCES "InputPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedakPlanHistory" ADD CONSTRAINT "RedakPlanHistory_redakPlanId_fkey" FOREIGN KEY ("redakPlanId") REFERENCES "RedakPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RedakPlanHistory" ADD CONSTRAINT "RedakPlanHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
