import { env } from "$env/dynamic/private"

import MistralClient from "@mistralai/mistralai"
import { error } from "@sveltejs/kit"

import type { RequestHandler } from "./$types"

const client = new MistralClient(env["MISTRAL_API_KEY"])

export const POST: RequestHandler = async ({ request }) => {
  let { prompt, model } = await request.json()

  if (!prompt) throw error(400)

  if (!model) model = "mistral-small"

  const chatResponse = await client.chat({
    model,
    messages: [{ role: "user", content: prompt }]
  })

  return new Response(chatResponse.choices[0].message.content, {
    status: 200
  })
}
