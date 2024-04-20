import { page } from "$app/stores"
import {
  activeSetMethod,
  activeSortingMethod,
  favouritesOnly,
  mediaTypeFilter,
  media_store,
  seed,
  selectedTags,
  settings,
  traverse
} from "$lib/stores"
import { get } from "svelte/store"

import { Media } from "@prisma/client"

import { setMethods, sortingMethods } from "../../types"

export default class MediaController {
  private alreadyInitialized = false
  public init = () => {
    if (this.alreadyInitialized) {
      console.log("MediaController already initialized!")
    }
    traverse.subscribe(() => {
      this.resetMedia()
    })
    selectedTags.subscribe(() => {
      this.resetMedia()
    })
    activeSetMethod.subscribe(() => {
      this.resetMedia()
    })
    favouritesOnly.subscribe(() => {
      this.resetMedia()
    })
    mediaTypeFilter.subscribe(() => {
      this.resetMedia()
    })
    activeSortingMethod.subscribe(() => {
      this.resetMedia()
    })
    seed.subscribe(() => {
      this.resetMedia()
    })
    this.alreadyInitialized = true
  }

  private resetMedia = async () => {
    media_store.set([])
    media_store.set(await this.loadMedia(0))
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

    media_store.set([
      ...get(media_store),
      ...(await this.loadMedia(get(media_store).length))
    ])

    this.isCurrentlyLoadingNewMedia = false
  }
}
