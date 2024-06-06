import { QUEUES } from "$lib/constants"
import { Queue } from "bullmq"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  const queue = new Queue(QUEUES.JOBS)

  const {
    url,
    title,
    timestamp,
    thumbnail,
    resolution,
    ext,
    _type,
    cluster,
    tags
  } = await request.json()

  const newJob = queue.add("Import Media from URL", {
    function: "importMediaFromURL",
    data: {
      url,
      title,
      timestamp,
      thumbnail,
      resolution,
      ext,
      _type,
      cluster,
      tags
    }
  })

  return new Response((await newJob).id, { status: 201 })
}
