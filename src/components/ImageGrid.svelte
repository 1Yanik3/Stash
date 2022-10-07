<script lang="ts">
    import type { Tag, Medium } from "src/types"

    import { JustifiedGrid } from "@egjs/svelte-grid"

    import { tags, media, cluster, group } from "../stores"

    import GridThumbnail from '../components/GridThumbnail.svelte'
    import ImageGridCollection from './ImageGrid_Collection.svelte'

    let finishedLoading = false

    // TODO: find out if there is a way to get rid of this
    media.subscribe(() => setTimeout(() => finishedLoading = true, 100))

    const includesActiveTags = (medium: Medium, tags: Array<Tag>) => {
        const activeTags = (tags || []).filter(t => t.active)

        if (!activeTags.length) return true

        for (const i in activeTags)
            for (const j in medium.tags)
                if (activeTags[i].name.toLowerCase() == medium.tags[j].toLowerCase())
                    return true

        return false
    }

</script>



{#if $cluster.type == "collection" && $group.id == -3}
<ImageGridCollection/>
{:else}
{#key [ $media, $tags ]}
<JustifiedGrid
    autoResize={true}
    useResizeObserver={true}
    defaultDirection="start"
    gap={14}
    sizeRange={[150, 500]}
    useTransform={true}
>

    {#each $media as medium, i}
        {#if includesActiveTags(medium, $tags)}
            <GridThumbnail {medium} {i} {finishedLoading} />
        {/if}
    {/each}

</JustifiedGrid>
{/key}
{/if}