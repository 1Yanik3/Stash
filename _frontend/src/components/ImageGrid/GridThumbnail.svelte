<script lang="ts">
  import type { Media } from "@prisma/client"

  import { page } from "$app/stores"
  import Icon from "$components/Icon.svelte"
  import {
    selectedMediaIds,
    thumbnailSuffixParameter,
    visibleMedium
  } from "$lib/stores"
  import IntersectionObserver from "$reusables/IntersectionObserver.svelte"

  export let i: number
  export let medium: Media
  export let disableActive = false

  const dragStartHandler = (e: DragEvent) => {
    e.dataTransfer?.setData("text/plain", `mediaId_${medium.id}`)
  }

  let element: HTMLDivElement
  // visibleMedium.subscribe(async () => {
  //     if (!element) return

  //     const r = element.getBoundingClientRect()
  //     if ($visibleMedium == medium && !(
  //         r.top >= 210 &&
  //         r.bottom <= (window.innerHeight - 210)
  //     )) {
  //         element.scrollIntoView({
  //             block: "nearest",
  //             behavior: "smooth"
  //         })
  //     }
  // })

  const leftClick = (e: MouseEvent) => {
    if (e.metaKey) {
      visibleMedium.set(null)
      if ($selectedMediaIds.includes(medium.id))
        selectedMediaIds.set($selectedMediaIds.filter(j => j != medium.id))
      else selectedMediaIds.set([...$selectedMediaIds, medium.id])
    } else {
      selectedMediaIds.set([])
      visibleMedium.set(medium)
    }
  }

  let suffix = ""
  thumbnailSuffixParameter.subscribe(() => {
    if ($thumbnailSuffixParameter == null) {
      suffix = ""
      return
    }
    if ($thumbnailSuffixParameter.mediaId == medium.id)
      suffix = `?${$thumbnailSuffixParameter.suffix}`
  })
</script>

<IntersectionObserver
  on:click={e => leftClick(e.detail)}
  once={true}
  top={500}
  let:intersecting
  style={`position: relative`}
>
  <div
    on:dragstart|stopPropagation={dragStartHandler}
    bind:this={element}
    class:selected={$selectedMediaIds.includes(medium.id)}
  >
    <svg
      viewBox={`0 0 ${medium.width} ${medium.height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width={medium.width}
        height={medium.height}
        x="0"
        y="0"
        fill="var(--color-lowest)"
      />
    </svg>

    {#if intersecting || i == 0}
      {#await new Promise(resolve => resolve(true)) then}
        <img
          src={`${$page.data.serverURL}/api/media/${medium.id}/thumbnail${suffix}`}
          alt={medium.name}
          class:active={!disableActive && $visibleMedium == medium}
          crossorigin="use-credentials"
        />
      {/await}

      {#if medium.favourited}
        <div style="position: absolute; right: 0.25em; bottom: 0.25em;">
          <Icon name="mdiStar" size={0.8} />
        </div>
      {/if}
    {/if}
  </div>
</IntersectionObserver>

<style lang="scss">
  img {
    cursor: pointer;

    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;

    width: 100%;
    height: 100%;

    border-radius: 3px;
    box-shadow:
      rgba(0, 0, 0, 0.2) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;

    transition:
      filter 200ms,
      transform 200ms;

    &.active {
      transform: scale(1.04);
    }

    @media (hover: hover) and (pointer: fine) {

      &:hover {
        transform: scale(1.04);
        filter: brightness(0.85);
      }
    }
  }

  div {
    scroll-margin: 11px;
    // height: calc(100% - 2px);
    // position: relative;

    &.selected img {
      outline: 3px solid hsl(0, 0%, 36%);
    }
  }
</style>
