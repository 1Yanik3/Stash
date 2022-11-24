-- CreateEnum
CREATE TYPE "ClusterType" AS ENUM ('normal', 'collection');

-- CreateTable
CREATE TABLE "Credentials" (
    "credentialID" BYTEA NOT NULL,
    "credentialPublicKey" BYTEA NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "InviteCodes" (
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Clusters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "type" "ClusterType" NOT NULL,

    CONSTRAINT "Clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Groups" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "collapse" BOOLEAN NOT NULL DEFAULT false,
    "clusterId" INTEGER NOT NULL,
    "parentId" INTEGER NOT NULL,

    CONSTRAINT "Groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Media" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaToTags" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Credentials_credentialID_key" ON "Credentials"("credentialID");

-- CreateIndex
CREATE UNIQUE INDEX "Credentials_credentialPublicKey_key" ON "Credentials"("credentialPublicKey");

-- CreateIndex
CREATE UNIQUE INDEX "InviteCodes_code_key" ON "InviteCodes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Clusters_name_key" ON "Clusters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_MediaToTags_AB_unique" ON "_MediaToTags"("A", "B");

-- CreateIndex
CREATE INDEX "_MediaToTags_B_index" ON "_MediaToTags"("B");

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_clusterId_fkey" FOREIGN KEY ("clusterId") REFERENCES "Clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToTags" ADD CONSTRAINT "_MediaToTags_A_fkey" FOREIGN KEY ("A") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaToTags" ADD CONSTRAINT "_MediaToTags_B_fkey" FOREIGN KEY ("B") REFERENCES "Tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
