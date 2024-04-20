<script lang="ts">
  import DropFile from "$components/DropFile.svelte"
  import ImageGrid from "$components/ImageGrid.svelte"
  import MediaViewer from "$components/MediaViewer.svelte"
  import Toolbar from "$components/Toolbar.svelte"

  import {
    actionBar,
    actionBars,
    isFullscreen,
    media_store,
    selectedTags,
    settings,
    traverse,
    visibleMedium,
    activeSortingMethod,
    favouritesOnly,
    mediaTypeFilter,
    activeSetMethod,
    seed
  } from "$lib/stores"
  import NavigationSection from "./NavigationSection.svelte"
  import { afterNavigate, beforeNavigate } from "$app/navigation"
  import type { Media } from "@prisma/client"
  import { setMethods, sortingMethods } from "../../types"
  import { page } from "$app/stores"
  import { onMount } from "svelte"

  let isCurrentlyLoadingNewMedia = false
  const loadMedia = (cluster: string, offset = 0): Promise<Media[]> =>
    new Promise(async resolve => {
      if (isCurrentlyLoadingNewMedia) return

      isCurrentlyLoadingNewMedia = true
      console.log("Loading new media", { offset })

      const mediaRequest = await fetch(
        `/api/cluster/${cluster}/media?${new URLSearchParams({
          traverse: $traverse.toString(),
          tags: $selectedTags.join(","),
          activeSetMethod: setMethods.indexOf($activeSetMethod).toString(),
          mediaTypeFilter: $mediaTypeFilter,
          favouritesOnly: $favouritesOnly.toString(),
          activeSortingMethod: (cluster == "Camp Buddy"
            ? sortingMethods.findIndex(
                a => a.icon == "mdiSortAlphabeticalAscending"
              )
            : sortingMethods.indexOf($activeSortingMethod)
          ).toString(),
          offset: offset.toString(),
          seed: $seed.toString()
        }).toString()}`
      )

      const data = await mediaRequest.json()
      isCurrentlyLoadingNewMedia = false
      resolve(data)
    })

  const resetMedia = async (cluster = $page.params.cluster) => {
    media_store.set(await loadMedia(cluster, 0))
  }
  onMount(() => {
    traverse.subscribe(() => {
      resetMedia()
    })
    selectedTags.subscribe(() => {
      resetMedia()
    })
    activeSetMethod.subscribe(() => {
      resetMedia()
    })
    favouritesOnly.subscribe(() => {
      resetMedia()
    })
    mediaTypeFilter.subscribe(() => {
      resetMedia()
    })
    activeSortingMethod.subscribe(() => {
      resetMedia()
    })
    seed.subscribe(() => {
      resetMedia()
    })
  })

  afterNavigate(({ to }) => {
    if (to?.params) resetMedia(to.params.cluster)
  })

  const onscroll = (e: Event) => {
    if (isCurrentlyLoadingNewMedia) return
    const target = e.target as HTMLDivElement
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 500) {
      loadMedia($page.params.cluster, $media_store.length).then(newMedia =>
        media_store.update(oldMedia => [...oldMedia, ...newMedia])
      )
    }
  }
</script>

<main class:mobile={$settings.mobileLayout}>
  {#if !$isFullscreen && !$settings.mobileLayout}
    <NavigationSection />
  {/if}

  {#if !$isFullscreen}
    <section id="imageGallerySection" on:scroll={onscroll}>
      <DropFile>
        <ImageGrid />
      </DropFile>
    </section>
  {/if}

  {#if $actionBar}
    <svelte:component this={actionBars[$actionBar]} />
  {/if}

  {#if $visibleMedium && !$settings.mobileLayout && $actionBar != "Cast"}
    <section
      id="mediaPlayerSection"
      style={$isFullscreen
        ? "grid-column: span 3; width: 100vw; max-width: 100vw"
        : ""}
    >
      <Toolbar />
      <MediaViewer />
    </section>
  {/if}
</main>

<style lang="scss">
  main {
    overflow: scroll;
    overflow-y: auto;
    display: flex;
    background: $color-dark-level-base;

    #imageGallerySection {
      position: relative;

      overflow: scroll;
      flex-basis: 0;
      flex-grow: 1;

      min-width: 350px;
      padding: 1em;
    }

    #mediaPlayerSection {
      min-width: 40vw;
      max-width: min(1000px, 40vw);
    }

    &.mobile {

      #imageGallerySection {
        min-width: unset;
      }
    }
  }
</style>
