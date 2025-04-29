import query from "$lib/client/call"
import {
    mediaController,
    type MediaType
} from "$lib/controllers/MediaController.svelte"
import { prompts } from "$lib/controllers/PromptController"
import tagsController from "$lib/controllers/TagsController.svelte"

export const removeTagFromMedia = async (
    medias: MediaType[],
    tagId: number | undefined = undefined
) => {
    if (!tagId) {
        const existingTags = [
            ...new Set(
                medias.flatMap(
                    media =>
                        mediaController.media.find(m => m.id == media.id)
                            ?.tags || []
                )
            ).values()
        ].map(t => `${t} - ${tagsController.tagMap[t].tag}`)

        const tagToRemove = await prompts.select(
            "Select a tag to remove from the selected media",
            [...existingTags]
        )

        if (!tagToRemove) return
        const [tagToRemoveId] = tagToRemove.split(" - ")
        if (!tagToRemoveId) return
        tagId = parseInt(tagToRemoveId)
    }

    await query("removeTagsFromMedias", {
        mediaIds: medias.map(m => m.id),
        tagIds: [+tagId]
    })
    for (const media of medias) {
        if (media && media.tags.find(t => t == +tagId)) {
            media.tags = media.tags.filter(t => t != +tagId)
        }
    }
    mediaController.setMedia(mediaController.media)
}
