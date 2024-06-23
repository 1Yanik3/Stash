<script lang="ts">
  import { afterNavigate, beforeNavigate, goto } from "$app/navigation"
  import { page } from "$app/stores"
  import {
    actionBar,
    actionBars,
    imageSuffixParameter,
    media_store,
    selectedMediaIds,
    selectedTags,
    settings,
    thumbnailSuffixParameter,
    visibleMedium
  } from "$lib/stores"
  import { onMount } from "svelte"
  import CreateStoryPopup from "$components/Popups/CreateStoryPopup.svelte"
  import MediaViewerMobile from "$components/Popups/Mobile/MediaViewerMobile.svelte"
  import NavigationSectionMobile from "$components/Popups/Mobile/NavigationSectionMobile.svelte"
  import QuickActions from "$components/Popups/QuickSwitcher/QuickActions.svelte"
  import QuickActionsImport from "$components/Popups/QuickSwitcher/QuickActions_Import.svelte"
  import QuickSwitch from "$components/Popups/QuickSwitcher/QuickSwitch.svelte"
  import SettingsPopup from "$components/Popups/SettingsPopup/index.svelte"
  import ShortcutPopup from "$components/Popups/ShortcutPopup.svelte"
  import Shortcut from "$reusables/Shortcut.svelte"
  import type { PageData } from "./[cluster]/$types"
  import MediaDetailsPopup from "$components/Popups/MediaDetailsPopup.svelte"
  import QuickActionsImportFromUrl from "$components/Popups/QuickSwitcher/QuickActions_ImportFromUrl.svelte"
  import QuickActionsImportFromSearch from "$components/Popups/QuickSwitcher/QuickActions_ImportFromSearch.svelte"
  import QuickActionsImportFromReddit from "$components/Popups/QuickSwitcher/QuickActions_ImportFromReddit.svelte"
  import PromptController from "$components/Popups/Prompts/_PromptController.svelte"
  import MediaController from "$lib/controllers/MediaController"
  import CollapsedTagsController from "$lib/controllers/CollapsedTagsController"
  import TagsController from "$lib/controllers/TagsController"

  $: pageData = $page.data as PageData

  export const mediaController = new MediaController()
  export const tagsController = new TagsController()
  export const collapsedTagsController = new CollapsedTagsController()

  onMount(() => {
    mediaController.init()
    tagsController.init()
    collapsedTagsController.init()
  })

  beforeNavigate(() => {
    thumbnailSuffixParameter.set(null)
  })

  afterNavigate(() => {
    selectedMediaIds.set([])
    selectedTags.set([])
    visibleMedium.set(null)
  })

  visibleMedium.subscribe(() => {
    imageSuffixParameter.set("")
  })

  onMount(() => {
    visibleMedium.subscribe(() => {
      if ($settings.mobileLayout) {
        setPopup($visibleMedium ? "Media Viewer Mobile" : null)
      }
    })
  })

  export let promptController: PromptController
  export const prompt = () => promptController.prompt

  export const goToPreviousMedia = async () => {
    if (!$visibleMedium) return

    const mediaIndex = $media_store.findIndex(m => m.id == $visibleMedium?.id)

    if (mediaIndex > 0) visibleMedium.set($media_store[mediaIndex - 1])
  }

  export const goToNextMedia = async () => {
    if (!$visibleMedium) return

    const mediaIndex = $media_store.findIndex(m => m.id == $visibleMedium?.id)

    if (mediaIndex < $media_store.length - 1)
      visibleMedium.set($media_store[mediaIndex + 1])
  }

  const shift = true,
    control = true,
    alt = true,
    opt = true,
    meta = true

  const popups = {
    "Quick Actions": QuickActions,
    "Quick Actions Import": QuickActionsImport,
    "Quick Actions Import from URL": QuickActionsImportFromUrl,
    "Quick Actions Import from Search": QuickActionsImportFromSearch,
    "Quick Actions Import from Reddit": QuickActionsImportFromReddit,
    "Quick Switch": QuickSwitch,
    Shortcuts: ShortcutPopup,
    Settings: SettingsPopup,
    "Create Story": CreateStoryPopup,
    "Navigation Section Mobile": NavigationSectionMobile,
    "Media Viewer Mobile": MediaViewerMobile,
    "Media Details": MediaDetailsPopup
  } as const

  let popup: keyof typeof popups | null = null
  export const setPopup = (newPopup: typeof popup) => (popup = newPopup)
  export const setActionBar = (newActionBar: keyof typeof actionBars | null) =>
    actionBar.set(newActionBar)
</script>

<PromptController bind:this={promptController} />

{#if popup}
  <svelte:component this={popups[popup]} />
{/if}

<Shortcut
  meta
  key="o"
  action={() => {
    popup = "Quick Switch"
  }}
/>
<Shortcut
  meta
  key="k"
  action={() => {
    popup = "Quick Actions"
  }}
/>
<Shortcut meta key="/" action={() => (popup = "Shortcuts")} />
<Shortcut meta key="," action={() => goto("/settings/general")} />

<!-- Media Navigation -->
<Shortcut key="," action={goToPreviousMedia} />
<Shortcut key="." action={goToNextMedia} />

<!-- Go up by a cluster -->
<Shortcut
  shift
  opt
  key="ArrowUp"
  action={() => {
    const currentClusterIndex = pageData.clusters.findIndex(
      c => c.id == pageData.cluster.id
    )
    if (currentClusterIndex == 0) return
    const newCluster = pageData.clusters[currentClusterIndex - 1]
    goto(`/${newCluster.name}`)
  }}
/>

<!-- Go down by a cluster -->
<Shortcut
  shift
  opt
  key="ArrowDown"
  action={() => {
    const currentClusterIndex = pageData.clusters.findIndex(
      c => c.id == pageData.cluster.id
    )
    if (currentClusterIndex >= pageData.clusters.length - 1) return
    const cluster = pageData.clusters[currentClusterIndex + 1]
    goto(`/${cluster.name}`)
  }}
/>
