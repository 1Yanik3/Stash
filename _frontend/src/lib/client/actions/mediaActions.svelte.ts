import type { Media } from "@prisma/client"

import { mediaController } from "$lib/controllers/MediaController.svelte"

export const removeTagFromMedia = (tagId: number) => {
  fetch(`/api/media/${mediaController.visibleMedium?.id}/tag/${tagId}`, {
    method: "DELETE"
  })
    .then(() => {
      if (!mediaController.visibleMedium) return
      mediaController.visibleMedium.tags =
        mediaController.visibleMedium.tags.filter(t => t != tagId)
    })
    .catch(console.error)
}

export const setSpecialFilterAttribute = (medium: Media, newValue: string) => {
  const oldValue = medium.specialFilterAttribute
  medium.specialFilterAttribute = newValue
  fetch(`/api/media/${medium?.id}/specialFilterAttribute`, {
    method: "PUT",
    body: JSON.stringify({
      specialFilterAttribute: newValue
    })
  }).catch(err => {
    console.error(err)
    medium.specialFilterAttribute = oldValue
  })
}
