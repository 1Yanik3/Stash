import { Job } from "@prisma/client";
import generateThumbnailFromFile from "../../lib/generateThumbnailFromFile";
import getMetadataFromFile from "../../lib/getMetadataFromFile";
import prisma from "../../prisma";

const mediaRoot = "./media";
const thumbnailRoot = "./thumbnails";

export const execute = async (job: Job) => {
  const { id } = await parse(job.data, job);

  const cluster = await prisma.clusters.findFirstOrThrow({
    where: {
      Media: {
        some: {
          id,
        },
      },
    },
  });

  // TODO: Store in database
  const { duration } = await getMetadataFromFile(`${mediaRoot}/${id}`);

  let defaultDuration = 7;
  // TODO: make dynamic
  if (cluster.name == "Studios") defaultDuration = 30;

  const outputOptions = duration
    ? [
        `-ss ${
          duration > defaultDuration
            ? defaultDuration
            : (duration / 2).toFixed(1)
        }`,
      ]
    : [];

  await generateThumbnailFromFile(
    `${mediaRoot}/${id}`,
    `${thumbnailRoot}/${id}.webp`,
    outputOptions
  );
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

  if (!(await prisma.media.findFirst({ where: { id: json.id } }))) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", debugMessages: ["No media with given id"] },
    });
    throw new Error();
  }

  return json;
};
