import type { RequestHandler } from './$types'
import fs from 'fs/promises'

export const GET: RequestHandler = async ({ params }) => {
    const sourceFolderPath = `./comics_raw/${params.deviceId}/${params.comicName}`
    const sourceChapterFolders = (await fs.readdir(sourceFolderPath, { withFileTypes: true })).filter(a => a.isDirectory())

    let i = 0,
        cover: Buffer | null = null
    while (!cover) {
        const sourceChapterFolderPath = `${sourceFolderPath}/${sourceChapterFolders[i].name}`

        try {
            const sourceItem = (await fs.readdir(sourceChapterFolderPath)).filter(a => !a.startsWith("."))[0]
            cover = await fs.readFile(`${sourceChapterFolderPath}/${sourceItem}`)
        } catch { i++ }

    }

    return new Response(cover, {
        headers: {
            'Content-Type': 'image/png',
        }
    })
}
