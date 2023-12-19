import ffmpeg from "fluent-ffmpeg"

import type { RequestHandler } from "./$types"

export const GET: RequestHandler = async ({ params }) => {
  const information: any = await new Promise(resolve =>
    ffmpeg.ffprobe(`./media/${params.media}`, (_, d) => resolve(d))
  )

  return new Response(JSON.stringify(information))
}
