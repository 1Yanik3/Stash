<script lang="ts">
    import { selectedTags, storyTab } from "$lib/stores";

    import ImageGridPage from "./ImageGrid_Page.svelte";
    import ImageGridStories from "./ImageGrid_Stories.svelte";
    import ImageGridStoriesComics from "./ImageGrid_Stories_Comics.svelte";
    import ImageGridCollection from "./ImageGrid_Collection.svelte";

    import ImageGridStudios from "./ImageGrid_Studios.svelte";
    import { page } from "$app/stores";

    import type { PageData } from "../routes/[cluster]/$types";
    import SidebarButton from "../routes/[cluster]/SidebarButton.svelte";
    $: pageData = $page.data as PageData;

    const pageSize = 50;
</script>

{#if pageData.cluster.type == "collection" && !$selectedTags.length}
    <ImageGridCollection />
{:else if pageData.cluster.type == "stories"}
    {#if $storyTab == null}
        <ImageGridStories />
    {:else}
        <ImageGridStoriesComics />
    {/if}
{:else}
    {#if pageData.cluster.type == "collection"}
        <div id="collectionGroups">
            {#if $selectedTags.length == 1 && $selectedTags[0].includes("/")}
                <SidebarButton
                    card
                    icon="mdiFolderArrowUpOutline"
                    on:click={() =>
                        selectedTags.set([
                            $selectedTags[0]
                                .replace(/\/[^\/]+$/, "")
                                .toLowerCase(),
                        ])}
                >
                    {$selectedTags[0].replace(/\/.+$/, "")}
                </SidebarButton>
            {/if}

            {#each pageData.tags
                .filter((t) => t.tag
                        .join("/")
                        .toLowerCase()
                        .startsWith($selectedTags[0].toString()))
                .filter((t) => t.tag
                        .join("/")
                        .toLowerCase() != $selectedTags[0].toString())
                .sort((a, b) => a.tag
                        .join("/")
                        .localeCompare(b.tag.join("/"))) as { tag }}
                <SidebarButton
                    card
                    icon="mdiFolderArrowDownOutline"
                    on:click={() =>
                        selectedTags.set([tag.join("/").toLowerCase()])}
                >
                    {tag.slice(-1)}
                </SidebarButton>
            {/each}

            <!-- {#each (
                pageData.group.children.sort((a, b) => collator.compare(a.name, b.name))
            ) as child}
                <SidebarButton card target={child} icon="mdiFolderArrowDownOutline">
                    {child.name}
                </SidebarButton>
            {/each} -->
        </div>
    {/if}

    <section>
        {#each new Array(Math.ceil(pageData.media.length / pageSize)) as _, i}
            {#if pageData.cluster.type == "withName"}
                <ImageGridStudios
                    media={pageData.media.slice(
                        i * pageSize,
                        (i + 1) * pageSize
                    )}
                    {i}
                />
            {:else}
                <ImageGridPage
                    media={pageData.media.slice(
                        i * pageSize,
                        (i + 1) * pageSize
                    )}
                    {i}
                />
            {/if}
        {/each}
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
