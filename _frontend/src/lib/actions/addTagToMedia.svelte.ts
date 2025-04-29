import {
  mediaController,
  type MediaType
} from "$lib/controllers/MediaController.svelte"
import { prompts } from "$lib/controllers/PromptController"

import query from "../client/call"

export const addTagToMedia = async (
  medias: MediaType[],
  tagId: number | undefined = undefined
) => {
  if (!tagId) {
    const tagToAdd = await prompts.tag(
      "Select a tag to add to the selected media"
    )
    if (!tagToAdd) return
    tagId = tagToAdd.id
  }
  if (tagId) {
    // Change server side
    await query("_server_bulkAddTagToMedia", {
      mediaIds: medias.map(m => m.id),
      tagIds: [tagId]
    })

    // Change client side
    for (const media of medias) {
      media.tags = [...media.tags, tagId]
    }
    mediaController.setMedia(mediaController.media)
  }
}

export const _server_bulkAddTagToMedia = async (d: {
  mediaIds: string[]
  tagIds: number[]
}) => {
  const { default: prisma } = await import("$lib/server/prisma")
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
