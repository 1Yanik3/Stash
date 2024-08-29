import type { Media } from "@prisma/client/wasm"
import { md5 } from "hash-wasm"
import { get } from "svelte/store"

import { page } from "$app/stores"
import query from "$lib/client/call"
import {
  activeSetMethod,
  mediaTypeFilter,
  pageSize,
  traverse
} from "$lib/stores"

import { sortingMethods } from "../../types"
import { tagsController } from "./TagsController.svelte"

export type MediaType = Media & { tags: number[] }

class MediaController {
  private alreadyInitialized = false
  public init = () => {
    if (this.alreadyInitialized) {
      console.log("MediaController already initialized!")
      return
    }

    $effect((_ = [tagsController.selectedTags, this.filters]) => {
      console.group("%cUpdating via effect", "color: grey; font-weight: normal")
      this.updateMedia()
      console.groupEnd()
    })

    traverse.subscribe(() => this.updateMedia)
    activeSetMethod.subscribe(() => this.updateMedia)
    mediaTypeFilter.subscribe(() => this.updateMedia)

    this.alreadyInitialized = true
  }

  public visibleMedium: MediaType | null = $state(null)
  public media: MediaType[] = $state([])
  public pages: { hash: string; media: Media[] }[] = $state([])

  public filters = $state({
    specialFilterAttribute: null as string | null,
    favouritesOnly: false,
    countOfTags: -1
  })

  public activeSortingMethod = $state(3)
  public seed = $state(Math.random())

  public updateMedia = async (newCluster: string | undefined = undefined) => {
    console.debug(
      `%cUpdating media with new cluster: ${newCluster}`,
      "color: grey"
    )
    this.setMedia([])
    this.setMedia(await this.loadMedia(0, newCluster))
  }

  private setMedia = async (media: typeof this.media) => {
    this.media = media
    this.pages = await calculatePages(media)
  }

  private isCurrentlyLoadingNewMedia = false
  private loadMedia = async (
    offset: number,
    cluster = get(page).params.cluster
  ) => {
    if (this.isCurrentlyLoadingNewMedia) return []
    this.isCurrentlyLoadingNewMedia = true

    const data = await query("getMedia", {
      cluster,
      tags: tagsController.selectedTags.map(t => t.id),
      offset,
      seed: this.seed,
      activeSortingMethod: this.activeSortingMethod,
      ...this.filters
    })

    console.log({ data })

    const processedData = data.map(m => ({
      ...m,
      tags: m.tags?.split(",").map(t => +t) || []
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
