/*
  Warnings:

  - You are about to drop the column `description` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Course` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Course` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_foreign` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_foreign_renewal` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_panamanian` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_panamanian_renewal` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Course_title_key";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "description",
DROP COLUMN "price",
DROP COLUMN "title",
ADD COLUMN     "abbr" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "price_foreign" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price_foreign_renewal" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price_panamanian" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "price_panamanian_renewal" DOUBLE PRECISION NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "Course"("name");
