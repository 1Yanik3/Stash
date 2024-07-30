import { exec } from "child_process"

import { error } from "@sveltejs/kit"

import type { RequestHandler } from "./$types"

export const POST: RequestHandler = async ({ request }) => {
  const { url } = await request.json()

  // Execute the yt-dlp command for the url with the -J flag to get the JSON metadata, and return the result if it's successful
  return new Response(
    await runCommand(`yt-dlp -J "${url}"`).catch(e => {
      throw error(500, JSON.stringify(e))
    })
  )
}

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

export type Metadata = {
  id: string
  display_id: string
  title: string
  description: string
  timestamp: number
  thumbnail: string
  duration: number
  duration_string: string
  ext: string
  fps: number
  width: number
  height: number
  resolution: string
  aspect_ratio: number
  format: string
  _type: string
  url: string
}
