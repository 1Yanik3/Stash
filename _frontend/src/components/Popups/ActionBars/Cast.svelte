<script lang="ts">
  import { browser } from "$app/environment"
  import { onMount } from "svelte"
  import { controller, visibleMedium } from "$lib/stores"
  import Icon from "../../Icon.svelte"
  import { fade } from "svelte/transition"
  import type Castjs from "$lib/client/cast-js"
  import type { Media } from ".prisma/client"

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

  const cast = (media = $visibleMedium) => {
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
  visibleMedium.subscribe(newValue => {
    if (connected) cast(newValue)
  })
</script>

<main>
  <section class="first">
    {#if connected}
      <span
        class:disabled={!$visibleMedium}
        on:click={() => {
          console.info("disconnect")
          cjs?.disconnect()
        }}
      >
        <Icon name="mdiCastOff" size={0.8} />
      </span>
    {:else}
      <span class:disabled={!$visibleMedium} on:click={() => cast()}>
        <Icon name="mdiCast" size={0.8} />
      </span>
    {/if}

    {#if $visibleMedium}
      <span
        on:click={() => {
          visibleMedium.set(null)
        }}
      >
        <Icon name={"mdiBackspaceOutline"} size={0.8} />
      </span>
    {/if}
  </section>

  <section>
    <!-- {#if $visibleMedium?.type.startsWith("image")}

        {/if} -->
    {#if $visibleMedium?.type.startsWith("video")}
      <!-- go forward 60 sec -->
      <span
        on:click={() => cjs?.seek(currentTime - 60, false)}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiRewind60" size={0.8} />
      </span>

      <!-- go forward 15 sec -->
      <span
        on:click={() => cjs?.seek(currentTime - 15, false)}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiRewind15" size={0.8} />
      </span>

      <!-- play/pause -->
      <span
        on:click={() => {
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
        on:click={() => cjs?.seek(currentTime + 15, false)}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiFastForward15" size={0.8} />
      </span>

      <!-- go forward 60 sec -->
      <span
        on:click={() => cjs?.seek(currentTime + 60, false)}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiFastForward60" size={0.8} />
      </span>
    {/if}
  </section>

  <section class="last">
    <span on:click={() => $controller.goToPreviousMedia()}>
      <Icon name="mdiChevronLeft" size={0.8} />
    </span>
    <span on:click={() => $controller.goToNextMedia()}>
      <Icon name="mdiChevronRight" size={0.8} />
    </span>
  </section>

  {#if $visibleMedium?.type.startsWith("video")}
    <div
      class="playbackStatus"
      on:click={e => {
        cjs?.seek((e.clientY * 100) / window.innerHeight, true)
      }}
    >
      <div style:height="{playbackProgress}%" />
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
    }
  }
</style>
