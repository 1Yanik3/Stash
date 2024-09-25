<script lang="ts">
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"

  import { browser } from "$app/environment"
  import { page } from "$app/stores"
  import type Castjs from "$lib/client/cast-js"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { controller, settings } from "$lib/stores"

  import Icon from "../../Icon.svelte"

  let videoPlaying = true
  let currentTime = 0
  let playbackProgress = 0
  let newVideo = false

  let connected = false
  let cjs: null | Castjs

  onMount(async () => {
    if (!browser) return

    // Setup CastJS
    cjs = new (await import("$lib/client/cast-js")).default()
    cjs.on("connect", () => {
      console.log("connect")
      connected = true
    })
    cjs.on("disconnect", () => {
      console.log("disconnect")
      connected = false
    })
    cjs.on("available", () => {
      console.log("available")
    })
    cjs.on("statechange", () => {
      console.log("statechange", cjs?.state)
      videoPlaying = cjs?.state === "playing"
    })
    cjs.on("timeupdate", () => {
      console.log("timeupdate")
      currentTime = cjs?.time
      playbackProgress = cjs?.progress
    })
    cjs.on("playing", () => {
      console.log("playing")
      videoPlaying = true
      if (newVideo) {
        cjs?.seek(0, false)
        newVideo = false
      }
    })
    cjs.on("pause", () => {
      console.log("pause")
      videoPlaying = false
    })
    cjs.on("end", () => {
      console.log("end")
    })
    cjs.on("error", () => {
      console.log("error")
    })
  })

  const cast = (media = mediaController.visibleMedium) => {
    if (!cjs) return

    console.info("casting", media?.id || null)

    window.cjs = cjs
    // cjs.disconnect()
    // console.log("disconnected")

    if (media) {
      console.log(`https://stash.any.gay/file/${media.id}?session=udhmunznya`)
      cjs.cast(`https://stash.any.gay/file/${media.id}?session=udhmunznya`, {
        poster: `https://stash.any.gay/file/api/media/${media.id}/thumbnail`,
        title: media.name
      })
      newVideo = true
    } else {
      console.log("home")
      cjs.cast(
        "https://cdn.discordapp.com/attachments/995660268241682462/1263555370937221230/ant.ms_capybara_sketch_dark_background_82e81000-ef94-4631-95dd-8f9ddd764160.png?ex=669aa924&is=669957a4&hm=78ee3f6a2ebe0bd1efe65b75c75c9abe474e28279c7b18adbe0810397fa95a10&",
        {
          title: "Stash",
          description: "Select something to play ;)"
        }
      )
    }
  }
  $effect(() => {
    if (mediaController.visibleMedium && connected) cast(mediaController.visibleMedium)
  })

  let disableSeeking = false
  let seekVideo: HTMLVideoElement | null
</script>

<main>
  <section class="first">
    {#if connected}
      <span
        class:disabled={!mediaController.visibleMedium}
        onclick={() => {
          console.info("disconnect")
          cjs?.disconnect()
        }}
      >
        <Icon name="mdiCastOff" size={0.8} />
      </span>
    {:else}
      <span
        class:disabled={!mediaController.visibleMedium}
        onclick={() => cast()}
      >
        <Icon name="mdiCast" size={0.8} />
      </span>
    {/if}

    {#if mediaController.visibleMedium}
      <span onclick={() => (mediaController.visibleMedium = null)}>
        <Icon name={"mdiBackspaceOutline"} size={0.8} />
      </span>
    {/if}
  </section>

  <section>
    <!-- {#if $visibleMedium?.type.startsWith("image")}

        {/if} -->
    {#if mediaController.visibleMedium?.type.startsWith("video")}
      <!-- go forward 60 sec -->
      <span
        onclick={() => cjs?.seek(currentTime - 60, false)}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiRewind60" size={0.8} />
      </span>

      <!-- go forward 15 sec -->
      <span
        onclick={() => cjs?.seek(currentTime - 15, false)}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiRewind15" size={0.8} />
      </span>

      <!-- play/pause -->
      <span
        onclick={() => {
          console.debug({ videoPlaying })
          if (videoPlaying) cjs?.pause()
          else cjs?.play()
        }}
        transition:fade={{ duration: 100 }}
      >
        <Icon name={videoPlaying ? "mdiPause" : "mdiPlay"} size={0.8} />
      </span>

      <!-- go forward 15 sec -->
      <span
        onclick={() => cjs?.seek(currentTime + 15, false)}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiFastForward15" size={0.8} />
      </span>

      <!-- go forward 60 sec -->
      <span
        onclick={() => cjs?.seek(currentTime + 60, false)}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiFastForward60" size={0.8} />
      </span>
    {/if}
  </section>

  <section class="last">
    <span onclick={() => $controller.goToPreviousMedia()}>
      <Icon name="mdiChevronLeft" size={0.8} />
    </span>
    <span onclick={() => $controller.goToNextMedia()}>
      <Icon name="mdiChevronRight" size={0.8} />
    </span>
  </section>

  {#if mediaController.visibleMedium?.type.startsWith("video")}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="playbackStatus"
      onclick={e => {
        cjs?.seek((e.clientY * 100) / window.innerHeight, true)
      }}
      onmousemove={e => {
        if (seekVideo) {
          seekVideo.currentTime =
            (e.clientY * seekVideo.duration) / window.innerHeight

          const topBottomPadding = 59
          seekVideo.style.top = `${Math.max(topBottomPadding, Math.min(window.innerHeight - topBottomPadding, e.clientY))}px`
        }
      }}
    >
      <div style:height="{playbackProgress}%" />

      {#if !$settings.mobileLayout && !disableSeeking}
        <video
          src="{$page.data.serverURL}/thumb/{mediaController.visibleMedium
            ?.id}_seek.webm"
          muted
          bind:this={seekVideo}
          crossorigin="use-credentials"
          onerror={() => (disableSeeking = true)}
        >
          <track kind="captions" />
        </video>
      {/if}
    </div>
  {/if}
</main>

<style lang="scss">
  // TODO: Reduce redundancy

  main {
    display: grid;
    grid-template-rows: repeat(3, 1fr);
    align-items: center;
    justify-content: center;

    width: 64px;
    height: calc(100% - 1em);
    padding-top: 0.5em;
    padding-bottom: 0.5em;

    border-left: 1px solid var(--border-color-1);

    section.first {
      align-self: start;
    }

    section.last {
      align-self: end;
    }

    span {
      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;

      width: 45px;
      height: 37px;
      margin: 0.25em;

      border: 1px solid transparent;
      border-radius: 0.35em;

      transition:
        background 100ms,
        border 100ms;

      @media (hover: hover) and (pointer: fine) {

        &:not(.disabled):hover {
          background: var(--border-color-1);
          border: 1px solid var(--border-color-1-hover);
        }
      }
    }

    .playbackStatus {
      cursor: pointer;

      position: absolute;
      top: 0;
      right: 0;

      width: 3px;
      height: 100vh;

      div {
        width: 3px;
        background: var(--border-color-1);
        transition: height 150ms;
      }

      video {
        position: absolute;
        right: 1em;
        transform: translateY(-50%);

        display: none;

        height: 85px;

        border-radius: 5px;
      }

      &:hover video {
        display: block;
      }
    }
  }
</style>
