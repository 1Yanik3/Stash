<script lang="ts">
  import {
    controller,
    imageSuffixParameter,
    isFullscreen,
    media_store,
    settings,
    videoElement,
    visibleMedium
  } from "$lib/stores"
  import { page } from "$app/stores"
  import type { PageData } from "../routes/[cluster]/$types"
  import Shortcut from "$reusables/Shortcut.svelte"

  $: pageData = $page.data as PageData

  let imageElement: HTMLElement
  let isZoomedIn = false

  let video: HTMLVideoElement
  $: videoElement.set(video)

  let showMouse = true
  let mouseTimer: NodeJS.Timeout

  function handleMouseMove() {
    showMouse = true
    clearTimeout(mouseTimer)
    if ($isFullscreen)
      mouseTimer = setTimeout(() => {
        showMouse = false
      }, 1500)
  }

  function handleMouseLeave() {
    showMouse = true
    clearTimeout(mouseTimer)
  }

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
    <div
      id="media"
      class:darkened={$isFullscreen}
      class:isZoomedIn
      on:click={e => {
        if ($settings.touchNavigationButtons) {
          const { width } = (imageElement || video).getBoundingClientRect()

          if (e.offsetX < width / 2) $controller.goToPreviousMedia()
          if (e.offsetX > width / 2) $controller.goToNextMedia()
        }
      }}
      on:mousemove={handleMouseMove}
      on:mouseleave={handleMouseLeave}
    >
      {#if $visibleMedium.type.startsWith("image")}
        <img
          bind:this={imageElement}
          src={`${$page.data.serverURL}/file/${$visibleMedium.id}${$imageSuffixParameter}`}
          crossorigin="use-credentials"
          alt={$visibleMedium.name}
          class:isZoomedIn
          on:click={e => {
            if (!$settings.touchNavigationButtons) isZoomedIn = !isZoomedIn
          }}
          style={showMouse ? "" : "cursor: none"}
        />
      {:else if $visibleMedium.type.startsWith("video")}
        <video
          src={`${$page.data.serverURL}/file/${$visibleMedium.id}`}
          controls
          autoplay
          bind:this={video}
          on:playing={() => {
            if (video.duration <= 5) video.loop = true
          }}
          crossorigin="use-credentials"
          style={showMouse ? "" : "cursor: none"}
        >
          <track kind="captions" />
        </video>
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
    overflow: scroll;
    display: grid;
    grid-template-rows: 1fr;
    // TODO: Make more elegant
    height: calc(100vh - 48px);

    border-left: 1px solid $border-color-base;
  }

  #media {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: calc(100vh - 48px);

    background: $color-dark-level-base;

    &.darkened {
      background: #000;
    }

    &.isZoomedIn {
      align-items: baseline;
    }

    img {
      cursor: zoom-in;
    }

    img,
    video {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      outline: none;
    }

    img.isZoomedIn {
      cursor: zoom-out;
      max-width: unset;
      max-height: unset;
    }
  }

  main.fullscreen {
    height: 100%;

    #media {
      height: 100%;

      img,
      video {
        width: 100vw;
        max-width: 100vw;
        height: 100vh;
        max-height: 100vh;
      }
    }
  }
</style>
