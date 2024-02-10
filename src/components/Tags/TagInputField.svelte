<script lang="ts">
  import type { PageData } from "../../routes/[cluster]/$types"
  import { page } from "$app/stores"
  import { createEventDispatcher } from "svelte"
  import FuzzySearch from "fuzzy-search"

  let value: string
  let focused = false

  let selectionIndex = -1

  const dispatch = createEventDispatcher()

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        if (selectionIndex > 0) selectionIndex--
        break
      case "ArrowDown":
        if (selectionIndex <= results.length) selectionIndex++
        break
      case "Enter":
        if (selectionIndex >= 0) dispatch("selected", results[selectionIndex])
        else dispatch("selected", value)
        break
      case "Tab":
        dispatch("selected", results[0])
        break
      default:
        selectionIndex = -1
        break
    }
  }

  $: searcher = new FuzzySearch(($page.data as PageData).tags, ["tag"], {
    caseSensitive: false,
    sort: true
  })
  $: results = searcher
    .search(value)
    .slice(0, 10)
    .map(t => t.tag.join("/"))
</script>

<main>
  <input
    type="text"
    on:focusin={() => (focused = true)}
    on:focusout={() => (focused = false)}
    bind:value
    on:keydown|stopPropagation={handleKeyDown}
  />

  {#if value?.length > 0 && focused}
    <div class="results">
      {#each results as result, i}
        <!-- TODO: Add count -->
        <span class:active={i == selectionIndex}>{result}</span>
      {/each}
    </div>
  {/if}
</main>

<style lang="scss">
  $height: 25px;
  $width: 13em;

  main {
    position: relative;

    input {
      height: $height;
      width: $height;
      transition: width 200ms;

      &:focus {
        width: $width;
      }
    }

    .results {
      position: absolute;
      top: $height + 8px;
      left: 0;

      display: grid;

      background: $color-dark-level-1;
      border: 1px solid $border-color-1;

      span {
        display: block;
        padding: 0.5em;

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        transition: background 150ms;

        &.active {
          background: #303030;
        }
      }
    }
  }
</style>
