import prisma from "../prisma"

export const getStoryContent = async (d: { id: string }) => {
  const story = await prisma.story.findUnique({
    where: {
      id: d.id
    }
  })
  if (!story) {
    throw new Error("Failed to find story")
  }
  return story.content
}
