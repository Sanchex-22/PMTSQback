/*
  Warnings:

  - You are about to drop the column `clientDocument` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `clientEmail` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `clientLastName` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `clientName` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `clientNationality` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `clientPhone` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `governmentLabel` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the column `governmentSurchargePerCourse` on the `Quote` table. All the data in the column will be lost.
  - You are about to drop the `QuotationItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `courseId` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "QuotationItem" DROP CONSTRAINT "QuotationItem_courseId_fkey";

-- DropForeignKey
ALTER TABLE "QuotationItem" DROP CONSTRAINT "QuotationItem_quoteId_fkey";

-- AlterTable
ALTER TABLE "Quote" DROP COLUMN "clientDocument",
DROP COLUMN "clientEmail",
DROP COLUMN "clientLastName",
DROP COLUMN "clientName",
DROP COLUMN "clientNationality",
DROP COLUMN "clientPhone",
DROP COLUMN "governmentLabel",
DROP COLUMN "governmentSurchargePerCourse",
ADD COLUMN     "courseId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "QuotationItem";

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
