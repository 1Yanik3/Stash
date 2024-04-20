<script lang="ts">
  import type { Media } from "@prisma/client"
  import GridThumbnail from "./GridThumbnail.svelte"
  import { invalidate } from "$app/navigation"

  export let medium: Media & { disabled?: Boolean; expanded?: Boolean }
  export let children: Media[] = []
  export let indent = 0

  // TODO: Remove duplication
  const handleTagsKeyDown = (e: KeyboardEvent, medium: Media) => {
    const value: string = (e.target as any).value
    if (e.key == "Enter" && value) {
      fetch(`/api/media/${medium.id}/tag`, {
        method: "PUT",
        body: JSON.stringify({
          name: value
        })
      })
        .then(() => {
          const isInUnsorted =
            medium.tags.length == 1 && medium.tags[0] == "show_unsorted"

          const tmp = medium
          tmp?.tags.push(value)
          medium = tmp
          ;(e.target as any).value = ""

          if (isInUnsorted) {
            removeTagFromMedia("show_unsorted", medium)
          } else {
            invalidate("media-and-tags")
          }
        })
        .catch(console.error)
    }
  }

  // TODO: Remove duplication
  const removeTagFromMedia = (tag: string, medium: Media) => {
    fetch(`/api/media/${medium.id}/tag/${tag}`, {
      method: "DELETE"
    }).then(() => {
      if (!medium) return
      const tmp = medium
      tmp.tags = tmp.tags.filter(t => t != tag)
      medium = tmp

      invalidate("media-and-tags")
    })
  }
</script>

{#if children.length}
  <main>
    <div class="thumbnail">
      <GridThumbnail {medium} i={-1} disableActive />
    </div>
    {#await fetch(`/api/group-together/${medium.groupedIntoNamesId}`).then( response => response.text() ) then name}
      <b
        role="textbox"
        contenteditable
        on:input={e => {
          fetch(`/api/group-together/${medium.groupedIntoNamesId}`, {
            method: "PUT",
            body: JSON.stringify({
              // @ts-ignore
              name: e.target.innerText
            })
          })
        }}
      >
        {name}
      </b>
    {/await}
  </main>

  {#each children as child}
    <svelte:self medium={child} indent={1} />
  {/each}
{:else}
  <main class:indented={indent > 0}>
    <div class="thumbnail">
      <GridThumbnail {medium} i={-1} disableActive />
    </div>
    <span
      role="textbox"
      contenteditable
      bind:innerText={medium.name}
      on:input={e => {
        fetch(`/api/media/${medium.id}/rename`, {
          method: "PUT",
          body: JSON.stringify({
            name: medium.name
          })
        })
      }}
    />
    <div class="tags">
      {#each medium.tags as tag}
        <span class="tag" on:contextmenu={() => removeTagFromMedia(tag, medium)}
          >{tag}</span
        >
      {/each}

      <input
        type="text"
        on:keydown|stopPropagation={e => handleTagsKeyDown(e, medium)}
      />
    </div>
  </main>
{/if}

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: 150px 1fr auto;
    gap: 1em;
    align-items: center;

    &.indented {
      margin-left: 3em;
    }

    b {
      font-weight: 500;
    }

    span {
      overflow: hidden;
    }

    .thumbnail {
      aspect-ratio: 16/9;
    }

    .tags {
      user-select: none;
      gap: 0.5em;
      margin-bottom: 5.5px;
      margin-left: 0.75em;

      .tag {
        margin-right: 0.25em;
        padding: 0.3em 0.4em;

        background: $color-dark-level-2;
        border: 1px solid $border-color-1;
        border-radius: 5px;
      }
    }
  }
</style>
