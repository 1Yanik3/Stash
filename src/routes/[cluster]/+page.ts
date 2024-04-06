import {
  activeSetMethod,
  favouritesOnly,
  mediaTypeFilter,
  selectedTags
} from "$lib/stores"
import { get } from "svelte/store"

import { setMethods } from "../../types"
import type { PageLoad } from "./$types"

const loadTags = (
  fetch: Function,
  cluster: string
): Promise<
  {
    tag: string[]
    direct_count: number
    indirect_count: number
    tag_exists_in_collapsed_tags: boolean
  }[]
> =>
  new Promise(async resolve => {
    const tagRequest = await fetch(
      `/api/cluster/${cluster}/tags?${new URLSearchParams({
        tags: get(selectedTags).join(","),
        activeSetMethod: setMethods.indexOf(get(activeSetMethod)).toString(),
        mediaTypeFilter: get(mediaTypeFilter),
        favouritesOnly: get(favouritesOnly).toString()
      }).toString()}`
    )

    resolve(await tagRequest.json())
  })

export const load: PageLoad = async ({ params, fetch, depends, data }) => {
  depends("media-and-tags")

  let tags = loadTags(fetch, params.cluster)

  // TODO: Make more elegant
  if (params.cluster == "Camp Buddy" && !get(selectedTags).length)
    return {
      ...data,
      streamed_page: {
        tags
      }
    }

  return {
    ...data,
    streamed_page: {
      tags
    }
  }
}
