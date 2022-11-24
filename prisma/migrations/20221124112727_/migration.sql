/*
  Warnings:

  - You are about to drop the column `collapse` on the `Groups` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Groups" DROP COLUMN "collapse",
ADD COLUMN     "collapsed" BOOLEAN NOT NULL DEFAULT false;
