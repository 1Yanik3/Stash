<script lang="ts">
  import type { Media } from "@prisma/client"
  import { createEventDispatcher } from "svelte"

  import Icon from "$components/Icon.svelte"
  import TagChip from "$components/Tags/TagChip.svelte"
  import { visibleMedium } from "$lib/stores"

  import GridThumbnail from "./GridThumbnail.svelte"

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
    <GridThumbnail {medium} i={-1} disableActive rigidAspectRatio disableZoom />
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
      background: #212121;
      border: 1px solid var(--border-color-1);
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

    .details {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 35px;

      //   margin: 0.5em;
      //   margin-top: 0;
      //   margin-bottom: 0;
      //   margin-left: 0.75em;

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
      //   margin-top: 5.5px;
      //   margin-bottom: 5.5px;
      //   margin-left: 0.75em;
    }

    @media (hover: hover) and (pointer: fine) {

      &:hover {
        background: #212121;
        border: 1px solid var(--border-color-1);
        box-shadow:
          rgba(0, 0, 0, 0.2) 0px 1px 3px 0px,
          rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;
      }
    }
  }
</style>
