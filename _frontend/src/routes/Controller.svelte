<script lang="ts">
  import { onMount } from "svelte"

  import { afterNavigate, beforeNavigate, goto } from "$app/navigation"
  import { page } from "$app/stores"
  import CreateStoryPopup from "$components/Popups/CreateStoryPopup.svelte"
  import MediaDetailsPopup from "$components/Popups/MediaDetailsPopup.svelte"
  import MediaViewerMobile from "$components/Popups/Mobile/MediaViewerMobile.svelte"
  import QuickActionsImport from "$components/Popups/QuickSwitcher/QuickActions_Import.svelte"
  import QuickActions from "$components/Popups/QuickSwitcher/QuickActions.svelte"
  import QuickSwitch from "$components/Popups/QuickSwitcher/QuickSwitch.svelte"
  import ShortcutPopup from "$components/Popups/ShortcutPopup.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { tagsController } from "$lib/controllers/TagsController.svelte"
  import {
    actionBar,
    actionBars,
    imageSuffixParameter,
    selectedMediaIds,
    settings,
    thumbnailSuffixParameter
  } from "$lib/stores"
  import Shortcut from "$reusables/Shortcut.svelte"

  import type { PageData } from "./[cluster]/$types"

  let pageData = $page.data as PageData

  onMount(() => {
    mediaController.init()
    tagsController.init()
    console.log("%cControllers mounted", "color: grey");
  })

  beforeNavigate(() => {
    thumbnailSuffixParameter.set(null)
    tagsController.selectedTags = []
    mediaController.filter_specialFilterAttribute = null
  })

  afterNavigate(() => {
    selectedMediaIds.set([])
    mediaController.visibleMedium = null
  })

  // TODO: reimplment this
  // visibleMedium.subscribe(() => {
  //   imageSuffixParameter.set("")
  // })
  // onMount(() => {
  //   visibleMedium.subscribe(newMedium => {
  //     if ($settings.mobileLayout) {
  //       setPopup(newMedium ? "Media Viewer Mobile" : null)
  //     }
  //   })
  // })

  // TODO: Move to controller
  export const goToPreviousMedia = async () => {
    if (!mediaController.visibleMedium) return

    const mediaIndex = mediaController.media.findIndex(
      m => m.id == mediaController.visibleMedium?.id
    )

    if (mediaIndex > 0)
      mediaController.visibleMedium = mediaController.media[mediaIndex - 1]
  }

  export const goToNextMedia = async () => {
    if (!mediaController.visibleMedium) return

    const mediaIndex = mediaController.media.findIndex(
      m => m.id == mediaController.visibleMedium?.id
    )

    if (mediaIndex < mediaController.media.length - 1)
      mediaController.visibleMedium = mediaController.media[mediaIndex + 1]
  }

  const popups = {
    "Quick Actions": QuickActions,
    "Quick Actions Import": QuickActionsImport,
    "Quick Switch": QuickSwitch,
    Shortcuts: ShortcutPopup,
    "Create Story": CreateStoryPopup,
    "Media Viewer Mobile": MediaViewerMobile,
    "Media Details": MediaDetailsPopup
  } as const

  let popup: keyof typeof popups | null = $state(null)
  let Popup = $derived(popup ? popups[popup] : null) as any
  export const setPopup = (newPopup: typeof popup) => (popup = newPopup)
  export const setActionBar = (newActionBar: keyof typeof actionBars | null) =>
    actionBar.set(newActionBar)
</script>

{#if Popup}
  <Popup />
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
