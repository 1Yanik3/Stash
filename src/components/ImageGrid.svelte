<script lang="ts">
    import { tags, data as dataStore, controller } from "$lib/stores"
    
    import ImageGridPage from './ImageGrid_Page.svelte'
    import ImageGridStories from "./ImageGrid_Stories.svelte"
    import ImageGridCollection from './ImageGrid_Collection.svelte'

    import { fade } from "svelte/transition"
    import SidebarButton from "./SidebarButton.svelte"
    import { mdiFolderArrowDownOutline, mdiFolderArrowUpOutline } from "@mdi/js"
    import type { Media, Tags } from "@prisma/client";
    import ImageGridStudios from "./ImageGrid_Studios.svelte";
    import { page } from "$app/stores";

    import type { PageData } from "../routes/[group]/$types"
    import type { Group } from "../types";
    $: data = $page.data as PageData

    const pageSize = 50

    // groups.subscribe(() => {
    //     const flatten = (input: Group) => {
    //         flattentedGroups.push(input)

    //         if (!input?.children) {
    //             console.error("no children found for ", input)
    //         }

    //         if (input.children.length)
    //             input.children.forEach(g => flatten(g))
    //     }

    //     $groups
    //     .filter(g => g.id > 0)
    //     .forEach(g => flatten(g))
    // })

    const includesActiveTags = (medium: Media & { tags: Tags[] }) => {
        const activeTags = ($tags || []).filter(t => t.active)
        const invertOutput = activeTags[0]?.name == "Untagged"

        if (!activeTags.length) return true

        for (const i in activeTags)
            for (const j in medium.tags)
                if (activeTags[i].name.toLowerCase() == medium.tags[j].name.toLowerCase())
                    return invertOutput ? false : true

        return invertOutput ? true : false
    }

    const collator = new Intl.Collator([], {numeric: true})

    $: c = $dataStore.find(c => c.groups.some(g => g.id == +$page.params.group))
    $: g = c?.groups.find(g => g.id  == +$page.params.group) as Group
</script>

{#if c?.type == "collection" && c?.everythingGroupId == +$page.params.group}

    <ImageGridCollection/>

{:else if c?.type == "stories"}

    <ImageGridStories/>

{:else}

    {#if c?.type == "collection"}
        {@const parent = $controller.flattenGroups().find(g => g.children.includes(g))}
        <div id="collectionGroups" transition:fade={{ duration: 150 }}>
            {#if parent}
                <SidebarButton card target={parent} icon={mdiFolderArrowUpOutline}>
                    {parent.name}
                </SidebarButton>
            {/if}
            
            {#each (
                g.children.sort((a, b) => collator.compare(a.name, b.name))
            ) as child}
                <SidebarButton card target={child} icon={mdiFolderArrowDownOutline}>
                    {child.name}
                </SidebarButton>
            {/each}
        </div>
    {/if}
    
    {#key [ data.media ]}
        {#if true}
            {@const activeMedia = data.media.filter(includesActiveTags)}
            <section transition:fade={{ duration: 100 }}>

                {#each (new Array(Math.ceil(activeMedia.length / pageSize))) as _, i}
                    {#if c?.type == "withName" }
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
        overflow: hidden;
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