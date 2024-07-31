import { Worker } from "bullmq"

import { QUEUES } from "../_frontend/src/lib/constants"
import importMediaFromURL from "./functions/importMediaFromURL"

const worker = new Worker(
  QUEUES.JOBS,
  async job => {
    console.log(`Processing job ${job.id} of type ${job.data.function}`)

    switch (job.data.function) {
      case "importMediaFromURL":
        await importMediaFromURL(job)
        break
      default:
        console.log("  Unknown function")
        break
    }
  },
  {
    connection: {
      host: "localhost",
      port: 6379
    }
  }
)

worker.on("completed", job => {
  console.log(`${job.id} has completed!`)
})

worker.on("failed", (job, err) => {
  console.log(`${job?.id} has failed with ${err.message}`)
})
