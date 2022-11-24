-- DropForeignKey
ALTER TABLE "Groups" DROP CONSTRAINT "Groups_parentId_fkey";

-- AlterTable
ALTER TABLE "Groups" ALTER COLUMN "parentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
