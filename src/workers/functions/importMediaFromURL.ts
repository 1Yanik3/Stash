import { Job } from "bullmq"
import { exec } from "child_process"

import prisma from "../../lib/server/prisma"
import sharedImportLogic from "../../lib/server/sharedImportLogic"

export default async (job: Job) => {
  const data = job.data.data as {
    url: string
    title: string
    timestamp: number
    thumbnail: string
    ext: string
    _type: string
    cluster: string
    tags: string[]
  }

  // TODO: Validation of input data

  console.log(data)

  console.log(`  Creating database entry...`)
  const { id: mediaId } = await prisma.media.create({
    data: {
      name: data.title,
      type: `${data._type}/${data.ext}`,
      width: 0,
      height: 0,
      cluster: {
        connect: {
          name: data.cluster
        }
      },
      source: data.url,
      tags: data.tags.map((t: string) => t.toLocaleLowerCase())
    }
  })

  console.log(`  Downloading media from URL "${data.url}"...`)
  const downloadCommand = `yt-dlp --newline -o ./media/${mediaId} ${data.url}`
  const downloadProcess = exec(downloadCommand)

  if (downloadProcess.stdout)
    downloadProcess.stdout.on("data", data => {
      const match = (data as string).match(/\[download\] +(\d+)/)?.[1]
      if (match)
        job.updateProgress(parseInt(match))
    })

  await new Promise((resolve, reject) => {
    downloadProcess.on("exit", code => {
      if (code === 0) {
        resolve(null)
      } else {
        reject(new Error(`Failed to download media. Exit code: ${code}`))
      }
    })
  }).catch(e => {
    console.error("  Failed to download media:", e)
    throw e
  })

  console.log(`  Extract metadata from file...`)
  await sharedImportLogic(`./media/${mediaId}`, mediaId)

  console.log(`  Downloading thumbnail from URL "${data.thumbnail}"...`)
  await runCommand(
    `curl ${data.thumbnail} -o ./thumbnails/${mediaId}.webp`
  ).catch(e => {
    console.warn("  Failed to download thumbnail: ", e)
  })


  await job.updateProgress(100)
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
