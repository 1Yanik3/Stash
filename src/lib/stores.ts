import type { Group, Tag } from "../types"
import { sortingMethods } from "../types"
import type { Writable } from "svelte/store"

import { writable } from "svelte/store"
import { writable as localStorageWritable } from 'svelte-local-storage-store'
import type Controller from "../Controller.svelte"
import type { Clusters, Story, Media, Tags } from "@prisma/client"

export let clusters: Writable<Array<Clusters>> = writable([])
export let cluster: Writable<Clusters> = writable({ id: 0, name: "Loading...", icon: "", type: "" } as any)

export let groups: Writable<Array<Group>> = writable([])
export let group: Writable<Group> = writable({ id: 0, name: "Loading...", children: [], collapsed: false })

export let stories: Writable<Array<Story>> = writable([])
export let story: Writable<Story> = writable({ id: "0", title: "Loading...", content: "", date: new Date(), clusterId: 0, source: "Unknown" })

export let tags: Writable<Array<Tag>> = writable([])

export let media: Writable<Array<Media & { tags: Tags[] }>> = writable([])
export let visibleMedium: Writable<Media & { tags: Tags[] } | null> = writable(null)

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
export let isFullscreen: Writable<boolean> = writable(false)