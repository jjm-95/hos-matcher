/*
  Warnings:

  - Made the column `matchId` on table `GameMatch` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "GameMatch" ALTER COLUMN "matchId" SET NOT NULL;
