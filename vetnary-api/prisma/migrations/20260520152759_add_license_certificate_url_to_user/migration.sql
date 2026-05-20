/*
  Warnings:

  - You are about to drop the column `licenseNumber` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_licenseNumber_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "licenseNumber",
ADD COLUMN     "licenseCertificateUrl" TEXT;
