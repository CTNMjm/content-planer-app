/*
  Warnings:

  - Added the required column `action` to the `InputPlanHistory` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('CREATE', 'UPDATE', 'DELETE');

-- AlterTable
ALTER TABLE "InputPlanHistory" ADD COLUMN "action" "ActionType" NOT NULL DEFAULT 'UPDATE';
