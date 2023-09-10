<script lang="ts">
    import { controller, selectedTags } from "$lib/stores"
    
    import ImageGridPage from './ImageGrid_Page.svelte'
    import ImageGridStories from "./ImageGrid_Stories.svelte"
    import ImageGridCollection from './ImageGrid_Collection.svelte'

    import type { Media, Tags } from "@prisma/client";
    import ImageGridStudios from "./ImageGrid_Studios.svelte";
    import { page } from "$app/stores";

    import type { PageData } from "../routes/[cluster]/[group]/$types"
    import SidebarButton from "../routes/[cluster]/[group]/SidebarButton.svelte";
    import { mdiFolderArrowDownOutline, mdiFolderArrowUpOutline } from "@mdi/js";
    $: pageData = $page.data as PageData

    const pageSize = 50

    const includesActiveTags = (medium: Media & { tags: Tags[] }) => {
        // const activeTags = ($page.data.tags as Tag[]).filter(t => t.active)
        // const lookingForUntagged = activeTags[0]?.name == "Untagged"

        if (!$selectedTags.length) return true

        // if (lookingForUntagged) return !medium.tags.length

        for (const i in $selectedTags)
            for (const j in medium.tags)
                if ($selectedTags[i].name.toLowerCase() == medium.tags[j].name.toLowerCase())
                    return true

        return false
    }

    const collator = new Intl.Collator([], { numeric: true })
    
</script>

{#if pageData.cluster.type == "collection" && pageData.cluster.everythingGroupId == +$page.params.group}

    <ImageGridCollection />

{:else if pageData.cluster.type == "stories"}

    <ImageGridStories/>

{:else}

    {#if pageData.cluster.type == "collection"}
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
    {/if}
    
    <!-- TODO: Somehow make the transition feel more fluent? -->
    {#key [ pageData ]}
        {#if true}
            {@const activeMedia = pageData.media.filter(includesActiveTags)}
            <section>

                {#each (new Array(Math.ceil(activeMedia.length / pageSize))) as _, i}
                    {#if pageData.cluster.type == "withName" }
                    <ImageGridStudios media={activeMedia.slice(i * pageSize, (i + 1) * pageSize)} {i} />
                    {:else}
                    <ImageGridPage media={activeMedia.slice(i * pageSize, (i + 1) * pageSize)} {i} />
                    {/if}
                {/each}
                
            </section>
        {/if}
    {/key}

{/if}

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