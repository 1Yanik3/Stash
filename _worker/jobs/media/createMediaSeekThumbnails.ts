import { Job } from "@prisma/client";
import generateThumbnailFromFile from "../../lib/generateThumbnailFromFile";
import getMetadataFromFile from "../../lib/getMetadataFromFile";
import prisma from "../../prisma";

const mediaRoot = "./media";
const thumbnailRoot = "./thumbnails";
import ffmpeg from "fluent-ffmpeg";

export const execute = async (job: Job) => {
  const { id } = await parse(job.data, job);

  try {
    ffmpeg()
      .input(`${mediaRoot}/${id}`)
      .complexFilter([
        `scale=w=${250}:h=${250}:force_original_aspect_ratio=decrease`,
      ])
      .output(`${thumbnailRoot}/${id}_seek.webm`)
      .on("error", async (error) => {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            status: "failed",
            debugMessages: ["Could not generate thumbnail 2", error.message],
          },
        });
      })
      .outputOptions(["-vf", "fps=1/10"])
      .run();
  } catch (error: any) {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        debugMessages: ["Could not generate thumbnail", error.message],
      },
    });
  }
};

const parse = async (
  data: any,
  job: Job
): Promise<{
  id: string;
}> => {
  const json = JSON.parse(data);

  if (!json.id) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["Invalid job data"] },
    });
    throw new Error();
  }

  const media = await prisma.media.findFirst({ where: { id: json.id } });

  if (!media) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["No media with given id"] },
    });
    throw new Error();
  }

  if (!media.type.startsWith("video")) {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        debugMessages: ["Can only process videos but got " + media.type],
      },
    });
    throw new Error();
  }

  return json;
};
