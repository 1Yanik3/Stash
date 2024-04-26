import ffmpeg from "fluent-ffmpeg"

const targetSize = 500

export default (
  inputFile: string,
  outputFile: string,
  outputOptions: any[] = []
) =>
  new Promise((resolve, reject) => {
    console.log("Generating thumbnail with output options:", outputOptions.concat("-vframes 1"))
    try {
      ffmpeg()
        .input(inputFile)
        .complexFilter([
          `scale=w=${targetSize}:h=${targetSize}:force_original_aspect_ratio=decrease`
        ])
        .output(outputFile)
        .on("end", resolve)
        .outputOptions(outputOptions.concat("-vframes 1"))
        .run()
    } catch (error: any) {
      reject(error)
    }
  })
