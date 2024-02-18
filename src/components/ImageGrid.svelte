<script lang="ts">
  import { selectedTags, storyTab, viewMode } from "$lib/stores"

  import ImageGridPage from "./ImageGrid_Page.svelte"
  import ImageGridStories from "./ImageGrid_Stories.svelte"
  import ImageGridCollection from "./ImageGrid_Collection.svelte"

  import ImageGridStudios from "./ImageGrid_Studios.svelte"
  import { page } from "$app/stores"

  import type { PageData } from "../routes/[cluster]/$types"
  import SidebarButton from "../routes/[cluster]/SidebarButton.svelte"
  import ImageGridTable from "./ImageGrid_Table.svelte"
  import type { Media } from "@prisma/client"
  import { md5 } from "hash-wasm"
  $: pageData = $page.data as PageData

  const pageSize = 50

  let media: Media[] = []
  let lastHash = ""
  const updateMediaIfChangesExist = async (
    newData: Promise<Awaited<typeof pageData.streamed_page.media>>
  ) => {
    const newHash = await md5(JSON.stringify((await newData).map(m => m.id)))
    if (newHash == lastHash) return

    media = await newData
    lastHash = newHash
  }
  $: updateMediaIfChangesExist(pageData.streamed_page.media)
</script>

{#if pageData.cluster.type == "collection" && !$selectedTags.length}
  <ImageGridCollection />
{:else if pageData.cluster.type == "stories"}
  <ImageGridStories />
{:else}
  {#if pageData.cluster.type == "collection"}
    <div id="collectionGroups">
      {#if $selectedTags.length == 1 && $selectedTags[0].includes("/")}
        <SidebarButton
          card
          icon="mdiFolderArrowUpOutline"
          on:click={() =>
            selectedTags.set([
              $selectedTags[0].replace(/\/[^\/]+$/, "").toLowerCase()
            ])}
        >
          {$selectedTags[0].replace(/\/.+$/, "")}
        </SidebarButton>
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
          <SidebarButton
            card
            icon="mdiFolderArrowDownOutline"
            on:click={() => selectedTags.set([tag.join("/").toLowerCase()])}
          >
            {tag.slice(-1)}
          </SidebarButton>
        {/each}
      {/await}
    </div>
  {/if}

  <section>
    {#key lastHash}
      {#if $viewMode == "table"}
        <ImageGridTable {media} />
      {:else}
        {#each new Array(Math.ceil(media.length / pageSize)) as _, i}
          {#if pageData.cluster.type == "withName"}
            <ImageGridStudios
              media={media.slice(i * pageSize, (i + 1) * pageSize)}
              {i}
            />
          {:else}
            <ImageGridPage
              media={media.slice(i * pageSize, (i + 1) * pageSize)}
              {i}
            />
          {/if}
        {/each}
      {/if}
    {/key}
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
    margin-left: -0.5em;
    margin-right: -0.5em;
    margin-bottom: 0.5em;
  }
</style>
