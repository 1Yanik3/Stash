<script lang="ts">
    import { JustifiedGrid } from "@egjs/svelte-grid"
    import { tags } from "../stores"
    import GridThumbnail from '../components/GridThumbnail.svelte'
    import type { Medium, Tag } from "../types"
    import { onMount } from "svelte";
    import IntersectionObserver from "../reusables/IntersectionObserver.svelte";

    const includesActiveTags = (medium: Medium, tags: Array<Tag>) => {
        const activeTags = (tags || []).filter(t => t.active)

        if (!activeTags.length) return true

        for (const i in activeTags)
            for (const j in medium.tags)
                if (activeTags[i].name.toLowerCase() == medium.tags[j].toLowerCase())
                    return true

        return false
    }

    let finishedLoading = false
    onMount(() => setTimeout(() => finishedLoading = true, 100))

    export let media: Array<Medium>
    export let i: number

</script>

<IntersectionObserver
    once={true}
    top={750}
    let:intersecting
    delay={i > 0 ? 300 : 0}
>
    {#if intersecting}

    <JustifiedGrid
        autoResize={true}
        useResizeObserver={true}
        defaultDirection="start"
        gap={14}
        sizeRange={[150, 500]}
        useTransform={true}
    >

        {#each media as medium}
            {#if includesActiveTags(medium, $tags)}
                <GridThumbnail {medium} {i} {finishedLoading} />
            {/if}
        {/each}

    </JustifiedGrid>

    {/if}

</IntersectionObserver>