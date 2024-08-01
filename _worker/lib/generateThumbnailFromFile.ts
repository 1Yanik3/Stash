import ffmpeg from "fluent-ffmpeg";

const targetSize = 500;

export default (
  inputFile: string,
  outputFile: string,
  outputOptions: any[] = []
) =>
  new Promise((resolve, reject) => {
    try {
      ffmpeg()
        .input(inputFile)
        .complexFilter([
          `scale=w=${targetSize}:h=${targetSize}:force_original_aspect_ratio=decrease`,
        ])
        .output(outputFile)
        .on("end", resolve)
        .on("error", reject)
        .outputOptions(outputOptions.concat("-vframes 1"))
        .run();
    } catch (error: any) {
      reject(error);
    }
  });
