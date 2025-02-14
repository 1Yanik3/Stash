import type { Job } from "@prisma/client";
import prisma from "../prisma";

export const setJobStatus = async (d: { id: number; status: Job["status"] }) => {
    await prisma.job.update({
        where: { id: d.id },
        data: { status: d.status },
    })
}
