import { QUEUES } from "$lib/constants"
import { Job, Queue } from "bullmq"

import { PageServerLoad } from "./$types"

const getJobState = async (job: Job) => {
  if (await job.isFailed()) return "failed"
  if (await job.isCompleted()) return "completed"
  if (await job.isActive()) return "active"
  if (await job.isDelayed()) return "delayed"
  if (await job.isWaiting()) return "waiting"
  if (await job.isWaitingChildren()) return "waiting-children"
  return "unknown"
}

export const load: PageServerLoad = async () => ({
  queues: Promise.all(
    (
      await Promise.all(
        Object.values(QUEUES).map(async queue => ({
          queueName: queue,
          jobs: (await new Queue(queue).getJobs()).slice(-5)
        }))
      )
    ).map(async ({ queueName, jobs }) => ({
      queueName,
      jobs: (
        await Promise.all(
          jobs.map(async job => ({
            id: job.id,
            name: job.name,
            data: job.data,
            progress: job.progress,
            failedReason: await getJobState(job)
          }))
        )
      ).sort((a, b) => (b.id || "").localeCompare(a.id || "", "en", { numeric: true }))
    }))
  )
})
