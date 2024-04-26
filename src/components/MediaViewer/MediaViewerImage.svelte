<script lang="ts">
  import { page } from "$app/stores"
  import { visibleMedium } from "$lib/stores"

  let mainElement: HTMLElement
  let imageElement: HTMLImageElement

  let zoomMode: "none" | "original" | "fit" = "none"

  const toggleZoom = (e: MouseEvent) => {
    if (zoomMode == "none" && e.button == 0) {
      const targetCords = {
        left: e.offsetX / imageElement.width,
        top: e.offsetY / imageElement.height
      }

      zoomMode = "original"
      imageElement.style.height = "unset"
      imageElement.style.width = "unset"
      imageElement.height = mainElement.clientHeight
      imageElement.width = mainElement.clientWidth
      ;(() => {
        mainElement.scrollTo({
          top:
            targetCords.top * imageElement.height -
            mainElement.clientHeight / 2,
          left:
            targetCords.left * imageElement.width - mainElement.clientWidth / 2
        })
      })()

      return
    }

    if (zoomMode == "none" && e.button == 2) {
      zoomMode = "fit"

      const targetCords = {
        left: e.offsetX / imageElement.width,
        top: e.offsetY / imageElement.height
      }

      if (
        imageElement.naturalWidth / mainElement.clientWidth >
        imageElement.naturalHeight / mainElement.clientHeight
      ) {
        imageElement.style.height = "100%"
        imageElement.style.width = "unset"
      } else {
        imageElement.style.height = "unset"
        imageElement.style.width = "100%"
      }

      ;(() => {
        mainElement.scrollTo({
          top:
            targetCords.top * imageElement.height -
            mainElement.clientHeight / 2,
          left:
            targetCords.left * imageElement.width - mainElement.clientWidth / 2
        })
      })()

      return
    }

    zoomMode = "none"
    imageElement.style.height = "100%"
    imageElement.style.width = "100%"
  }
</script>

<main bind:this={mainElement}>
  <img
    bind:this={imageElement}
    on:mousedown={toggleZoom}
    on:contextmenu={e => e.preventDefault()}
    style:cursor={zoomMode == "none" ? "zoom-in" : "zoom-out"}
    src={`${$page.data.serverURL}/file/${$visibleMedium?.id}`}
    crossorigin="use-credentials"
    alt={$visibleMedium?.name}
  />
</main>

<style lang="scss">
  main {
    position: relative;
    overflow: scroll;
    width: 100%;
    height: 100%;

    img {
      position: absolute;
      top: 0;
      left: 0;

      width: 100%;
      height: 100%;

      object-fit: contain;
    }
  }
</style>
