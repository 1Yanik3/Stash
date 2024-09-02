<script lang="ts">
  import { onMount } from "svelte"
  import { fade } from "svelte/transition"

  import { page } from "$app/stores"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { tagsController } from "$lib/controllers/TagsController.svelte"

  import type { PageData } from "../../routes/[cluster]/$types"

  $: pageData = $page.data as PageData

  let data: {
    tagId: number
    tagTag: string
    mediaId: number
  }[] = []

  onMount(async () => {
    const res = await fetch(`/api/cluster/${pageData.cluster.id}/index`)
    data = await res.json()
  })

  let filter = ""
</script>

<main transition:fade={{ duration: 150 }}>
  <div class="search">
    <label>
      Search
      <input type="search" bind:value={filter} />
    </label>
  </div>

  {#each data.filter(d => d.tagTag.includes(filter.toLowerCase())) as d}
    <span
      class="tag"
      onclick={() => {
        const matchingTag = tagsController.tags_flat.find(t => t.id == d.tagId)

        if (matchingTag) mediaController.filters.selectedTags = [matchingTag]
      }}
    >
      <img
        src={`${$page.data.serverURL}/api/media/${d.mediaId}/thumbnail`}
        alt=""
      />

      <span>{d.tagTag}</span>
    </span>
  {/each}
</main>

<style lang="scss">
  main {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    margin: -0.5em;

    .search {
      grid-column: 1 / -1;
      width: 100%;
    }
  }

  .tag {
    cursor: pointer;

    display: grid;
    grid-template-rows: 300px 1.8em;
    gap: 0.5em;
    align-items: center;
    justify-content: center;

    margin: 0.5em;

    text-decoration: none;

    background: #212121;
    border-radius: 0.4em;
    box-shadow:
      rgba(0, 0, 0, 0.2) 0px 1px 3px 0px,
      rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;

    transition:
      filter 200ms,
      transform 200ms;

    span {
      padding-bottom: 0.6em;
      text-align: center;
    }

    img {
      width: 100%;
      height: 100%;

      object-fit: cover;
      border-top-left-radius: 0.4em;
      border-top-right-radius: 0.4em;
    }

    @media (hover: hover) and (pointer: fine) {

      &:hover {
        transform: scale(1.03);
        filter: brightness(0.85);
      }
    }
  }
</style>
