import prisma from "$lib/server/prisma"
import { exec } from "child_process"

import { error } from "@sveltejs/kit"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  const {
    url,
    title,
    timestamp,
    thumbnail,
    resolution,
    ext,
    _type,
    cluster,
    tags
  } = await request.json()

  // Create the database entry for the video
  const { id: mediaId } = await prisma.media.create({
    data: {
      name: title,
      type: `${_type}/${ext}`,
      createdDate: new Date(timestamp * 1000),
      width: +resolution ? +resolution.split("x")[0] : 0,
      height: +resolution ? +resolution.split("x")[1] : 0,
      cluster: {
        connect: {
          name: cluster
        }
      },
      tags: tags.map((t: string) => t.toLocaleLowerCase())
    }
  })

  // Download the video with yt-dlp, store it in the right location
  await runCommand(`yt-dlp -o ./media/${mediaId} ${url}`).catch(e => {
    throw error(500, JSON.stringify(e))
  })

  // Download the thumbnail
  await runCommand(`curl ${thumbnail} -o ./thumbnails/${mediaId}.webp`).catch(
    e => {
      throw error(500, JSON.stringify(e))
    }
  )

  return new Response()
}

// TODO: centralise logic
const runCommand = (command: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        resolve(stdout)
      }
    })
  })
}
