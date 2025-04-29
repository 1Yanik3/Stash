import { Mistral } from "@mistralai/mistralai"
import { error } from "@sveltejs/kit"

import { env } from "$env/dynamic/private"

import type { RequestHandler } from "./$types"

const client = new Mistral({
    apiKey: env["MISTRAL_API_KEY"]
})

export const POST: RequestHandler = async ({ request }) => {
    let { prompt, model } = await request.json()

    if (!prompt) throw error(400)

    if (!model) model = "mistral-small"

    const chatResponse = await client.chat.complete({
        model,
        messages: [{ role: "user", content: prompt }]
    })

    return new Response(
        (chatResponse.choices &&
            chatResponse.choices[0].message.content?.toString()) ||
            "",
        {
            status: 200
        }
    )
}
