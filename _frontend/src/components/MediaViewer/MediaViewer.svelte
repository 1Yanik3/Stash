<script lang="ts">
  import { onMount } from "svelte"

  import { page } from "$app/stores"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import {
    controller,
    imageSuffixParameter,
    isFullscreen,
    settings
  } from "$lib/stores"
  import Shortcut from "$reusables/Shortcut.svelte"

  import type { PageData } from "../../routes/[cluster]/$types"
  import MediaViewerImage from "./MediaViewerImage.svelte"
  import MediaViewerVideo from "./MediaViewerVideo.svelte"
  import Toolbar from "./Toolbar.svelte"

  let mediaElement: HTMLElement
  let isZoomedIn = false

  //   TODO: reimplment this
  let preloadedImageUrl = ""
  //   const updatePreloadedImageUrl = async (_: typeof $visibleMedium) => {
  //     const mediaIndex = mediaController.media.findIndex(
  //       m => m.id == $visibleMedium?.id
  //     )

  //     if (mediaIndex < mediaController.media.length - 1)
  //       preloadedImageUrl = `${pageData.serverURL}/file/${
  //         mediaController.media[mediaIndex + 1].id
  //       }${$imageSuffixParameter}`
  //     else preloadedImageUrl = ""
  //   }
  //   $: updatePreloadedImageUrl($visibleMedium)

  let hideControls = false
  let hideTimeout: NodeJS.Timeout

  const hideControlsAfterTimeout = () => {
    clearTimeout(hideTimeout)
    hideTimeout = setTimeout(() => {
      hideControls = true
    }, 3000)
  }

  onMount(() => {
    const handleMouseMove = () => {
      hideControls = false
      hideControlsAfterTimeout()
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", () => {
      hideControls = true
      clearTimeout(hideTimeout)
    })

    hideControlsAfterTimeout()

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      clearTimeout(hideTimeout)
    }
  })
</script>

<Shortcut
  key="Escape"
  action={() => {
    isFullscreen.set(false)
    mediaController.visibleMedium = null
  }}
/>

{#if mediaController.visibleMedium}
  <main class:fullscreen={$isFullscreen} class:mobile={$settings.mobileLayout}>
    <div class="toolbar">
      <Toolbar {hideControls} />
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
      {#if mediaController.visibleMedium.type.startsWith("image")}
        <MediaViewerImage />
      {:else if mediaController.visibleMedium.type.startsWith("video")}
        <MediaViewerVideo {hideControls} />
      {:else}
        <span>{mediaController.visibleMedium.name}</span>
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
