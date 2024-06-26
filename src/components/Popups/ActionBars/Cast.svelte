<script lang="ts">
  import { browser } from "$app/environment"
  import { onMount } from "svelte"
  import { controller, visibleMedium } from "$lib/stores"
  import Icon from "../../Icon.svelte"
  import { fade } from "svelte/transition"

  let socket: WebSocket | null = null
  let blank = false
  let videoPlaying = true
  let currentTime = 0
  let playbackProgress = 0
  let playbackDuration = 1
  $: audioPaused = !videoPlaying

  let audioDestination: "mute" | "local" | "remote" = "mute"

  visibleMedium.subscribe(() => (videoPlaying = true))

  const sendMessage = (message: string) => {
    if (!socket) return
    if (!socket.OPEN) return

    socket.send(message)
  }

  onMount(async () => {
    if (!browser) return

    const pairingCode =
      (await $controller.prompt().text("Enter pairing code:")) || ""
    const url = `wss://pubSub.any.gay/${pairingCode}`
    socket = new WebSocket(url)

    socket.addEventListener("open", () => {
      visibleMedium.subscribe(() => {
        if (!socket) return console.log("socket is null")
        if (!$visibleMedium) {
          socket.send("paired")
          return
        }
        const type = $visibleMedium.type.startsWith("video") ? "video" : "image"
        socket.send(`${type}: ${$visibleMedium.id}`)
      })
    })
    socket.addEventListener("message", event => {
      console.log(event.data)
      if (event.data.startsWith("progress-video: ")) {
        playbackProgress = Number(event.data.replace("progress-video: ", ""))
      }
      if (event.data.startsWith("audio-position: ")) {
        currentTime = Number(event.data.replace("audio-position: ", ""))
      }
      if (event.data.startsWith("duration-video: ")) {
        playbackDuration = Number(event.data.replace("duration-video: ", ""))
      }
    })
    socket.addEventListener("close", () => {
      window.alert("close")
      socket = socket = new WebSocket(url)
    })
    socket.addEventListener("error", () => {
      window.alert("error")
      socket = socket = new WebSocket(url)
    })
  })
</script>

{#if $visibleMedium && $visibleMedium.type.startsWith("video") && audioDestination == "local"}
  <!-- svelte-ignore a11y-media-has-caption -->
  <video
    src="https://stash.hera.lan/file/{$visibleMedium?.id}"
    bind:currentTime
    bind:paused={audioPaused}
    autoplay
    style="display: none"
  ></video>
{/if}

<main>
  <section class="first">
    <span
      on:click={() => {
        sendMessage("blank")
        visibleMedium.set(null)
        $controller.setActionBar(null)
      }}
    >
      <Icon name="mdiClose" size={0.8} />
    </span>

    <span
      on:click={() => {
        sendMessage(blank ? "unblank" : "blank")
        blank = !blank
      }}
    >
      <Icon
        name={blank ? "mdiProjectorScreenOff" : "mdiProjectorScreen"}
        size={0.8}
      />
    </span>
  </section>

  <section>
    <!-- {#if $visibleMedium?.type.startsWith("image")}

        {/if} -->
    {#if $visibleMedium?.type.startsWith("video")}
      <!-- go forward 60 sec -->
      <span
        on:click={() => sendMessage("control-video: backward-60")}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiRewind60" size={0.8} />
      </span>

      <!-- go forward 15 sec -->
      <span
        on:click={() => sendMessage("control-video: backward-15")}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiRewind15" size={0.8} />
      </span>

      <!-- play/pause -->
      <span
        on:click={() => {
          if (videoPlaying) sendMessage("control-video: pause")
          else sendMessage("control-video: play")
          videoPlaying = !videoPlaying
        }}
        transition:fade={{ duration: 100 }}
      >
        <Icon name={videoPlaying ? "mdiPause" : "mdiPlay"} size={0.8} />
      </span>

      <!-- go forward 15 sec -->
      <span
        on:click={() => sendMessage("control-video: forward-15")}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiFastForward15" size={0.8} />
      </span>

      <!-- go forward 60 sec -->
      <span
        on:click={() => sendMessage("control-video: forward-60")}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiFastForward60" size={0.8} />
      </span>
    {/if}
  </section>

  <section class="last">
    <!-- audio destination selector -->
    <span
      on:click={() => {
        switch (audioDestination) {
          case "mute":
            audioDestination = "local"
            break
          case "local":
            audioDestination = "remote"
            sendMessage("control-video: unmute")
            break
          case "remote":
            audioDestination = "mute"
            sendMessage("control-video: mute")
            break
        }
      }}
      transition:fade={{ duration: 100 }}
    >
      <Icon
        name={audioDestination === "mute"
          ? "mdiVolumeMute"
          : audioDestination === "local"
            ? "mdiSpeaker"
            : "mdiCastAudio"}
        size={0.8}
      />
    </span>

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
        sendMessage(
          `control-video: seek-${
            (e.clientY / window.innerHeight) * playbackDuration
          }`
        )
      }}
    >
      <div style:height="{(playbackProgress / playbackDuration) * 100}%" />
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

    border-left: 1px solid hsl(0, 0%, 22%);

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
          background: hsl(0, 0%, 22%);
          border: 1px solid hsl(0, 0%, 24%);
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
        background: hsl(0, 0%, 22%);
        transition: height 150ms;
      }
    }
  }
</style>
