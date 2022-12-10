/*
  Warnings:

  - Added the required column `credentialsMetadataId` to the `InviteCodes` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CredentialsIcon" AS ENUM ('UsbFlashDrive', 'Tablet', 'Cellphone', 'Laptop', 'DesktopClassic', 'Key', 'KeyWireless');

-- AlterTable
ALTER TABLE "Credentials" ADD COLUMN     "credentialsMetadataId" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "InviteCodes" ADD COLUMN     "credentialsMetadataId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "CredentialsMetadata" (
    "id" INTEGER NOT NULL,
    "icon" "CredentialsIcon" NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CredentialsMetadata_pkey" PRIMARY KEY ("id")
);

INSERT INTO "CredentialsMetadata" ("id", "icon", "name") VALUES (0, 'Key', 'Unknown');

-- AddForeignKey
ALTER TABLE "Credentials" ADD CONSTRAINT "Credentials_credentialsMetadataId_fkey" FOREIGN KEY ("credentialsMetadataId") REFERENCES "CredentialsMetadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteCodes" ADD CONSTRAINT "InviteCodes_credentialsMetadataId_fkey" FOREIGN KEY ("credentialsMetadataId") REFERENCES "CredentialsMetadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
