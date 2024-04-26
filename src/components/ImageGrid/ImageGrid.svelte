<script lang="ts">
  import { selectedTags, viewMode, media_store, controller } from "$lib/stores"

  import ImageGridPage from "./ImageGrid_Page.svelte"
  import ImageGridStories from "./ImageGrid_Stories.svelte"
  import ImageGridCollection from "./ImageGrid_Collection.svelte"

  import ImageGridStudios from "./ImageGrid_Studios.svelte"
  import { page } from "$app/stores"

  import type { PageData } from "../../routes/[cluster]/$types"
  import Button from "$components/Button.svelte"
  import ImageGridTable from "./ImageGrid_Table.svelte"
  import { readable } from "svelte/store"
  import { afterNavigate } from "$app/navigation"

  $: pageData = $page.data as PageData
  $: ({ pages } = $controller?.mediaController ?? readable({ pages: [] }))
</script>

{#if pageData.cluster.type == "collection" && !$selectedTags.length}
  <ImageGridCollection />
{:else if pageData.cluster.type == "stories"}
  <ImageGridStories />
{:else}
  {#if pageData.cluster.type == "collection"}
    <div id="collectionGroups">
      {#if $selectedTags.length == 1 && $selectedTags[0].includes("/")}
        <Button
          card
          icon="mdiFolderArrowUpOutline"
          on:click={() =>
            selectedTags.set([
              $selectedTags[0].replace(/\/[^\/]+$/, "").toLowerCase()
            ])}
        >
          {$selectedTags[0].replace(/\/.+$/, "")}
        </Button>
      {/if}

      {#await pageData.streamed_page.tags then tags}
        {#each tags
          .filter(t => t.tag
              .join("/")
              .toLowerCase()
              .startsWith($selectedTags[0].toString()))
          .filter(t => t.tag
                .join("/")
                .toLowerCase() != $selectedTags[0].toString())
          .sort((a, b) => a.tag
              .join("/")
              .localeCompare(b.tag.join("/"))) as { tag }}
          <Button
            card
            icon="mdiFolderArrowDownOutline"
            on:click={() => selectedTags.set([tag.join("/").toLowerCase()])}
          >
            {tag.slice(-1)}
          </Button>
        {/each}
      {/await}
    </div>
  {/if}

  <section>
    {#if $viewMode == "table"}
      <ImageGridTable media={$media_store} />
    {:else if $controller?.mediaController}
      {#each $pages as { hash, media }, i (hash)}
        {#if pageData.cluster.type == "withName"}
          <ImageGridStudios {media} {i} />
        {:else}
          <ImageGridPage {media} {i} />
        {/if}
      {/each}
    {/if}
  </section>
{/if}

<style lang="scss">
  section {
    display: grid;
    gap: 14px;
    max-width: 100vw;
  }

  #collectionGroups {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));

    margin-top: -0.5em;
    margin-right: -0.5em;
    margin-bottom: 0.5em;
    margin-left: -0.5em;
  }
</style>
