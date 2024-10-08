import { json } from "@sveltejs/kit"

import routes from "$lib/server/routes/_index"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  const { endpoint, args } = await request.json()

  for (const [route, handler] of Object.entries(routes)) {
    if (route === endpoint) {
      // @ts-ignore
      return json(await handler(...args))
    }
  }

  return new Response("Endpoint not found", { status: 404 })
}
