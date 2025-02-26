<script lang="ts">
  import { fade } from "svelte/transition"

  import { page } from "$app/stores"
  import Icon from "$components/elements/Icon.svelte"
  import imageRetry from "$lib/actions/imageRetry.svelte"
  import { setSpecialFilterAttribute } from "$lib/client/actions/mediaActions.svelte"
  import { SUBJECT_TYPES } from "$lib/constants"
  import {
    mediaController,
    type MediaType
  } from "$lib/controllers/MediaController.svelte"
  import { selectedMediaIds } from "$lib/stores.svelte"
  import vars from "$lib/vars.svelte"
  import varsSvelte from "$lib/vars.svelte"
  import IntersectionObserver from "$reusables/IntersectionObserver.svelte"

  interface Props {
    medium: MediaType
    disableActive?: boolean
    rigidAspectRatio?: boolean
    disableZoom?: boolean
  }

  let {
    medium,
    disableActive = false,
    rigidAspectRatio = false,
    disableZoom = false
  }: Props = $props()

  const dragStartHandler = (e: DragEvent) => {
    e.stopPropagation()
    e.dataTransfer?.setData("text/plain", `mediaId_${medium.id}`)
  }

  let element: HTMLDivElement = $state() as any

  $effect(() => {
    if (mediaController.visibleMedium?.id == medium.id) {
      element.scrollIntoView({
        block: "nearest",
        behavior: "smooth"
      })
      setTimeout(() => {
        element.scrollIntoView({
          block: "nearest",
          behavior: "smooth"
        })
      }, 150)
    }
  })

  const leftClick = (e: MouseEvent) => {
    if (e.metaKey) {
      mediaController.visibleMedium = null
      if ($selectedMediaIds.includes(medium.id))
        selectedMediaIds.set($selectedMediaIds.filter(j => j != medium.id))
      else selectedMediaIds.set([...$selectedMediaIds, medium.id])
    } else {
      selectedMediaIds.set([])
      mediaController.visibleMedium = medium
    }
  }

  let suffix = $derived(
    vars.thumbnailSuffixParameter &&
      vars.thumbnailSuffixParameter.mediaId == medium.id
      ? `?${vars.thumbnailSuffixParameter.suffix}`
      : ""
  )

  // TODO: Move to a separate file (with the use directive?)
  let showSeekPreview = $state(false)
  let thumbElement: HTMLDivElement = $state() as any
  let seekVideo: HTMLVideoElement | null = $state(null)
  const processSeeking = (e: MouseEvent | TouchEvent) => {
    showSeekPreview = e.shiftKey
    if (showSeekPreview && seekVideo) {
      const startX = thumbElement.getBoundingClientRect().left
      const endX = thumbElement.getBoundingClientRect().right
      const playbackPercentage =
        // @ts-ignore
        (((e.clientX || e.touches[0].clientX) - startX) / (endX - startX)) * 100

      seekVideo.currentTime = (seekVideo.duration / 100) * playbackPercentage
    }
  }

  let isBeingHovered = $state(false)

  const captureKeydownEventWhenHovering = (e: KeyboardEvent) => {
    if (isBeingHovered) {
      let newValue: (typeof SUBJECT_TYPES)[number]["value"] | null = null

      if (e.key == "1") newValue = "solo"
      else if (e.key == "2") newValue = "two"
      else if (e.key == "3") newValue = "three"
      else if (e.key == "4") newValue = "group"
      else throw "Invalid special filter attribute"

      setSpecialFilterAttribute(medium, newValue)
    }
  }
</script>

<svelte:document onkeydown={captureKeydownEventWhenHovering} />

<svelte:head>
  <link
    rel="preload"
    as="image"
    href="{$page.data.serverURL}/thumb/{medium.id}.webp"
    crossorigin="use-credentials"
  />
</svelte:head>

<IntersectionObserver
  on:click={e => leftClick(e.detail)}
  once
  top={500}
  style={`position: relative`}
>
  {#snippet children({ intersecting })}
    <div
      ondragstart={dragStartHandler}
      bind:this={element}
      class:selected={$selectedMediaIds.includes(medium.id)}
      class:rigidAspectRatio
      onmousemove={processSeeking}
      ontouchmove={processSeeking}
      onmouseenter={() => (isBeingHovered = true)}
      onmouseleave={() => (isBeingHovered = false)}
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

      {#if intersecting}
        <img
          use:imageRetry
          in:fade={{ duration: 100 }}
          src={`${$page.data.serverURL}/thumb/${medium.id}.webp${suffix}`}
          alt={medium.name}
          class:active={!disableActive &&
            mediaController.visibleMedium?.id == medium.id}
          crossorigin="use-credentials"
          class:disableZoom
          bind:this={thumbElement}
        />

        {#if medium.type.startsWith("video") && showSeekPreview}
          <video
            src="{$page.data.serverURL}/thumb/{medium.id}_seek.webm"
            bind:this={seekVideo}
            muted
            crossorigin="use-credentials"
            preload="auto"
            style="
                position: absolute;
                z-index: 100;
                top: 0; left: 0;

                width: 100%;
                height: 100%;
                border-radius: 3px;

                object-fit: cover;
            "
          >
            <track kind="captions" />
          </video>
        {/if}

        {#if medium.favourited}
          <div style="position: absolute; right: 0.25em; bottom: 0.25em;">
            <Icon name="mdiStar" size={0.8} />
          </div>
        {/if}

        {#if varsSvelte.isInSubjectEditingMode}
          <div style="position: absolute; bottom: 0.25em; left: 0.25em;">
            {#if SUBJECT_TYPES.some(s => s.value == medium.specialFilterAttribute || medium.specialFilterAttributeGuess)}
              <Icon
                nameAlt={SUBJECT_TYPES.find(
                  s => s.value == medium.specialFilterAttribute
                )?.icon}
              />
            {:else}
              <Icon name="mdiHelp" />
            {/if}
          </div>
        {/if}
      {/if}
    </div>
  {/snippet}
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
      &:not(.disableZoom):hover {
        transform: scale(1.04);
        filter: brightness(0.85);
      }
    }
  }

  div {
    scroll-margin: 11px;

    -webkit-tap-highlight-color: transparent;
    // height: calc(100% - 2px);
    // position: relative;

    &.selected img {
      outline: 3px solid hsl(0, 0%, 36%);
    }

    &.rigidAspectRatio {
      aspect-ratio: 16/9;

      img {
        object-fit: cover;
      }
    }
  }
</style>
