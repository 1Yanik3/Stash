import { get } from 'svelte/store'
import { activeSortingMethod, mediaTypeFilter, traverse } from '$lib/stores'
import type { PageLoad } from './$types'
import { sortingMethods, type Tag } from '../../../types'

export const load: PageLoad = async ({ params, fetch }) => {
	const media = await fetch(`/api/group/${params.group}/media
		?traverse=${get(traverse).toString()}
		&activeSortingMethod=${sortingMethods.indexOf(get(activeSortingMethod))}
		&mediaTypeFilter=${get(mediaTypeFilter)}
	`).then(res => res.json())

	const tags = await fetch(`/api/group/${params.group}/tags?traverse=${get(traverse).toString()}`).then(res => res.json()) as Tag[]

	return {
        media,
		tags
	};
}
