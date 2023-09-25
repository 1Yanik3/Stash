import { get } from 'svelte/store'
import { activeSortingMethod, mediaTypeFilter, selectedTags, traverse } from '$lib/stores'
import type { PageLoad } from './$types'
import { sortingMethods } from '../../types'
import type { Media } from '@prisma/client'

export const load: PageLoad = async ({ params, fetch, depends, data }) => {
	depends("media")

	const media = await fetch(`/api/cluster/${params.cluster}/media
		?traverse=${get(traverse).toString()}
		&tags=${get(selectedTags).join(",")}
		&activeSortingMethod=${sortingMethods.indexOf(get(activeSortingMethod))}
		&mediaTypeFilter=${get(mediaTypeFilter)}
	`).then(res => res.json()) as Media[]

	return {
        media,
		...data
	};
}
