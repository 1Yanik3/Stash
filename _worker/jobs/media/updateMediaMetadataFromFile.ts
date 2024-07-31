import { Job } from "@prisma/client";
import prisma from "../../prisma";
import getMetadataFromFile from "../../lib/getMetadataFromFile";
import type { MetadataType } from "../../lib/getMetadataFromFile.types";

export const execute = async (job: Job) => {
  const { id } = await parse(job.data, job);
  console.log(`Running job: updateMediaMetadataFromFile for media ${id}`, job.data);

  const metadata = await getMetadataFromFile(`./media/${id}`);

  await prisma.media.update({
    where: { id: id },
    data: {
      width: metadata.width,
      height: metadata.height,
      createdDate: await getCreatedDate(id, metadata),
    },
  });
};

const parse = async (data: any, job: Job): Promise<{ id: string }> => {
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

const getCreatedDate = async (id: string, metadata: MetadataType) => {
  const convertToDate = (input: string): Date | false => {
    if (!input) return false;
    const date = new Date(input.replace(/:/g, "-").replace(" ", "T"));
    return date > new Date(0) ? date : false;
  };

  const { name } = await prisma.media.findUniqueOrThrow({ where: { id } });

  const createdDateMatchFromFilename = name.match(
    /(20\d\d)-?([01]\d)-?([0123]\d)/
  );

  return (
    convertToDate(metadata.CreateDate) ||
    (createdDateMatchFromFilename
      ? new Date(
          `${createdDateMatchFromFilename[1]}-${createdDateMatchFromFilename[2]}-${createdDateMatchFromFilename[3]}`
        )
      : convertToDate(metadata.FileModifyDate) || new Date(0))
  );
};
