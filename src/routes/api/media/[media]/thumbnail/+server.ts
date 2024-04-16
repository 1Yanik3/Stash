import getMetadataFromFile from "$lib/server/getMetadataFromFile"
import prisma from "$lib/server/prisma"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs/promises"

import type { RequestHandler } from "./$types"

const targetSize = 500
const thumbnailRoot = "./thumbnails"
const mediaRoot = "./media"

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { height, width } = await getMetadataFromFile(
      `${mediaRoot}/${params.media}`
    )

    if (height > 1000 && width > 1000) {
      await fs.rename(
        `${thumbnailRoot}/${params.media}.webp`,
        `${thumbnailRoot}/${params.media}.original.webp`
      )

      await generateThumbnail(
        `${thumbnailRoot}/${params.media}.original.webp`,
        `${thumbnailRoot}/${params.media}.webp`
      )
    }

    return new Response(
      await fs.readFile(`${thumbnailRoot}/${params.media}.webp`)
    )
  } catch {
    try {
      // create thumbnail
      await createThumbnail(params)

      // respond with thumbnail
      return new Response(
        await fs.readFile(`${thumbnailRoot}/${params.media}.webp`)
      )
    } catch (e: any) {
      console.error("Error generating thumbnail", e.message)
      return new Response("Thumbnail was unable to be found or generated!", {
        status: 500
      })
    }
  }
}

export const POST: RequestHandler = async ({ request, params }) => {
  const data = await request.formData()
  const file = data.get("file") as File
  const fileBuffer = Buffer.from(await file.arrayBuffer())

  await fs.writeFile(`${thumbnailRoot}/${params.media}.webp`, fileBuffer)

  return new Response()
}

const createThumbnail = async ({ media }: { media: string }) => {
  const cluster = await prisma.clusters.findFirstOrThrow({
    where: {
      Media: {
        some: {
          id: media
        }
      }
    }
  })

  const { duration } = await getMetadataFromFile(`${mediaRoot}/${media}`)
  let defaultDuration = 7
  if (cluster.name == "Studios") defaultDuration = 30

  const outputOptions = duration
    ? [
        "-vframes 1",
        `-ss ${
          duration > defaultDuration
            ? defaultDuration
            : (duration / 2).toFixed(1)
        }`
      ]
    : []

  await generateThumbnail(
    `${mediaRoot}/${media}`,
    `${thumbnailRoot}/${media}.webp`,
    outputOptions
  )
}

const generateThumbnail = (
  inputFile: string,
  outputFile: string,
  outputOptions: any = []
) =>
  new Promise((resolve, reject) => {
    console.log({ inputFile, outputFile, outputOptions })
    try {
      ffmpeg()
        .input(inputFile)
        .complexFilter([
          `scale=w=${targetSize}:h=${targetSize}:force_original_aspect_ratio=decrease`
        ])
        .output(outputFile)
        .on("end", resolve)
        .outputOptions(outputOptions)
        .run()
    } catch (error: any) {
      reject(error)
    }
  })
