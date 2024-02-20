import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const medias = await prisma.media.findMany({
  where: {
    tags: {
      hasSome: ["favourite"]
    }
  }
})

for (let i = 0; i < medias.length; i++) {
  const media = medias[i]
  await prisma.media.update({
    where: {
      id: media.id
    },
    data: {
      tags: {
        set: media.tags.filter(tag => tag !== "favourite")
      }
    }
  })
}
