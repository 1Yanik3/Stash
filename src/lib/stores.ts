import type { Group, Tag } from "../types"
import { sortingMethods } from "../types"
import type { Writable } from "svelte/store"

import { writable } from "svelte/store"
import { persisted } from 'svelte-local-storage-store'
import type Controller from "../routes/Controller.svelte"
import type { Clusters, Story, Media, Tags } from "@prisma/client"
import QuickActionsCast from "../components/Popups/ActionBars/Cast.svelte"

// TODO: Switch to dynamic type based on endpoint
export type MainDataType = Clusters & { groups: Group[], stories: Story[] }

export let clusterIndex: Writable<number> = writable(1)

export let story: Writable<Story> = writable({ id: "0", title: "", content: "", date: new Date(), clusterId: 0, source: "Unknown" })

export let visibleMedium: Writable<Media & { tags: Tags[] } | null> = writable(null)
export let imageSuffixParameter: Writable<String> = writable("")

export let selectedMediaIds: Writable<String[]> = writable([])
export let selectedTags: Writable<Tag[]> = writable([])

export let traverse = writable(false)
export let activeSortingMethod = writable(sortingMethods[3])
export let mediaTypeFilter: Writable<"video" | "image" | ""> = writable("")


// TODO: Make automatic
// export const serverURL = "http://localhost:5173"
export const serverURL = writable("https://stash.hera.lan")
export let controller: Writable<Controller> = writable()

export let settings = persisted('settings', {
    windowControlsSpacer: false,
    mobileNavigationButtons: false,
})

export let detailsVisible: Writable<boolean> = writable(false)

// TODO: Change to a "mode"
export let isFullscreen: Writable<boolean> = writable(false)
export let isStoryFullScreen: Writable<boolean> = writable(false)

export const actionBars = {
    "Cast": QuickActionsCast
}
export let actionBar: Writable<keyof typeof actionBars | null> = writable(null);