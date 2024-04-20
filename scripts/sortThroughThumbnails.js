import { execSync } from "child_process"
import ffmpeg from "fluent-ffmpeg"
import fs from "fs/promises"

const targetSize = 500

const generateThumbnail = (inputFile, outputFile, outputOptions = []) =>
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
    } catch (error) {
      reject(error)
    }
  })

const getMetadataFromFile = filename => {
  const metadata = JSON.parse(execSync(`exiftool -j ${filename}`).toString())[0]

  return new Chainable(metadata)
    .run(convertTimeStringToSeconds)
    .run(v => convertStringToNumber(v, "ImageHeight", "height"))
    .run(v => convertStringToNumber(v, "ImageWidth", "width")).data
}

const convertTimeStringToSeconds = input => {
  if (!input.Duration) {
    input.duration = null
    return
  }

  const parts = input.Duration.split(":")
  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  const seconds = parseInt(parts[2], 10) || 0

  input.duration = hours * 3600 + minutes * 60 + seconds
}

const convertStringToNumber = (input, sourceKey, targetKey) => {
  const value = input[sourceKey]
  input[targetKey] = parseInt(value, 10)
}

class Chainable {
  data

  constructor(value) {
    this.data = value
  }

  run(func) {
    func(this.data)
    return this
  }
}

const thumbnailRoot = "./thumbnails"

;(async () => {
  // Run a for loop for all items in the thumbnailRoot directory that are over 200kb
  // and run the following code on each of them
  const files = await fs.readdir(thumbnailRoot)
  for (const file of files) {
    if (file.includes(".original")) return
    const { size } = await fs.stat(`${thumbnailRoot}/${file}`)
    try {
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
    } catch (error) {
      console.log("failed to process")
    }
  }
})()
