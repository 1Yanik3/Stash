<script lang="ts">
    import { tags, media, cluster, group, groups } from "../stores"

    import ImageGridCollection from './ImageGrid_Collection.svelte'
    import ImageGridPage from './ImageGrid_Page.svelte'
    import { fade } from "svelte/transition"
    import SidebarButton from "./SidebarButton.svelte";
    import type { Group } from "../types";
    import { mdiFolderArrowUpOutline } from "@mdi/js";

    const pageSize = 50

    let flattentedGroups: Array<Group> = []
    groups.subscribe(() => {
        const flatten = (input: Group) => {
            flattentedGroups.push(input)
            if (input.children.length)
                input.children.forEach(g => flatten(g))
        }

        $groups
        .filter(g => g.id > 0)
        .forEach(g => flatten(g))
    })
</script>

{#if $cluster.type == "collection" && $group.id == -3}

    <ImageGridCollection/>

{:else}

    {#if $cluster.type == "collection"}
        {@const parent = flattentedGroups.find(g => g.children.includes($group))}
        <div id="collectionGroups" transition:fade={{ duration: 150 }}>
            {#if parent}
                <SidebarButton card target={parent} icon={mdiFolderArrowUpOutline}>
                    {parent.name}
                </SidebarButton>
            {/if}
            {#each $group.children as child}
                <SidebarButton card target={child}>
                    {child.name}
                </SidebarButton>
            {/each}
        </div>
    {/if}

    {#key [ $media, $tags ]}
    <section transition:fade={{ duration: 150 }}>

        {#each (new Array(Math.ceil($media.length / pageSize))) as _, i}
            <ImageGridPage media={$media.slice(i * pageSize, (i + 1) * pageSize)} {i} />
        {/each}
        
    </section>
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