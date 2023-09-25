import type { RequestHandler } from './$types'

import fs from 'fs/promises'
// import { ExifParserFactory } from "ts-exif-parser"

import sharedImportLogic from '../../../../../lib/sharedImportLogic'
import { sortingMethods } from '../../../../../types'
import { json } from '@sveltejs/kit'

import { Prisma, PrismaClient, type Media } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params, request }) => {
    const searchParams = new URL(request.url).searchParams
    const traverse = searchParams.get('traverse') == "true"
    const tags = searchParams.get('tags')?.split(",") || []
    const activeSortingMethod = sortingMethods[+(searchParams.get("activeSortingMethod") || 0)]
    const mediaTypeFilter = searchParams.get('mediaTypeFilter') || ""

    let tagsFilter: Prisma.MediaWhereInput = {}

    if (tags[0]?.length) tagsFilter = {
        tags: {
            hasSome: tags.map(t => t.toLocaleLowerCase()),
        }
    }

    if (tags[0] == "SHOW_UNSORTED") tagsFilter = {
        tags: {
            isEmpty: true
        }
    }
    
    return json(await prisma.media.findMany({
        where: {
            cluster: {
                name: params.cluster
            },
            ...tagsFilter,
            type: {
                startsWith: mediaTypeFilter
            },
        },
        orderBy: activeSortingMethod.orderBy || {} // TODO
    }))

    // const collator = new Intl.Collator([], { numeric: true });
    // if (group.cluster.type == "collection" && group.id != group.cluster.everythingGroupId) {
    //     return json(output
    //     .filter((d) => d.type.startsWith(searchParams.get("mediaTypeFilter") || ""))
    //     .sort((a, b) => collator.compare(a.name, b.name)))
    // } else {
    //     return json(output
    //     .filter((d) => d.type.startsWith(searchParams.get("mediaTypeFilter") || ""))
    //     // @ts-ignore
    //     .sort(sortingMethods[+searchParams.get("activeSortingMethod")].method))
    // }
}

export const POST: RequestHandler = async ({ params, request }) => {
    console.time("media post request: formData")
    const data = await request.formData()
    console.timeEnd("media post request: formData")

    console.time("media post request: get file")
    const file = data.get('file') as File
    const selectedTags = (data.get('selectedTags') as string).split(",")
    console.timeEnd("media post request: get file")

    console.time("media post request: create db entry")

    const { id: mediaId } = await prisma.media.create({
        data: {
            name: file.name,
            type: file.type,
            date: new Date(),
            height: 0,
            width: 0,
            cluster: {
                connect: {
                    name: params.cluster
                }
            },
            tags: selectedTags.map(t => t.toLocaleLowerCase())
        }
    })
    console.timeEnd("media post request: create db entry")

    // TODO: Get rid of this step
    console.time("media post request: get buffer")
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    console.timeEnd("media post request: get buffer")

    console.time("media post request: store file")
    // store file
    await fs.writeFile(`./media/${mediaId}`, fileBuffer)
    console.timeEnd("media post request: store file")

    await sharedImportLogic(file.name, mediaId)

    return new Response()
}
