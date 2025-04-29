import type { Job } from "@prisma/client"

import prisma from "../prisma"

export const setJobStatus = async (d: {
    id: number
    status: Job["status"]
}) => {
    await prisma.job.update({
        where: { id: d.id },
        data: { status: d.status }
    })
}

export const createJob = async (d: {
    name: string
    data: string
    priority?: number
}) => {
    await prisma.job.create({
        data: {
            name: d.name,
            data: d.data,
            priority: d.priority
        }
    })
}
