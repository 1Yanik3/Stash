import { persisted } from "svelte-local-storage-store"
import type { Writable } from "svelte/store"
import { writable } from "svelte/store"

import type { Media, Story } from "@prisma/client"

import QuickActionsCast from "../components/Popups/ActionBars/Cast.svelte"
import AutoScroll from "../components/Popups/ActionBars/AutoScroll.svelte"
import type Controller from "../routes/Controller.svelte"
import { setMethods, sortingMethods } from "../types"

export let clusterIndex: Writable<number> = writable(1)

export let favouritesOnly: Writable<boolean> = writable(false)
export let visibleMedium: Writable<Media | null> = writable(null)
export let imageSuffixParameter: Writable<String> = writable("")

export let selectedMediaIds: Writable<String[]> = writable([])
export let selectedTags: Writable<String[]> = writable([])

export let traverse = writable(false)
export let activeSortingMethod = writable(sortingMethods[3])
export let activeSetMethod = writable(setMethods[0])
export let mediaTypeFilter: Writable<"video" | "image" | ""> = writable("")
export let viewMode: Writable<"normal" | "table"> = writable("normal")

export let uploadPopupOpen = writable(false)

export let controller: Writable<Controller> = writable()

export let settings = persisted("settings", {
  windowControlsSpacer: false,
  touchNavigationButtons: false,
  mobileLayout: false
})

export let mobileBottomBarVisible: Writable<boolean> = writable(true)
export let storyTab: Writable<string | null> = writable(null)

// TODO: Change to a "mode"
export let isFullscreen: Writable<boolean> = writable(false)

export const actionBars = {
  Cast: QuickActionsCast,
  AutoScroll: AutoScroll
}
export let actionBar: Writable<keyof typeof actionBars | null> = writable(null)
