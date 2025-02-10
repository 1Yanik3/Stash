<script lang="ts">
  import { onMount } from "svelte"

  import { browser } from "$app/environment"
  import { goto } from "$app/navigation"
  import { page } from "$app/stores"
  import MediaViewerMobile from "$components/Mobile/MediaViewerMobile.svelte"
  import CreateStoryPopup from "$components/Popups/CreateStoryPopup.svelte"
  import MediaDetailsPopup from "$components/Popups/MediaDetailsPopup.svelte"
  import QuickSwitch from "$components/Popups/QuickSwitch.svelte"
  import QuickActionsImport from "$components/Popups/QuickSwitcher/QuickActions_Import.svelte"
  import ShortcutPopup from "$components/Popups/ShortcutPopup.svelte"
  import { isMobile } from "$lib/context"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import tagsController from "$lib/controllers/TagsController.svelte"
  import {
    actionBar,
    actionBars,
    settings,
    windowControlsSpacerVisible
  } from "$lib/stores.svelte"
  import vars from "$lib/vars.svelte"
  import Shortcut from "$reusables/Shortcut.svelte"

  import type { PageData } from "./[cluster]/$types"

  let pageData = $page.data as PageData

  $effect(() => {
    vars.clusterName = $page.params.cluster
  })

  onMount(() => {
    mediaController.init()
    tagsController.init()
    console.log("%cControllers mounted", "color: grey")
    if (browser) {
      // @ts-ignore
      window.mediaController = mediaController
    }
  })

  $effect(() => {
    if (isMobile.current) {
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
    else
      mediaController.loadMoreMedia().then(() => {
        mediaController.visibleMedium = mediaController.media[mediaIndex + 1]
      })
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

<!-- TODO: Make toggle for less bandwith usage -->
<svelte:head>
  {#if mediaController.prefetchedQueryForTagId}
    {#key mediaController.prefetchedQueryForTagId[0]}
      {#await mediaController.prefetchedQueryForTagId[1] then mediaToPreload}
        {#each mediaToPreload as { id }}
          <link
            rel="preload"
            as="image"
            href="{pageData.serverURL}/thumb/{id}.webp"
            crossorigin="use-credentials"
          />
        {/each}
      {/await}
    {/key}
  {/if}
</svelte:head>
