import { execSync } from "child_process"

import prisma from "./server/prisma"

export default async (filename: string, mediaId: string) => {
  console.time("media post request: get metadata")

  const createdDateMatchFromFilename = filename.match(
    /(20\d\d)-?([01]\d)-?([0123]\d)/
  )

  const [{ ImageWidth, ImageHeight, Rotation, CreateDate, FileModifyDate }] =
    JSON.parse(execSync(`exiftool -j ${`./media/${mediaId}`}`).toString())
  const height = [90, 270, -90, -270].includes(Rotation)
    ? ImageWidth
    : ImageHeight
  const width = [90, 270, -90, -270].includes(Rotation)
    ? ImageHeight
    : ImageWidth

  const convertToDate = (input: string) => {
    if (!input) return false
    const date = new Date(
      input.replace(":", "-").replace(":", "-").replace(" ", "T")
    )
    console.log(input, date)
    if (date > new Date(0)) return date
    else return false
  }

  console.log(
    convertToDate(CreateDate) ||
      (createdDateMatchFromFilename
        ? new Date(
            `${createdDateMatchFromFilename[1]}-${createdDateMatchFromFilename[2]}-${createdDateMatchFromFilename[3]}`
          )
        : convertToDate(FileModifyDate) || new Date(0))
  )

  console.timeEnd("media post request: get metadata")
  console.time("media post request: store metadata")
  // get resolution of file
  await prisma.media.update({
    data: {
      width,
      height,
      createdDate:
        convertToDate(CreateDate) ||
        (createdDateMatchFromFilename
          ? new Date(
              `${createdDateMatchFromFilename[1]}-${createdDateMatchFromFilename[2]}-${createdDateMatchFromFilename[3]}`
            )
          : convertToDate(FileModifyDate) || new Date(0))
    },
    where: { id: mediaId }
  })
  console.timeEnd("media post request: store metadata")
}
