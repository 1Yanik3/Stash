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
    import { mdiFolderArrowDownOutline, mdiFolderArrowUpOutline } from "@mdi/js";
    $: pageData = $page.data as PageData

    const pageSize = 50

    const collator = new Intl.Collator([], { numeric: true })

</script>

<!-- {#if pageData.cluster.type == "collection" && pageData.cluster.everythingGroupId == +$page.params.group}

    <ImageGridCollection />

{:else if pageData.cluster.type == "stories"}

    <ImageGridStories/>

{:else} -->

    <!-- {#if pageData.cluster.type == "collection"}
        <div id="collectionGroups">
            {#if pageData.group.parent}
                <SidebarButton card target={pageData.group.parent} icon={mdiFolderArrowUpOutline}>
                    {pageData.group.parent.name}
                </SidebarButton>
            {/if}
            
            {#each (
                pageData.group.children.sort((a, b) => collator.compare(a.name, b.name))
            ) as child}
                <SidebarButton card target={child} icon={mdiFolderArrowDownOutline}>
                    {child.name}
                </SidebarButton>
            {/each}
        </div>
    {/if} -->
    
    {#key [ pageData.media ]}
        {#if true}
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
    {/key}

<!-- {/if} -->

<style lang="scss">
    
    section {
        display: grid;
        gap: 14px;
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