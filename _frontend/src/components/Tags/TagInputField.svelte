<script lang="ts">
  import type { PageData } from "../../routes/[cluster]/$types"
  import { page } from "$app/stores"
  import { createEventDispatcher, onMount } from "svelte"
  import FuzzySearch from "fuzzy-search"
  import { controller } from "$lib/stores"
  import { readable } from "svelte/store"

  let value: string
  let focused = false
  export let alwaysExpanded = false

  let selectionIndex = -1
  let inputElement: HTMLInputElement

  export function focus() {
    inputElement.focus()
  }

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
        e.preventDefault()
        dispatch("selected", results[0])
        value = ""
        break
      default:
        selectionIndex = -1
        break
    }
  }

  //   TODO: this should be all and not just some of the tags (aka: should ignore filters)
  $: ({ tags } = $controller?.tagsController ?? readable({ tags: [] }))

  $: searcher = new FuzzySearch($tags, ["tag"], {
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
    bind:this={inputElement}
    type="text"
    on:focusin={() => (focused = true)}
    on:focusout={() => (focused = false)}
    bind:value
    on:keydown|stopPropagation={handleKeyDown}
    class:alwaysExpanded
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
      width: $height;
      height: $height;
      transition: width 200ms;

      &:focus,
      &.alwaysExpanded {
        width: $width;
      }
    }

    .results {
      position: absolute;
      z-index: 10;
      top: $height + 8px;
      left: 0;

      display: grid;

      background: var(--color-dark-level-1);
      border: 1px solid var(--border-color-1);

      span {
        overflow: hidden;
        display: block;

        padding: 0.5em;

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
