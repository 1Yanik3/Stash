import type { RequestHandler } from './$types'

import fs from 'fs/promises'
// import { ExifParserFactory } from "ts-exif-parser"

import sharedImportLogic from '../sharedImportLogic'
import { sortingMethods, type Group } from '../../../../../types'
import { json } from '@sveltejs/kit'

import { PrismaClient, type Media, type Tags } from '@prisma/client'
const prisma = new PrismaClient()

export const GET: RequestHandler = async ({ params, request }) => {

    const searchParams = new URL(request.url).searchParams

    const cluster = await prisma.clusters.findFirstOrThrow({
        where: {
            groups: {
                some: {
                    id: +params.group
                }
            }
        }
    })

    let output: (Media & { tags: Tags[] })[] = [];

    const addToOutput = async (g: Group) => {
        output = [...output, ...await (async (groupId: number) => {
    
            // return all media of a cluster if it's the everything group
            if (Number(groupId) == cluster.everythingGroupId)
                return  (
                    await prisma.media.findMany({
                        where: {
                            group: {
                                cluster
                            }
                        },
                        include: {
                            tags: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    })
                ).map(d => {
                    d.date = d.date.getTime() as any
                    return d
                })
        
            return (
                await prisma.media.findMany({
                    where: { groupId },
                    include: {
                        tags: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                })
            ).map(d => {
                d.date = d.date.getTime() as any
                return d
            })
        })(g.id)];
        if (searchParams.get("traverse") == "true")
            for (const i in g.children)
                await addToOutput(g.children[i]);
    };

    const group = await prisma.groups.findFirstOrThrow({
        where: { id: +params.group },
        include: {
            cluster: true,
            children: true
        }
    })
    
    await addToOutput(group as any);
console.log(searchParams.get("mediaTypeFilter"))
    const collator = new Intl.Collator([], { numeric: true });
    if (group.cluster.type == "collection" && group.id != group.cluster.everythingGroupId) {
        return json(output
        .filter((d) => d.type.startsWith(searchParams.get("mediaTypeFilter") || ""))
        .sort((a, b) => collator.compare(a.name, b.name)))
    } else {
        return json(output
        .filter((d) => d.type.startsWith(searchParams.get("mediaTypeFilter") || ""))
        // @ts-ignore
        .sort(sortingMethods[+searchParams.get("activeSortingMethod")].method))
    }
}

export const POST: RequestHandler = async ({ params, request }) => {
    console.time("media post request: formData")
    const data = await request.formData()
    console.timeEnd("media post request: formData")

    console.time("media post request: get file")
    const file = data.get('file') as File
    console.timeEnd("media post request: get file")

    console.time("media post request: create db entry")

    const { id: mediaId } = await prisma.media.create({
        data: {
            name: file.name,
            type: file.type,
            date: new Date(),
            height: 0,
            width: 0,
            groupId: Number(params.group),
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
