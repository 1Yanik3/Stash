import getMetadataFromFile from "$lib/server/getMetadataFromFile"

import type { RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ params }) =>
  new Response(
    JSON.stringify(await getMetadataFromFile(`./media/${params.media}`))
  )
