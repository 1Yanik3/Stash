import type { Media } from "@prisma/client/wasm"
import { md5 } from "hash-wasm"
import { get } from "svelte/store"

import { page } from "$app/stores"
import {
  activeSetMethod,
  activeSortingMethod,
  favouritesOnly,
  mediaTypeFilter,
  pageSize,
  seed,
  traverse
} from "$lib/stores"

import type { MediaGetRequestBodyData } from "../../routes/api/cluster/[cluster]/media/get/+server"
import { setMethods, sortingMethods } from "../../types"
import { tagsController, type TagExtended } from "./TagsController.svelte"

export type MediaType = Media & { tags: number[] }

class MediaController {
  private alreadyInitialized = false
  public init = () => {
    if (this.alreadyInitialized) {
      console.log("MediaController already initialized!")
      return
    }

    $effect(
      (
        _ = [tagsController.selectedTags, this.filter_specialFilterAttribute]
      ) => {
        this.updateMedia()
      }
    )

    traverse.subscribe(this.updateMedia)
    activeSetMethod.subscribe(this.updateMedia)
    favouritesOnly.subscribe(this.updateMedia)
    mediaTypeFilter.subscribe(this.updateMedia)
    activeSortingMethod.subscribe(this.updateMedia)
    seed.subscribe(this.updateMedia)

    this.alreadyInitialized = true
  }

  public visibleMedium: MediaType | null = $state(null)
  public media: MediaType[] = $state([])
  public pages: { hash: string; media: Media[] }[] = $state([])

  public filter_specialFilterAttribute: string | null = $state(null)

  public updateMedia = async () => {
    this.setMedia(await this.loadMedia(0))
  }

  private setMedia = async (media: typeof this.media) => {
    this.media = media
    this.pages = await calculatePages(media)
  }

  private isCurrentlyLoadingNewMedia = false
  private loadMedia = async (offset: number) => {
    if (this.isCurrentlyLoadingNewMedia) return []
    this.isCurrentlyLoadingNewMedia = true

    // ?${new URLSearchParams({
    //     traverse: get(traverse).toString(),
    //     tags: tagsController.selectedTags.map(t => t.id).join(","),
    //     activeSetMethod: setMethods.indexOf(get(activeSetMethod)).toString(),
    //     mediaTypeFilter: get(mediaTypeFilter),
    //     favouritesOnly: get(favouritesOnly).toString(),
    //     activeSortingMethod: (get(page).params.cluster == "Camp Buddy"
    //       ? sortingMethods.findIndex(
    //           a => a.icon == "mdiSortAlphabeticalAscending"
    //         )
    //       : sortingMethods.indexOf(get(activeSortingMethod))
    //     ).toString(),
    //     offset: offset.toString(),
    //     seed: get(seed).toString()
    //   }

    const mediaRequest = await fetch(
      `/api/cluster/${get(page).params.cluster}/media/get`,
      {
        method: "POST",
        body: JSON.stringify({
          tags: tagsController.selectedTags.map(t => t.id),
          offset,
          favouritesOnly: get(favouritesOnly),
          specialFilterAttribute: this.filter_specialFilterAttribute,
          seed: get(seed),
          activeSortingMethod:
            get(page).params.cluster == "Camp Buddy"
              ? sortingMethods.findIndex(
                  a => a.icon == "mdiSortAlphabeticalAscending"
                )
              : sortingMethods.indexOf(get(activeSortingMethod))
        } satisfies MediaGetRequestBodyData)
      }
    )

    const data = (await mediaRequest.json()) as (Media & { tags: string })[]
    const processedData = data.map(m => ({
      ...m,
      tags: m.tags.split(",").map(t => +t)
    })) satisfies MediaType[]
    this.isCurrentlyLoadingNewMedia = false
    return processedData
  }

  public async loadMoreMedia() {
    if (this.isCurrentlyLoadingNewMedia) this.isCurrentlyLoadingNewMedia = true

    this.setMedia(this.media.concat(await this.loadMedia(this.media.length)))

    this.isCurrentlyLoadingNewMedia = false
  }
}

const _mediaController = new MediaController()
export const mediaController = _mediaController

const calculatePages = async (media: Media[]) => {
  // TODO: scroll up when changes occur in pages that are not the last one (aka: when changed and not appended)

  if (!media.length) {
    return []
  }
  const pages: { hash: string; media: Media[] }[] = []

  // For each page
  for (
    let i = 0;
    i <
    Math.max(Math.ceil(media.length / pageSize), _mediaController.pages.length);
    i++
  ) {
    const page = media.slice(i * pageSize, (i + 1) * pageSize)
    if (!page.length) break

    const hash = await md5(page.map(m => m.id).join())

    // If the page has changed, update it
    if (_mediaController.pages[i]?.hash != hash) {
      pages[i] = { hash, media: page }
    } else pages[i] = _mediaController.pages[i]
  }

  return pages
}
