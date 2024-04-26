import getMetadataFromFile from "$lib/server/getMetadataFromFile"
import sharedImportLogic from "$lib/server/sharedImportLogic"

import type { RequestHandler } from "@sveltejs/kit"

export const GET: RequestHandler = async ({ params }) => {
  if (!params.media) return new Response("No media provided", { status: 400 })
  sharedImportLogic(`./media/${params.media}`, params.media)
  return new Response()
}
