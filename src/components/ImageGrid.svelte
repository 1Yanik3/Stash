<script lang="ts">
    import { data as dataStore, controller, type MainDataType } from "$lib/stores"
    
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
    import type { Group, Tag } from "../types";
    $: data = $page.data as PageData

    const pageSize = 50

    export let guest = false

    const includesActiveTags = (medium: Media & { tags: Tags[] }) => {
        const activeTags = ($page.data.tags as Tag[]).filter(t => t.active)
        const lookingForUntagged = activeTags[0]?.name == "Untagged"

        if (!activeTags.length) return true

        if (lookingForUntagged) return !medium.tags.length

        for (const i in activeTags)
            for (const j in medium.tags)
                if (activeTags[i].name.toLowerCase() == medium.tags[j].name.toLowerCase())
                    return true

        return false
    }

    const collator = new Intl.Collator([], {numeric: true})

    let c: MainDataType
    let g: Group

    page.subscribe(() => {

        const processGroup = (group: Group, cluster: MainDataType) => {
            if (group.id == +$page.params.group) {
                console.log(group.id, +$page.params.group, group)
                g = group
                c = cluster
                return true
            } else {

                for (let i = 0; i < group.children.length; i++) {
                    if (processGroup(group.children[i], cluster)) return true
                }

            }

            return false
        }

        for (const cluster of $dataStore) {
            
            for (let i = 0; i < cluster.groups.length; i++) {
                const group = cluster.groups[i];

                if (processGroup(group, cluster)) return

            }

        }
    })
</script>

{#if c?.type == "collection" && c?.everythingGroupId == +$page.params.group}

    <ImageGridCollection {guest}/>

{:else if c?.type == "stories"}

    <ImageGridStories/>

{:else}

    {#if c?.type == "collection"}
        {@const parent = $controller.flattenGroups().find(gr => gr.children.includes(g))}
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
        // overflow: hidden;
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