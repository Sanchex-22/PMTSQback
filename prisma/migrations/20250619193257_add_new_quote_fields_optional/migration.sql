/*
  Warnings:

  - You are about to drop the column `courseId` on the `Quote` table. All the data in the column will be lost.
  - Added the required column `governmentSurchargePerCourse` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "QuoteStatus" ADD VALUE 'REJECTED';

-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_courseId_fkey";

-- AlterTable
ALTER TABLE "Quote" DROP COLUMN "courseId",
ADD COLUMN     "clientDocument" TEXT,
ADD COLUMN     "clientEmail" TEXT,
ADD COLUMN     "clientLastName" TEXT,
ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "clientNationality" TEXT,
ADD COLUMN     "clientPhone" TEXT,
ADD COLUMN     "governmentLabel" TEXT,
ADD COLUMN     "governmentSurchargePerCourse" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "QuotationItem" (
    "id" SERIAL NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "QuotationItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotationItem" ADD CONSTRAINT "QuotationItem_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
