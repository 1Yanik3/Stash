import { persisted } from "svelte-local-storage-store"
import { writable, type Writable } from "svelte/store"

import QuickActionsCast from "$components/Popups/ActionBars/Cast.svelte"

export let controller: Writable<Controller> = writable()

// Constants
export const PAGE_SIZE = 50

// Page Data
export let collapsedTags: Writable<string[]> = writable([])

// Navigation and Layout
export let mobileBottomBarVisible: Writable<boolean> = writable(true)
export const actionBars = {
  Cast: QuickActionsCast
}
export let actionBar: Writable<keyof typeof actionBars | null> = writable(null)
export let windowControlsSpacerVisible = writable(false)

export let uploadPopupOpen = writable(false)

// TODO: Make this work again
export let thumbnailSuffixParameter: Writable<{
  mediaId: string
  suffix: string
} | null> = writable(null)
export let imageSuffixParameter: Writable<String> = writable("")

// Selections
export let selectedMediaIds: Writable<string[]> = writable([])

// Media Filters
export let mediaTypeFilter: Writable<"video" | "image" | ""> = writable("")
export let traverse = writable(false)

// Elements
export let videoElement: Writable<HTMLVideoElement | null> = writable(null)

export let settings = persisted("settings", {
  mediaTouchAction: "zoom" as "zoom" | "navigate" | "seek",
  mobileLayout: false,
  tooltipEnabled: true,
  theme: "default" as "default" | "light" | "amoled"
})

// TODO: Change to a "mode"
export let isFullscreen: Writable<boolean> = writable(false)
