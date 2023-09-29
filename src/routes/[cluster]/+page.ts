import { get } from 'svelte/store'
import { activeSortingMethod, mediaTypeFilter, selectedTags, traverse } from '$lib/stores'
import type { PageLoad } from './$types'
import { sortingMethods } from '../../types'
import type { Media } from '@prisma/client'
import { md5 } from 'hash-wasm'

export const load: PageLoad = async ({ params, fetch, depends, data }) => {
	depends("media")

	const mediaRequest = await fetch(`/api/cluster/${params.cluster}/media
		?traverse=${get(traverse).toString()}
		&tags=${get(selectedTags).join(",")}
		&activeSortingMethod=${sortingMethods.indexOf(get(activeSortingMethod))}
		&mediaTypeFilter=${get(mediaTypeFilter)}
	`)

	const mediaRequestTest = await mediaRequest.text()

	const media = await JSON.parse(mediaRequestTest) as Media[]

	return {
        media,
		mediaHash: md5(mediaRequestTest),
		...data
	};
}
