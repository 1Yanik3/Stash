import fs from "fs/promises"

import { createPostUploadJobs } from "$lib/server/actions/create-post-upload-jobs"
import { createPreUploadMediaEntry } from "$lib/server/actions/create-pre-upload-media-entry"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ params, request }) => {
    const data = await request.formData()
    const file = data.get("file") as File
    const selectedTagIds: number[] = JSON.parse(
        data.get("selectedTags") as string
    )

    const mediaId = await createPreUploadMediaEntry({
        name: file.name,
        type: file.type,
        clusterName: params.cluster,
        tagIds: selectedTagIds
    })

    // TODO: Get rid of this step
    const fileBuffer = Buffer.from(await file.arrayBuffer())

    await fs.writeFile(`./media/${mediaId}`, fileBuffer)
    console.timeEnd("media post request: store file")

    await createPostUploadJobs(mediaId, file.type)

    return new Response()
}
