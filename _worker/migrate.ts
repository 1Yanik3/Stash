import prisma from "./prisma";

const assignments = await prisma.tagIcons.findMany();

for (const assignment of assignments) {
  const tag = await prisma.tags.findFirst({
    where: {
      tag: assignment.tag,
      parentId: null,
    },
  });

  if (tag) {
    await prisma.tags.update({
      where: {
        id: tag.id,
      },
      data: {
        icon: assignment.icon,
      },
    });
  }
}
