-- AlterTable
ALTER TABLE "User" ADD COLUMN "resetToken" TEXT UNIQUE;
ALTER TABLE "User" ADD COLUMN "resetTokenExpiry" TIMESTAMP(3);
