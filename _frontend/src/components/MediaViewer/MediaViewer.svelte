<script lang="ts">
  import { page } from "$app/stores"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import {
    controller,
    imageSuffixParameter,
    isFullscreen,
    settings,
    visibleMedium
  } from "$lib/stores"
  import Shortcut from "$reusables/Shortcut.svelte"

  import type { PageData } from "../../routes/[cluster]/$types"
  import MediaViewerImage from "./MediaViewerImage.svelte"
  import MediaViewerVideo from "./MediaViewerVideo.svelte"
  import Toolbar from "./Toolbar.svelte"

  $: pageData = $page.data as PageData

  let mediaElement: HTMLElement
  let isZoomedIn = false

  let preloadedImageUrl = ""
  const updatePreloadedImageUrl = async (_: typeof $visibleMedium) => {
    const mediaIndex = mediaController.media.findIndex(
      m => m.id == $visibleMedium?.id
    )

    if (mediaIndex < mediaController.media.length - 1)
      preloadedImageUrl = `${pageData.serverURL}/file/${
        mediaController.media[mediaIndex + 1].id
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
  <main class:fullscreen={$isFullscreen} class:mobile={$settings.mobileLayout}>
    <div class="toolbar">
      <Toolbar />
    </div>
    <div
      id="media"
      bind:this={mediaElement}
      class:darkened={$isFullscreen}
      class:isZoomedIn
      on:pointerdown={e => {
        if ($settings.imageTapAction == "navigate") {
          const { width } = mediaElement.getBoundingClientRect()

          if (e.clientY > window.innerHeight - 200) return

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

    background: var(--color-dark-level-lower);

    &:not(&.fullscreen) {
      border-left: 1px solid var(--border-color-base);
    }

    #media {
      background: var(--color-lowest);
    }

    &.fullscreen,
    &.mobile {
      width: 100vw !important;
      max-width: none !important;

      #media {
        background: #000;
      }
    }
  }
</style>
