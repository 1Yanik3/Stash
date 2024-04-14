import AutoScroll from "$components/Popups/ActionBars/AutoScroll.svelte"
import QuickActionsCast from "$components/Popups/ActionBars/Cast.svelte"
import { persisted } from "svelte-local-storage-store"
import type { Writable } from "svelte/store"
import { writable } from "svelte/store"

import type { Media } from "@prisma/client"

import type Controller from "../routes/Controller.svelte"
import { setMethods, sortingMethods } from "../types"

// Core Parts
export let controller: Writable<Controller> = writable()
export let media_store: Writable<Media[]> = writable([])

// Constants
export const pageSize = 50

// Navigation and Layout
export let clusterIndex: Writable<number> = writable(1)
export let mobileBottomBarVisible: Writable<boolean> = writable(true)
export const actionBars = {
  Cast: QuickActionsCast,
  AutoScroll: AutoScroll
}
export let actionBar: Writable<keyof typeof actionBars | null> = writable(null)

export let uploadPopupOpen = writable(false)

// TODO: Make this work again
export let thumbnailSuffixParameter: Writable<{
  mediaId: string
  suffix: string
} | null> = writable(null)
export let imageSuffixParameter: Writable<String> = writable("")

// Selections
export let visibleMedium: Writable<Media | null> = writable(null)
export let selectedMediaIds: Writable<String[]> = writable([])
export let selectedTags: Writable<String[]> = writable([])

// Media Filters
export let activeSetMethod = writable(setMethods[0])
export let activeSortingMethod = writable(sortingMethods[3])
export let favouritesOnly: Writable<boolean> = writable(false)
export let mediaTypeFilter: Writable<"video" | "image" | ""> = writable("")
export let seed = writable(Math.random())
export let traverse = writable(false)
export let viewMode: Writable<"normal" | "table"> = writable("normal")

// Elements
export let videoElement: Writable<HTMLVideoElement | null> = writable(null)

export let settings = persisted("settings", {
  windowControlsSpacer: false,
  touchNavigationButtons: false,
  mobileLayout: false
})

// TODO: Change to a "mode"
export let isFullscreen: Writable<boolean> = writable(false)
