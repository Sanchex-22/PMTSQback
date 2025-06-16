-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "price_foreign" DROP NOT NULL,
ALTER COLUMN "price_foreign_renewal" DROP NOT NULL,
ALTER COLUMN "price_panamanian" DROP NOT NULL,
ALTER COLUMN "price_panamanian_renewal" DROP NOT NULL;
