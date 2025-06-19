/*
  Warnings:

  - Made the column `clientEmail` on table `Quote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clientLastName` on table `Quote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clientName` on table `Quote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `clientNationality` on table `Quote` required. This step will fail if there are existing NULL values in that column.
  - Made the column `governmentLabel` on table `Quote` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Quote" ALTER COLUMN "clientEmail" SET NOT NULL,
ALTER COLUMN "clientLastName" SET NOT NULL,
ALTER COLUMN "clientName" SET NOT NULL,
ALTER COLUMN "clientNationality" SET NOT NULL,
ALTER COLUMN "governmentLabel" SET NOT NULL;
