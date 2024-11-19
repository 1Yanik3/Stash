<script lang="ts">
  import { onMount } from "svelte"

  import { beforeNavigate, goto } from "$app/navigation"
  import { page } from "$app/stores"
  import CreateStoryPopup from "$components/Popups/CreateStoryPopup.svelte"
  import MediaDetailsPopup from "$components/Popups/MediaDetailsPopup.svelte"
  import MediaViewerMobile from "$components/Popups/Mobile/MediaViewerMobile.svelte"
  import QuickActionsImport from "$components/Popups/QuickSwitcher/QuickActions_Import.svelte"
  import QuickSwitch from "$components/Popups/QuickSwitch.svelte"
  import ShortcutPopup from "$components/Popups/ShortcutPopup.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { tagsController } from "$lib/controllers/TagsController.svelte"
  import {
    actionBar,
    actionBars,
    selectedMediaIds,
    settings,
    thumbnailSuffixParameter,
    windowControlsSpacerVisible
  } from "$lib/stores"
  import Shortcut from "$reusables/Shortcut.svelte"

  import type { PageData } from "./[cluster]/$types"

  let pageData = $page.data as PageData

  onMount(() => {
    mediaController.init()
    tagsController.init()
    console.log("%cControllers mounted", "color: grey")
  })

  //   const reset = (newClusterName: string | undefined) => {
  //     tagsController.updateTags(newClusterName)
  //     mediaController.updateMedia(newClusterName)
  //   }

  beforeNavigate(data => {
    thumbnailSuffixParameter.set(null)
    selectedMediaIds.set([])
    mediaController.pages = []
    tagsController.updateTags(data.to?.params?.cluster)
    mediaController.updateMedia(data.to?.params?.cluster, {
      ...mediaController.filters,
      selectedTags: [],
      specialFilterAttribute: null
    })
  })
  //   afterNavigate(data => reset())

  // visibleMedium.subscribe(() => {
  //   imageSuffixParameter.set("")
  // })

  $effect(() => {
    if ($settings.mobileLayout) {
      setPopup(mediaController.visibleMedium ? "Media Viewer Mobile" : null)
    }
  })

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

  windowControlsSpacerVisible.set($page.data.userAgent?.includes("Electron"))

  onMount(() => {
    // @ts-ignore
    window.fullscreenChanged = (state: boolean) => {
      windowControlsSpacerVisible.set(!state)
    }
  })
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
    popup = "Quick Switch"
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
