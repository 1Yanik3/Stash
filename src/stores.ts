import type { Cluster, Group, Tag, Medium } from "./types"
import { sortingMethods } from "./types"
import type { Writable } from "svelte/store"

import { writable } from "svelte/store"

export let clusters: Writable<Array<Cluster>> = writable([])
export let cluster: Writable<Cluster> = writable({ id: 0, name: "Loading..." })

export let groups: Writable<Array<Group>> = writable([])
export let group: Writable<Group> = writable({ id: 0, name: "Loading...", children: [], collapsed: false })

export let tags: Writable<Array<Tag>> = writable([])

export let visibleMedium: Writable<Medium | null> = writable(null)

export let traverse = writable(false)

export let activeSortingMethod = writable(sortingMethods[3])

export let mediaTypeFilter: Writable<"video" | "image" | ""> = writable("")

// TODO: Make automatic
// export const serverURL = "http://localhost"
export const serverURL = "https://stash.hera.lan"