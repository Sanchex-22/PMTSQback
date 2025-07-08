/*
  Warnings:

  - You are about to drop the column `courseId` on the `Quote` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Quote" DROP CONSTRAINT "Quote_courseId_fkey";

-- AlterTable
ALTER TABLE "Quote" DROP COLUMN "courseId",
ADD COLUMN     "government" TEXT;

-- CreateTable
CREATE TABLE "QuoteCourse" (
    "id" SERIAL NOT NULL,
    "quoteId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "surcharge" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "QuoteCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuoteCourse_quoteId_courseId_type_key" ON "QuoteCourse"("quoteId", "courseId", "type");

-- AddForeignKey
ALTER TABLE "QuoteCourse" ADD CONSTRAINT "QuoteCourse_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteCourse" ADD CONSTRAINT "QuoteCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
