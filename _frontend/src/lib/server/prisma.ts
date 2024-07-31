import { PrismaClient } from "@prisma/client"

// expose a singleton
export default new PrismaClient()
