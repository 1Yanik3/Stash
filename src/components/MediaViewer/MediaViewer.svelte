<script lang="ts">
  import {
    controller,
    imageSuffixParameter,
    isFullscreen,
    media_store,
    settings,
    visibleMedium
  } from "$lib/stores"
  import { page } from "$app/stores"
  import type { PageData } from "../../routes/[cluster]/$types"
  import Shortcut from "$reusables/Shortcut.svelte"
  import MediaViewerVideo from "./MediaViewerVideo.svelte"
  import MediaViewerImage from "./MediaViewerImage.svelte"
  import Toolbar from "./Toolbar.svelte"

  $: pageData = $page.data as PageData

  let mainElement: HTMLElement
  let isZoomedIn = false

  let preloadedImageUrl = ""
  const updatePreloadedImageUrl = async (_: typeof $visibleMedium) => {
    const mediaIndex = $media_store.findIndex(m => m.id == $visibleMedium?.id)

    if (mediaIndex < $media_store.length - 1)
      preloadedImageUrl = `${pageData.serverURL}/file/${
        $media_store[mediaIndex + 1].id
      }${$imageSuffixParameter}`
    else preloadedImageUrl = ""
  }
  $: updatePreloadedImageUrl($visibleMedium)
</script>

<Shortcut
  key="Escape"
  action={() => {
    visibleMedium.set(null)
  }}
/>

{#if $visibleMedium}
  <main class:fullscreen={$isFullscreen}>
    <div class="toolbar">
      <Toolbar />
    </div>
    <div
      id="media"
      class:darkened={$isFullscreen}
      class:isZoomedIn
      on:click={e => {
        if ($settings.touchNavigationButtons) {
          const { width } = mainElement.getBoundingClientRect()

          if (e.offsetX < width / 2) $controller.goToPreviousMedia()
          if (e.offsetX > width / 2) $controller.goToNextMedia()
        }
      }}
    >
      {#if $visibleMedium.type.startsWith("image")}
        <MediaViewerImage />
      {:else if $visibleMedium.type.startsWith("video")}
        <MediaViewerVideo />
      {:else}
        <span>{$visibleMedium.name}</span>
      {/if}
    </div>
  </main>

  {#if preloadedImageUrl}
    <link
      rel="prefetch"
      href={preloadedImageUrl}
      crossorigin="use-credentials"
    />
  {/if}
{/if}

<style lang="scss">
  main {
    display: grid;
    grid-template-rows: auto 1fr;

    min-width: 40vw;
    max-width: min(1000px, 40vw);
    height: 100vh;

    background: $color-dark-level-lower;
    border-left: 1px solid $border-color-base;

    &.fullscreen {
      max-width: none !important;
      width: 100vw !important;
    }
  }
</style>
