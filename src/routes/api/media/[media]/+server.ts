import type { RequestHandler } from './$types'
import fs from 'fs'

import { Readable } from 'stream'

export const GET: RequestHandler = async ({ params, request }) => {
    const stream = fs.createReadStream(`./media/${params.media}`)
    return new Response(Readable.toWeb(stream), {
        status: 206
    })
}