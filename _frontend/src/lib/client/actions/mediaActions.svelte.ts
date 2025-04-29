import type { Media } from "@prisma/client"

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
