import {
  activeSetMethod,
  activeSortingMethod,
  mediaTypeFilter,
  selectedTags,
  traverse
} from "$lib/stores"
import { get } from "svelte/store"

import type { Media } from "@prisma/client"

import { setMethods, sortingMethods } from "../../types"
import type { PageLoad } from "./$types"

const loadMedia = (fetch: Function, cluster: string): Promise<Media[]> =>
  new Promise(async resolve => {
    const mediaRequest = await fetch(
      `/api/cluster/${cluster}/media
        ?traverse=${get(traverse).toString()}
        &tags=${get(selectedTags).join(",")}
        &activeSortingMethod=${
          cluster == "Camp Buddy"
            ? sortingMethods.findIndex(
                a => a.icon == "mdiSortAlphabeticalAscending"
              )
            : sortingMethods.indexOf(get(activeSortingMethod))
        }
        &activeSetMethod=${setMethods.indexOf(get(activeSetMethod))}
        &mediaTypeFilter=${get(mediaTypeFilter)}
    `.replace(/ /g, "")
    )
    resolve(await mediaRequest.json())
  })

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
      `/api/cluster/${cluster}/tags
        ?tags=${get(selectedTags).join(",")}
        &activeSetMethod=${setMethods.indexOf(get(activeSetMethod))}
        &mediaTypeFilter=${get(mediaTypeFilter)}
    `.replace(/ /g, "")
    )

    resolve(await tagRequest.json())
  })

export const load: PageLoad = async ({ params, fetch, depends, data }) => {
  depends("media-and-tags")

  let media = loadMedia(fetch, params.cluster)
  let tags = loadTags(fetch, params.cluster)

  // TODO: Make more elegant
  if (params.cluster == "Camp Buddy" && !get(selectedTags).length)
    return {
      ...data,
      streamed_page: {
        tags,
        media
      }
    }

  return {
    ...data,
    streamed_page: {
      tags,
      media
    }
  }
}
