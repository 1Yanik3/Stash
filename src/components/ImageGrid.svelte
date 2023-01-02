<script lang="ts">
    import { tags, media, cluster, group, groups } from "../stores"
    
    import ImageGridPage from './ImageGrid_Page.svelte'
    import ImageGridStories from "./ImageGrid_Stories.svelte"
    import ImageGridCollection from './ImageGrid_Collection.svelte'

    import { fade } from "svelte/transition"
    import SidebarButton from "./SidebarButton.svelte"
    import type { Group, Medium } from "../types"
    import { mdiFolderArrowUpOutline } from "@mdi/js"

    const pageSize = 50

    let flattentedGroups: Array<Group> = []
    groups.subscribe(() => {
        const flatten = (input: Group) => {
            flattentedGroups.push(input)

            if (!input?.children) {
                console.error("no children found for ", input)
            }

            if (input.children.length)
                input.children.forEach(g => flatten(g))
        }

        $groups
        .filter(g => g.id > 0)
        .forEach(g => flatten(g))
    })

    const includesActiveTags = (medium: Medium) => {
        const activeTags = ($tags || []).filter(t => t.active)

        if (!activeTags.length) return true

        for (const i in activeTags)
            for (const j in medium.tags)
                if (activeTags[i].name.toLowerCase() == medium.tags[j].toLowerCase())
                    return true

        return false
    }

    const collator = new Intl.Collator([], {numeric: true})
</script>

{#if $cluster.type == "collection" && $group.id < 0 && $group.name.includes("Everything")}

    <ImageGridCollection/>

{:else if $cluster.type == "stories"}

    <ImageGridStories/>

{:else}

    {#if $cluster.type == "collection"}
        {@const parent = flattentedGroups.find(g => g.children.includes($group))}
        <div id="collectionGroups" transition:fade={{ duration: 150 }}>
            {#if parent}
                <SidebarButton card target={parent} icon={mdiFolderArrowUpOutline}>
                    {parent.name}
                </SidebarButton>
            {/if}
            {#each $group.children.sort((a, b) => collator.compare(a.name, b.name)) as child}
                <SidebarButton card target={child}>
                    {child.name}
                </SidebarButton>
            {/each}
        </div>
    {/if}

    {#key [ $media, $tags ]}
        {#if true}
            {@const activeMedia = $media.filter(includesActiveTags)}
            <section transition:fade={{ duration: 150 }}>

                {#each (new Array(Math.ceil(activeMedia.length / pageSize))) as _, i}
                    <ImageGridPage media={activeMedia.slice(i * pageSize, (i + 1) * pageSize)} {i} />
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