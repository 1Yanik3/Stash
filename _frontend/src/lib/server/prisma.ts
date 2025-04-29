import { PrismaClient } from "@prisma/client"

import redis from "./redis"

const prisma = new PrismaClient({
    log: [
        {
            emit: "event",
            level: "query"
        },
        {
            emit: "stdout",
            level: "error"
        },
        {
            emit: "stdout",
            level: "info"
        },
        {
            emit: "stdout",
            level: "warn"
        }
    ]
})

export default prisma

prisma.$on("query", async e => {
    await redis.set(`query:${e.timestamp}`, JSON.stringify(e))
})
