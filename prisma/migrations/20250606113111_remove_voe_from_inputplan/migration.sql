/*
  Warnings:

  - The values [READY] on the enum `ContentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `voe` on the `InputPlan` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContentStatus_new" AS ENUM ('DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'COMPLETED');
ALTER TABLE "ContentPlan" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "InputPlan" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "RedakPlan" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ContentPlan" ALTER COLUMN "status" TYPE "ContentStatus_new" USING ("status"::text::"ContentStatus_new");
ALTER TABLE "InputPlan" ALTER COLUMN "status" TYPE "ContentStatus_new" USING ("status"::text::"ContentStatus_new");
ALTER TABLE "RedakPlan" ALTER COLUMN "status" TYPE "ContentStatus_new" USING ("status"::text::"ContentStatus_new");
ALTER TYPE "ContentStatus" RENAME TO "ContentStatus_old";
ALTER TYPE "ContentStatus_new" RENAME TO "ContentStatus";
DROP TYPE "ContentStatus_old";
ALTER TABLE "ContentPlan" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "InputPlan" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
ALTER TABLE "RedakPlan" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterTable
ALTER TABLE "InputPlan" DROP COLUMN "voe";
