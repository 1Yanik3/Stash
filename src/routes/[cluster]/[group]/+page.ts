import { get } from 'svelte/store'
import { activeSortingMethod, mediaTypeFilter, traverse } from '$lib/stores'
import type { PageLoad } from './$types'
import { sortingMethods, type Tag } from '../../../types'
import type { Media, Tags } from '@prisma/client'

export const load: PageLoad = async ({ params, fetch, depends, data }) => {
	depends("media-and-tags")

	const media = await fetch(`/api/group/${params.group}/media
		?traverse=${get(traverse).toString()}
		&activeSortingMethod=${sortingMethods.indexOf(get(activeSortingMethod))}
		&mediaTypeFilter=${get(mediaTypeFilter)}
	`).then(res => res.json()) as (Media & { tags: Tags[] })[]

	const tags = await fetch(`/api/group/${params.group}/tags?traverse=${get(traverse).toString()}`).then(res => res.json()) as Tag[]

	return {
        media,
		tags,
		...data
	};
}
