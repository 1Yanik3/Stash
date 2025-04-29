<script lang="ts">
  import { fade } from "svelte/transition"

  import { page } from "$app/stores"
  import Icon from "$components/elements/Icon.svelte"
  import { FCastController, PlaybackStateState } from "$lib/client/fcast.svelte"
  import { isMobile } from "$lib/context"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { prompts } from "$lib/controllers/PromptController"
  import { controller, settings } from "$lib/stores.svelte"

  let disableSeeking = $state(false)
  let seekVideo: HTMLVideoElement | null = $state(null)
  let client: FCastController | null = $state(null)
  let playbackProgress = $derived(
    client &&
      // @ts-ignore
      (client.playbackState?.time / client.playbackState?.duration) * 100
  )

  $effect(() => {
    if (mediaController.visibleMedium && client)
      client.play(mediaController.visibleMedium)
    else if (!mediaController.visibleMedium && client) client.stop()
  })
</script>

<main>
  <section class="first">
    {#if client}
      <span
        onclick={() => {
          console.info("disconnect")
          client?.disconnect()
        }}
      >
        <Icon name="mdiCastConnected" size={0.8} />
      </span>
    {:else}
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <span
        onclick={async () => {
          console.info("connect")
          const address = await prompts.text(
            "What ip address should I connect to?",
            localStorage.getItem("lastConnectedAddress") || ""
          )
          if (address) {
            localStorage.setItem("lastConnectedAddress", address)
          }
          const remoteAddress = await prompts.text(
            "What addresss does this client use to connect to stash?",
            localStorage.getItem("lastConnectedRemoteAddress") || ""
          )
          if (remoteAddress) {
            localStorage.setItem("lastConnectedRemoteAddress", remoteAddress)
          }
          if (address)
            client = new FCastController(
              address,
              remoteAddress || "https://stash.any.gay"
            )
        }}
      >
        <Icon name="mdiCastOff" size={0.8} />
      </span>
    {/if}

    {#if mediaController.visibleMedium}
      <span onclick={() => (mediaController.visibleMedium = null)}>
        <Icon name={"mdiBackspaceOutline"} size={0.8} />
      </span>
    {/if}
  </section>

  <section>
    {#if mediaController.visibleMedium?.type.startsWith("video")}
      <!-- go backward 60 sec -->
      <span
        class:disabled={!client?.playbackState?.time}
        onclick={() => {
          // @ts-ignore
          client?.seek(client?.playbackState?.time - 60)
        }}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiRewind60" size={0.8} />
      </span>

      <!-- go backward 15 sec -->
      <span
        class:disabled={!client?.playbackState?.time}
        onclick={() => {
          // @ts-ignore
          client?.seek(client?.playbackState?.time - 15)
        }}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiRewind15" size={0.8} />
      </span>

      <!-- play/pause -->
      <span
        class:disabled={!client?.playbackState}
        onclick={() => {
          if (client?.playbackState?.state == PlaybackStateState.PLAYING)
            client?.pause()
          else client?.resume()
        }}
        transition:fade={{ duration: 100 }}
      >
        <Icon
          name={client?.playbackState?.state == PlaybackStateState.PLAYING
            ? "mdiPause"
            : "mdiPlay"}
          size={0.8}
        />
      </span>

      <!-- go forward 15 sec -->
      <span
        class:disabled={!client?.playbackState?.time}
        onclick={() => {
          // @ts-ignore
          client?.seek(client?.playbackState?.time + 15)
        }}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiFastForward15" size={0.8} />
      </span>

      <!-- go forward 60 sec -->
      <span
        class:disabled={!client?.playbackState?.time}
        onclick={() => {
          // @ts-ignore
          client?.seek(client?.playbackState?.time + 60)
        }}
        transition:fade={{ duration: 100 }}
      >
        <Icon name="mdiFastForward60" size={0.8} />
      </span>
    {/if}
  </section>

  <section class="last">
    {#if mediaController.visibleMedium}
      <span
        onclick={() => {
          fetch(`/api/media/${mediaController.visibleMedium?.id}/favourited`, {
            method: "PUT",
            body: JSON.stringify({
              favourited: !mediaController.visibleMedium?.favourited
            })
          })
            .then(() => {
              if (!mediaController.visibleMedium) return
              const tmp = mediaController.visibleMedium
              tmp.favourited = !mediaController.visibleMedium.favourited
              mediaController.visibleMedium = tmp
            })
            .catch(console.error)
        }}
      >
        {#if mediaController.visibleMedium.favourited}
          <Icon name="mdiStar" size={0.8} />
        {:else}
          <Icon name="mdiStarOutline" size={0.8} />
        {/if}
      </span>
      <span onclick={() => $controller.goToPreviousMedia()}>
        <Icon name="mdiChevronLeft" size={0.8} />
      </span>
      <span onclick={() => $controller.goToNextMedia()}>
        <Icon name="mdiChevronRight" size={0.8} />
      </span>
    {/if}
  </section>

  {#if mediaController.visibleMedium?.type.startsWith("video") && client}
    <div
      class="playbackStatus"
      onclick={e => {
        client?.seek(
          (e.clientY / window.innerHeight) *
            (client.playbackState?.duration || 0)
        )
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
      <div style:height="{playbackProgress}%"></div>

      {#if !isMobile.current && !disableSeeking}
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

    background: var(--color-dark-level-1);

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

      &.disabled {
        pointer-events: none;
        opacity: 0.5;
      }

      @media (hover: hover) and (pointer: fine) {

        &:not(.disabled):hover {
          border: 1px solid var(--border-color-1-hover);
          background: var(--border-color-1);
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
