import ffmpeg from "fluent-ffmpeg"

const targetSize = 500

export default (
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
