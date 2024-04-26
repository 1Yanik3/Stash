<script lang="ts">
  import { page } from "$app/stores"
  import { videoElement, visibleMedium } from "$lib/stores"

  let video: HTMLVideoElement
  $: videoElement.set(video)
</script>

<main>
  <video
    src={`${$page.data.serverURL}/file/${$visibleMedium?.id}`}
    controls
    autoplay
    bind:this={video}
    on:playing={() => {
      if (video.duration <= 5) video.loop = true
    }}
    crossorigin="use-credentials"
  >
    <track kind="captions" />
  </video>
</main>

<style lang="scss">
  main {
    position: relative;
    width: 100%;
    height: 100%;

    video {
      position: absolute;
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }
</style>
