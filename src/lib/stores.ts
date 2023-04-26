import type { Group, Tag } from "../types"
import { sortingMethods } from "../types"
import { get, type Writable } from "svelte/store"

import { writable } from "svelte/store"
import { writable as localStorageWritable } from 'svelte-local-storage-store'
import type Controller from "../Controller.svelte"
import type { Clusters, Story, Media, Tags } from "@prisma/client"

// TODO: Switch to dynamic type based on endpoint
export type MainDataType = Clusters & { groups: Group[], stories: Story[] }
export let data: Writable<MainDataType[]> = writable([])

export let clusterIndex: Writable<number> = writable(1)
export const getCluster = (_: any) => {
    return get(data).find(c => c.id == get(clusterIndex)) as MainDataType
}

export let story: Writable<Story> = writable({ id: "0", title: "", content: "", date: new Date(), clusterId: 0, source: "Unknown" })

export let tags: Writable<Array<Tag>> = writable([])

export let visibleMedium: Writable<Media & { tags: Tags[] } | null> = writable(null)
export let imageSuffixParameter: Writable<String> = writable("")

export let traverse = writable(false)
export let activeSortingMethod = writable(sortingMethods[3])
export let mediaTypeFilter: Writable<"video" | "image" | ""> = writable("")


// TODO: Make automatic
// export const serverURL = "http://localhost:5173"
export const serverURL = "https://stash.hera.lan"
export let controller: Writable<Controller> = writable()

export let settings = localStorageWritable('settings', {
    windowControlsSpacer: false,
    mobileNavigationButtons: false,
})

export let detailsVisible: Writable<boolean> = writable(false)

// TODO: Change to a "mode"
export let isFullscreen: Writable<boolean> = writable(false)
export let isStoryFullScreen: Writable<boolean> = writable(false)