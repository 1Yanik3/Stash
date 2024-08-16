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
  selectedTags,
  traverse
} from "$lib/stores"

import { setMethods, sortingMethods } from "../../types"

class MediaController {
  private alreadyInitialized = false
  public init = () => {
    if (this.alreadyInitialized) {
      console.log("MediaController already initialized!")
      return
    }
    selectedTags.subscribe(this.updateMedia)
    traverse.subscribe(this.updateMedia)
    activeSetMethod.subscribe(this.updateMedia)
    favouritesOnly.subscribe(this.updateMedia)
    mediaTypeFilter.subscribe(this.updateMedia)
    activeSortingMethod.subscribe(this.updateMedia)
    seed.subscribe(this.updateMedia)

    this.alreadyInitialized = true
  }

  public media: Media[] = $state([])
  public pages: { hash: string; media: Media[] }[] = $state([])
  public updateMedia = async () => {
    this.setMedia(await this.loadMedia(0))
  }

  private setMedia = async (media: Media[]) => {
    this.media = media
    this.pages = await calculatePages(media)
  }

  private isCurrentlyLoadingNewMedia = false
  private loadMedia = async (offset: number) => {
    if (this.isCurrentlyLoadingNewMedia) return []

    this.isCurrentlyLoadingNewMedia = true
    console.log("Loading new media", { offset })

    const mediaRequest = await fetch(
      `/api/cluster/${get(page).params.cluster}/media?${new URLSearchParams({
        traverse: get(traverse).toString(),
        tags: get(selectedTags).join(","),
        activeSetMethod: setMethods.indexOf(get(activeSetMethod)).toString(),
        mediaTypeFilter: get(mediaTypeFilter),
        favouritesOnly: get(favouritesOnly).toString(),
        activeSortingMethod: (get(page).params.cluster == "Camp Buddy"
          ? sortingMethods.findIndex(
              a => a.icon == "mdiSortAlphabeticalAscending"
            )
          : sortingMethods.indexOf(get(activeSortingMethod))
        ).toString(),
        offset: offset.toString(),
        seed: get(seed).toString()
      }).toString()}`
    )

    const data = (await mediaRequest.json()) as Media[]
    this.isCurrentlyLoadingNewMedia = false
    return data
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
