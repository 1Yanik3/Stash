<script lang="ts">
    import { JustifiedGrid } from './Grid/Grids/JustifiedGrid'

    import GridThumbnail from '../components/GridThumbnail.svelte'
    import type { Medium } from "../types"
    import { onMount } from "svelte";
    import IntersectionObserver from "../reusables/IntersectionObserver.svelte"

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
            <GridThumbnail {medium} {i} {finishedLoading} />
        {/each}

    </JustifiedGrid>

    {/if}

</IntersectionObserver>