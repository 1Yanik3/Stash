<script lang="ts">
  import { onMount } from "svelte"

  import { afterNavigate, beforeNavigate, goto } from "$app/navigation"
  import { page } from "$app/stores"
  import CreateStoryPopup from "$components/Popups/CreateStoryPopup.svelte"
  import MediaDetailsPopup from "$components/Popups/MediaDetailsPopup.svelte"
  import MediaViewerMobile from "$components/Popups/Mobile/MediaViewerMobile.svelte"
  import PromptController from "$components/Popups/Prompts/_PromptController.svelte"
  import QuickActionsImport from "$components/Popups/QuickSwitcher/QuickActions_Import.svelte"
  import QuickActionsImportFromSearch from "$components/Popups/QuickSwitcher/QuickActions_ImportFromSearch.svelte"
  import QuickActionsImportFromUrl from "$components/Popups/QuickSwitcher/QuickActions_ImportFromUrl.svelte"
  import QuickActions from "$components/Popups/QuickSwitcher/QuickActions.svelte"
  import QuickSwitch from "$components/Popups/QuickSwitcher/QuickSwitch.svelte"
  import ShortcutPopup from "$components/Popups/ShortcutPopup.svelte"
  import CollapsedTagsController from "$lib/controllers/CollapsedTagsController"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { tagsController as _tagsController } from "$lib/controllers/TagsController.svelte"
  import {
    actionBar,
    actionBars,
    imageSuffixParameter,
    selectedMediaIds,
    selectedTags,
    settings,
    thumbnailSuffixParameter,
    visibleMedium
  } from "$lib/stores"
  import Shortcut from "$reusables/Shortcut.svelte"

  import type { PageData } from "./[cluster]/$types"

  $: pageData = $page.data as PageData

  // TODO: get rid of
  export const tagsController = _tagsController
  export const collapsedTagsController = new CollapsedTagsController()

  onMount(() => {
    mediaController.init()
    _tagsController.init()
    collapsedTagsController.init()
    console.log("Controller mounted")
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

  // TODO: Move to controller
  export const goToPreviousMedia = async () => {
    if (!$visibleMedium) return

    const mediaIndex = mediaController.media.findIndex(
      m => m.id == $visibleMedium?.id
    )

    if (mediaIndex > 0) visibleMedium.set(mediaController.media[mediaIndex - 1])
  }

  export const goToNextMedia = async () => {
    if (!$visibleMedium) return

    const mediaIndex = mediaController.media.findIndex(
      m => m.id == $visibleMedium?.id
    )

    if (mediaIndex < mediaController.media.length - 1)
      visibleMedium.set(mediaController.media[mediaIndex + 1])
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
    "Quick Switch": QuickSwitch,
    Shortcuts: ShortcutPopup,
    "Create Story": CreateStoryPopup,
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
