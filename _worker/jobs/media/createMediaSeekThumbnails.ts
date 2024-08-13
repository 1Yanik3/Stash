import { Job } from "@prisma/client";
import generateThumbnailFromFile from "../../lib/generateThumbnailFromFile";
import getMetadataFromFile from "../../lib/getMetadataFromFile";
import prisma from "../../prisma";

const mediaRoot = "./media";
const thumbnailRoot = "./thumbnails";

export const execute = async (job: Job) => {
  const { id } = await parse(job.data, job);

  const { duration } = await getMetadataFromFile(`${mediaRoot}/${id}`);

  if (!duration) {
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        debugMessages: ["Could not get duration of video"],
      },
    });
    throw new Error();
  }

  for (let position = 0; position < duration; position += 10) {
    await generateThumbnailFromFile(
      `${mediaRoot}/${id}`,
      `${thumbnailRoot}/${id}_seek_${Math.floor(position / 10)}.webp`,
      [`-ss ${position}`],
      250
    );
    await prisma.job.update({
      where: { id: job.id },
      data: {
        completionPercentage: Math.round((position / duration) * 100),
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
