import prisma from "./prisma";

const id = 281;

const media = await prisma.media.findMany({
  where: {
    tags: {
      some: {
        id,
      },
    },
  },
});

for (const medium of media) {
  await prisma.media.update({
    where: {
      id: medium.id,
    },
    data: {
      specialFilterAttribute: "group",
      tags: {
        disconnect: {
          id,
        },
      },
    },
  });
}

await prisma.tags.delete({
  where: {
    id,
    media: {
      every: {
        id: "loool",
      },
    },
  },
});
