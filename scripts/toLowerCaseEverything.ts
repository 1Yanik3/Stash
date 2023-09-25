import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.$executeRaw`
UPDATE "Media"
SET tags = ARRAY(SELECT LOWER(unnest(tags)))
`