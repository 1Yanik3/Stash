import { error } from "@sveltejs/kit"

import prisma from "$lib/server/prisma"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  const { id, username } = await request.json()

  if (!id || !username) throw error(400, "Missing required fields")

  await prisma.credentials.update({
    where: { id },
    data: { username }
  })

  return new Response(null, { status: 200 })
}
