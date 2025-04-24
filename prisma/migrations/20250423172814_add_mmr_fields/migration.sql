/*
  Warnings:

  - The primary key for the `GameMatch` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "GameMatch" DROP CONSTRAINT "GameMatch_pkey",
ADD COLUMN     "mmrChange" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "newMMR" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "GameMatch_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GameMatch_id_seq";
