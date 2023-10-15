import { get } from 'svelte/store'
import { activeSortingMethod, mediaTypeFilter, selectedTags, traverse } from '$lib/stores'
import type { PageLoad } from './$types'
import { sortingMethods } from '../../types'
import type { Media } from '@prisma/client'
import { md5 } from 'hash-wasm'

export const load: PageLoad = async ({ params, fetch, depends, data }) => {
	depends("media")

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
		&mediaTypeFilter=${get(mediaTypeFilter)}
	`)

	const mediaRequestTest = await mediaRequest.text()

	const media = await JSON.parse(mediaRequestTest) as Media[]

	return {
        media,
		mediaHash: md5(mediaRequestTest), // TODO: This changes more often than it should, why
		...data
	};
}
