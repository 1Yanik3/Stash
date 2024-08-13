<script lang="ts">
  import { onMount } from "svelte"

  import { page } from "$app/stores"
  import Button from "$components/Button.svelte"
  import { settings, videoElement, visibleMedium } from "$lib/stores"
  import Shortcut from "$reusables/Shortcut.svelte"

  const formatDuration = (seconds: number) => {
    let hours = Math.floor(seconds / 3600)
    let minutes = Math.floor(seconds / 60)
    let remainingSeconds = seconds % 60

    if (hours > 0) {
      return (
        hours +
        ":" +
        (minutes < 10 ? "0" + minutes : minutes) +
        ":" +
        remainingSeconds.toFixed()
      )
    }

    return (
      minutes +
      ":" +
      (remainingSeconds < 10
        ? "0" + remainingSeconds.toFixed()
        : remainingSeconds.toFixed())
    )
  }

  let videoElementWidth: number
  onMount(() => {
    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries.at(0)
      if (!entry) return
      videoElementWidth = entry.contentRect.width
    })

    resizeObserver.observe(video)

    // This callback cleans up the observer
    return () => resizeObserver.unobserve(video)
  })

  let video: HTMLVideoElement
  $: videoElement.set(video)
  let seekVideo: HTMLVideoElement | null

  let paused = true
  let currentTime = 0
  let duration = 0
  let volume = 0.5
  let currentSeekPosition: number = 0

  $: playbackPercentage = (currentTime / duration) * 100

  let rangeSlider: HTMLDivElement
  let thumbIsLifted = false
  $: console.log(thumbIsLifted)

  const processMousePositionToTime = (e: MouseEvent | TouchEvent) => {
    const startX = rangeSlider.getBoundingClientRect().left
    const endX = rangeSlider.getBoundingClientRect().right
    const range = endX - startX
    const playbackPercentage =
      // @ts-ignore
      (((e.clientX || e.touches[0].clientX) - startX) / range) * 100

    currentSeekPosition = (video.duration / 100) * playbackPercentage

    if (thumbIsLifted) currentTime = currentSeekPosition

    if (seekVideo) {
      seekVideo.currentTime = currentSeekPosition
      console.log(seekVideo.currentTime)
      seekVideo.style.left = `${playbackPercentage}%`
    }
  }
</script>

<main>
  <video
    src={`${$page.data.serverURL}/file/${$visibleMedium?.id}`}
    autoplay
    bind:this={video}
    bind:paused
    bind:currentTime
    bind:duration
    bind:volume
    on:playing={() => {
      if (video.duration <= 5) video.loop = true
    }}
    crossorigin="use-credentials"
  >
    <track kind="captions" />
  </video>
  <div class="controls" style="width: {videoElementWidth - 32}px">
    <Button
      transparentButton
      noMargin
      icon={paused ? "mdiPlay" : "mdiPause"}
      on:click={() => {
        paused = !paused
      }}
    />
    <div
      class="range"
      bind:this={rangeSlider}
      on:mousedown|preventDefault={() => (thumbIsLifted = true)}
      on:mousemove={e => {
        processMousePositionToTime(e)
      }}
      on:mouseup={e => {
        processMousePositionToTime(e)
        thumbIsLifted = false
      }}
      on:touchstart={() => (thumbIsLifted = true)}
      on:touchmove={e => {
        processMousePositionToTime(e)
      }}
      on:touchend={e => {
        processMousePositionToTime(e)
        thumbIsLifted = false
      }}
    >
      <div class="track-before" style="width: {playbackPercentage}%"></div>
      <div class="track-after" style="width: {100 - playbackPercentage}%"></div>
      <div class="thumb" style="left: {playbackPercentage}%"></div>
      {#if !$settings.mobileLayout}
        <video
          src="{$page.data.serverURL}/api/media/{$visibleMedium?.id}/seek"
          autoplay
          controls
          bind:this={seekVideo}
          muted
          crossorigin="use-credentials"
        >
          <track kind="captions" />
        </video>
      {/if}
    </div>
    <div>
      <span>{formatDuration(currentTime)} / {formatDuration(duration)}</span>
    </div>
  </div>
</main>

<Shortcut key=" " action={() => (paused = !paused)} />
<Shortcut key="k" action={() => (paused = !paused)} />

<Shortcut
  key="j"
  action={() => {
    const seekBy = 60
    if (currentTime - seekBy < 0) currentTime = 0
    else currentTime -= seekBy
  }}
/>
<Shortcut
  key="ArrowLeft"
  action={() => {
    const seekBy = 15
    if (currentTime - seekBy < 0) currentTime = 0
    else currentTime -= seekBy
  }}
/>

<Shortcut
  key="l"
  action={() => {
    const seekBy = 60
    if (currentTime + seekBy > duration) currentTime = duration
    else currentTime += seekBy
  }}
/>
<Shortcut
  key="ArrowRight"
  action={() => {
    const seekBy = 15
    if (currentTime + seekBy > duration) currentTime = duration
    else currentTime += seekBy
  }}
/>

<style lang="scss">
  main {
    position: relative;
    width: 100%;
    height: 100%;

    & > video {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      max-width: 100%;
      max-height: 100%;

      object-fit: contain;
      outline: none !important;
    }

    .controls {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      transform: translate(-8px);

      display: flex;
      gap: 1rem;
      align-items: center;
      justify-self: center;

      padding: 1rem;

      .range {
        $height: 12px;
        $border-radius: 4px;

        cursor: pointer;

        position: relative;

        display: flex;
        flex-grow: 1;
        align-items: center;

        height: $height;

        // TODO: Transition/animation

        .track-before {
          height: $height;
          background: rgba(255, 255, 255, 0.5);
          border-top-left-radius: $border-radius;
          border-bottom-left-radius: $border-radius;
        }

        .track-after {
          height: $height;

          background: rgba(50, 50, 50, 0.5);
          border-radius: 2px;
          border-top-right-radius: $border-radius;
          border-bottom-right-radius: $border-radius;
        }

        .thumb {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);

          width: 8px;
          height: $height + 8px;

          background: white;
          border-radius: 4px;

          transition: height 200ms;

          &:hover {
            height: $height + 12px;
          }
        }

        & > video {
          position: absolute;
          bottom: 70px;

          display: flex;
          justify-content: center;
          align-items: center;

          width: 150px;
          border-radius: 5px;
          transform: translate(-50%);
        }
      }
    }
  }
</style>
