import fs from "fs/promises"

import generateThumbnail from "../src/lib/server/generateThumbnail"
import getMetadataFromFile from "../src/lib/server/getMetadataFromFile"

const thumbnailRoot = "./thumbnails"

;(async () => {
  // TODO: Run a for loop for all items in the thumbnailRoot directory that are over 200kb
  // and run the following code on each of them
  const files = await fs.readdir(thumbnailRoot)
  for (const file of files) {
    const { size } = await fs.stat(`${thumbnailRoot}/${file}`)
    if (size > 200000) {
      console.log(
        `Processing ${file} with a resolution of ${size} bytes and a size of ${
          size / 1024
        }kb.`
      )

      const { height, width } = await getMetadataFromFile(
        `${thumbnailRoot}/${file}`
      )
      if (height > 1000 && width > 1000) {
        await fs.rename(
          `${thumbnailRoot}/${file}.webp`,
          `${thumbnailRoot}/${file}.original.webp`
        )
        await generateThumbnail(
          `${thumbnailRoot}/${file}.original.webp`,
          `${thumbnailRoot}/${file}.webp`
        )
      }
    }
  }
})()
