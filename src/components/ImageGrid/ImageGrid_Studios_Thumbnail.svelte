<script lang="ts">
  import { visibleMedium } from "$lib/stores"
  import GridThumbnail from "./GridThumbnail.svelte"
  import type { Media } from "@prisma/client"
  import { createEventDispatcher } from "svelte"
  import Icon from "$components/Icon.svelte"
  import TagChip from "$components/Tags/TagChip.svelte"

  const dispatch = createEventDispatcher()

  export let selectedMedia: string[]
  export let medium: Media

  export let parent = false
  export let sub = false

  const leftClick = (e: MouseEvent) => {
    if (e.metaKey) {
      visibleMedium.set(null)
      if (selectedMedia.includes(medium.id))
        selectedMedia = selectedMedia.filter(j => j != medium.id)
      else selectedMedia = [...selectedMedia, medium.id]
    } else {
      selectedMedia = []
      if (parent) {
        dispatch("click")
      } else {
        visibleMedium.set(medium)
      }
    }
  }
</script>

<main
  on:mouseup={e => leftClick(e)}
  class:active={$visibleMedium == medium && !parent}
  class:selected={selectedMedia.includes(medium.id)}
  class:sub
>
  <div class="thumb">
    <GridThumbnail {medium} i={-1} disableActive />
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
      {#key $visibleMedium == medium ? $visibleMedium : null}
        <b>{medium.name}</b>
      {/key}
      <span>
        {medium.width}x{medium.height}
      </span>
    {/if}
  </div>

  {#key $visibleMedium == medium ? $visibleMedium : null}
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

    display: grid;
    grid-template-columns: 160px 1fr;
    grid-template-rows: 1fr auto;

    padding: 1em;

    border: 1px solid transparent;
    border-radius: 0.5em;

    transition: all 200ms;

    &.sub {
      margin-left: 3em;
    }

    &.active {
      background: #212121;
      border: 1px solid hsl(0, 0%, 22%);
      box-shadow:
        rgba(0, 0, 0, 0.2) 0px 1px 3px 0px,
        rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;
    }

    &.selected {
      background: hsl(0, 0%, 27%);
      border: 1px solid hsl(0, 0%, 36%);
      box-shadow:
        rgba(68, 68, 68, 0.2) 0px 1px 3px 0px,
        rgba(68, 68, 68, 0.12) 0px 1px 2px 0px;
    }

    .thumb {
      grid-row: span 2;
      width: 160px;
    }

    .details {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 0.25em;

      margin: 0.5em;
      margin-top: 0;
      margin-bottom: 0;
      margin-left: 0.75em;

      b {
        overflow: hidden;
        display: -webkit-box;
        -webkit-box-orient: vertical;

        font-weight: bold;
        text-overflow: ellipsis;

        -webkit-line-clamp: 2;
      }
    }

    .tags {
      display: flex;
      margin-top: 5.5px;
      margin-bottom: 5.5px;
      margin-left: 0.75em;
    }

    @media (hover: hover) and (pointer: fine) {

      &:hover {
        background: #212121;
        border: 1px solid hsl(0, 0%, 22%);
        box-shadow:
          rgba(0, 0, 0, 0.2) 0px 1px 3px 0px,
          rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;
      }
    }
  }
</style>
