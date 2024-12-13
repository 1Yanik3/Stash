<script lang="ts">
  import { createEventDispatcher } from "svelte"

  import { page } from "$app/stores"
  import Icon from "$components/elements/Icon.svelte"
  import TagChip from "$components/Tags/TagChip.svelte"
  import {
    mediaController,
    type MediaType
  } from "$lib/controllers/MediaController.svelte"

  import GridThumbnail from "./GridThumbnail.svelte"

  const dispatch = createEventDispatcher()


  interface Props {
    selectedMedia: string[];
    medium: MediaType;
    parent?: boolean;
    sub?: boolean;
  }

  let {
    selectedMedia = $bindable(),
    medium,
    parent = false,
    sub = false
  }: Props = $props();

  const leftClick = (e: MouseEvent) => {
    if (e.metaKey) {
      mediaController.visibleMedium = null
      if (selectedMedia.includes(medium.id))
        selectedMedia = selectedMedia.filter(j => j != medium.id)
      else selectedMedia = [...selectedMedia, medium.id]
    } else {
      selectedMedia = []
      if (parent) {
        dispatch("click")
      } else {
        mediaController.visibleMedium = medium
      }
    }
  }

  let showSeekPreview = $state(false)
  let thumbElement: HTMLDivElement = $state()
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
      console.log(seekVideo.currentTime)
    }
  }
</script>

<main
  onmouseup={e => leftClick(e)}
  class:active={mediaController.visibleMedium == medium && !parent}
  class:selected={selectedMedia.includes(medium.id)}
  class:sub
  onmousemove={processSeeking}
  ontouchmove={processSeeking}
>
  <div class="thumb" bind:this={thumbElement}>
    <GridThumbnail {medium} i={-1} disableActive rigidAspectRatio disableZoom />
    {#if showSeekPreview}
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

            object-fit: cover;
        "
      >
        <track kind="captions" />
      </video>
    {/if}
  </div>

  <div class="details">
    {#if parent}
      {#await fetch(`/api/group-together/${medium.groupedIntoNamesId}`).then( response => response.text() ) then name}
        <b>
          <Icon name="mdiCardMultiple" size={0.8} />
          {name}
        </b>
      {/await}
    {:else}
      {#key mediaController.visibleMedium == medium ? mediaController.visibleMedium : null}
        <b>{medium.name}</b>
      {/key}
    {/if}
  </div>

  {#key mediaController.visibleMedium == medium ? mediaController.visibleMedium : null}
    <div class="tags">
      {#each medium.tags as tag}
        <TagChip {tag} compact />
      {/each}
    </div>
  {/key}
</main>

<style lang="scss">
  main {
    user-select: none;

    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 0.5em;

    padding: 1em;

    border: 1px solid transparent;
    border-radius: 0.5em;

    transition: all 200ms;

    &.sub {
      margin-left: 3em;
    }

    &.active {
      background: var(--color-dark-level-1-hover);
      border: 1px solid var(--border-color-1-hover);
      box-shadow:
        rgba(0, 0, 0, 0.2) 0px 1px 3px 0px,
        rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;
    }

    &.selected {
      background: var(--color-dark-level-2-hover);
      border: 1px solid var(--border-color-2-hover);
      box-shadow:
        rgba(68, 68, 68, 0.2) 0px 1px 3px 0px,
        rgba(68, 68, 68, 0.12) 0px 1px 2px 0px;
    }

    .details {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 35px;

      b {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;

        font-weight: bold;
        text-overflow: ellipsis;
      }
    }

    .tags {
      overflow: scroll;
      display: flex;
      margin: -2.25px;
    }

    .thumb {
      position: relative;
    }

    @media (hover: hover) and (pointer: fine) {

      &:hover {
        background: var(--color-dark-level-1-hover);
        border: 1px solid var(--border-color-1-hover);
        box-shadow:
          rgba(0, 0, 0, 0.2) 0px 1px 3px 0px,
          rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;
      }
    }
  }
</style>
