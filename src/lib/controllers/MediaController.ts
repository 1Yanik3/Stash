import { afterNavigate } from "$app/navigation"
import { page } from "$app/stores"
import {
  activeSetMethod,
  activeSortingMethod,
  favouritesOnly,
  mediaTypeFilter,
  media_store,
  pageSize,
  seed,
  selectedTags,
  traverse
} from "$lib/stores"
import { md5 } from "hash-wasm"
import { StoresValues, Writable, get, writable } from "svelte/store"

import { Media } from "@prisma/client"

import { setMethods, sortingMethods } from "../../types"

export default class MediaController {
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

    media_store.subscribe(this.calculatePages)

    afterNavigate(() => {
      this.pages.set([])
    })

    this.alreadyInitialized = true
  }

  public pages: Writable<
    { hash: string; media: StoresValues<typeof media_store> }[]
  > = writable([])

  public updateMedia = async () => {
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

  private calculatePages = async () => {
    // TODO: scroll up when changes occur in pages that are not the last one (aka: when changed and not appended)

    if (!get(media_store).length) {
      this.pages.set([])
      return
    }

    const tmp_pages: StoresValues<typeof this.pages> = []
    let hasChanges = false

    // For each page
    for (
      let i = 0;
      i <
      Math.max(
        Math.ceil(get(media_store).length / pageSize),
        get(this.pages).length
      );
      i++
    ) {
      const page = get(media_store).slice(i * pageSize, (i + 1) * pageSize)
      const hash = await md5(page.map(m => m.id).join())

      // If the page has changed, update it
      if (get(this.pages)[i]?.hash != hash) {
        hasChanges = true
        tmp_pages[i] = { hash, media: page }
      } else tmp_pages[i] = get(this.pages)[i]
    }

    if (hasChanges) {
      this.pages.set([])
      this.pages.set(tmp_pages)
    }
  }
}
