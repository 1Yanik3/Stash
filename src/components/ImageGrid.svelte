<script lang="ts">
    import { selectedTags } from "$lib/stores"
    
    import ImageGridPage from './ImageGrid_Page.svelte'
    import ImageGridStories from "./ImageGrid_Stories.svelte"
    import ImageGridCollection from './ImageGrid_Collection.svelte'

    import type { Media } from "@prisma/client";
    import ImageGridStudios from "./ImageGrid_Studios.svelte";
    import { page } from "$app/stores";

    import type { PageData } from "../routes/[cluster]/$types"
    import SidebarButton from "../routes/[cluster]/SidebarButton.svelte";
    $: pageData = $page.data as PageData

    const pageSize = 50
</script>

{#if pageData.cluster.type == "collection" && !$selectedTags.length}

    <ImageGridCollection />

<!-- {:else if pageData.cluster.type == "stories"}

    <ImageGridStories/> -->

{:else}

    {#if pageData.cluster.type == "collection"}
        <div id="collectionGroups">
            {#if $selectedTags.length == 1 && $selectedTags[0].includes('/')}
                <SidebarButton
                    card
                    icon="mdiFolderArrowUpOutline"
                    on:click={() =>
                        selectedTags.set([
                            $selectedTags[0].replace(/\/[^\/]+$/, "").toLowerCase()
                        ])
                    }
                >
                    {$selectedTags[0].replace(/\/.+$/, "")}
                </SidebarButton>
            {/if}
            
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

        {#each (new Array(Math.ceil(pageData.media.length / pageSize))) as _, i}
            {#if pageData.cluster.type == "withName" }
                <ImageGridStudios media={pageData.media.slice(i * pageSize, (i + 1) * pageSize)} {i} />
            {:else}
                <ImageGridPage media={pageData.media.slice(i * pageSize, (i + 1) * pageSize)} {i} />
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
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        margin-top: -0.5em;
        margin-left: -0.5em;
        margin-right: -0.5em;
        margin-bottom: 0.5em;
    }

</style>