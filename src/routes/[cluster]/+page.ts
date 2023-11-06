import { get } from 'svelte/store'
import { activeSetMethod, activeSortingMethod, mediaTypeFilter, selectedTags, traverse } from '$lib/stores'
import type { PageLoad } from './$types'
import { setMethods, sortingMethods } from '../../types'
import type { Media } from '@prisma/client'
import { md5 } from 'hash-wasm'

export const load: PageLoad = async ({ params, fetch, depends, data }) => {
    depends("media-and-tags")

    if (params.cluster == "Camp Buddy" && !get(selectedTags).length)
        return {
            media: [],
            mediaHash: "",
            ...data
        }

    const mediaRequest = await fetch(`/api/cluster/${params.cluster}/media
		?traverse=${get(traverse).toString()}
		&tags=${get(selectedTags).join(",")}
		&activeSortingMethod=${params.cluster == "Camp Buddy" ? sortingMethods.findIndex(a => a.icon == "mdiSortAlphabeticalAscending") : sortingMethods.indexOf(get(activeSortingMethod))}
		&activeSetMethod=${setMethods.indexOf(get(activeSetMethod))}
		&mediaTypeFilter=${get(mediaTypeFilter)}
	`)
    const media = await mediaRequest.json() as Media[]


    const tagRequest = await fetch(`/api/cluster/${params.cluster}/tags
		?tags=${get(selectedTags).join(",")}
		&activeSetMethod=${setMethods.indexOf(get(activeSetMethod))}
		&mediaTypeFilter=${get(mediaTypeFilter)}
	`)
    const tags = await tagRequest.json() as { tag: string[], direct_count: number, indirect_count: number }[]

    return {
        media,
        mediaHash: md5(media.map(m => m.id).join()),
        tags,
        ...data
    }
}
