import { mediaController } from "$lib/controllers/MediaController.svelte"
import { prompts } from "$lib/controllers/PromptController"
import varsSvelte from "$lib/vars.svelte"

import query from "../client/call"

export const addTagToMedia = async (mediaId: string) => {
  const tagToAdd = await prompts.tag(
    "Select a tag to add to the selected media"
  )
  if (tagToAdd?.id) {
    // Change server side
    await query("_server_bulkAddTagToMedia", {
      mediaIds: varsSvelte.selectedMedias.map(m => m.id),
      tagIds: [tagToAdd.id]
    })

    // Change client side
    for (const media of varsSvelte.selectedMedias) {
        media.tags = [...media.tags, tagToAdd.id]
    }
    mediaController.setMedia(mediaController.media)
  }
}

export const _server_bulkAddTagToMedia = async (d: {
  mediaIds: string[]
  tagIds: number[]
}) => {
    const {default: prisma} = await import("$lib/server/prisma")
  for (const tagId of d.tagIds) {
    for (const mediaId of d.mediaIds) {
      await prisma.media.update({
        where: {
          id: mediaId
        },
        data: {
          tags: {
            connect: {
              id: tagId
            }
          }
        }
      })
    }
  }
}
