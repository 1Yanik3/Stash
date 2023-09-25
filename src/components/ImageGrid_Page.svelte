<script lang="ts">
    import { JustifiedGrid } from './Grid/Grids/JustifiedGrid'

    import GridThumbnail from '../components/GridThumbnail.svelte'
    import IntersectionObserver from "../reusables/IntersectionObserver.svelte"
    import type { Media } from '@prisma/client';

    export let media: Media[]
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
            <GridThumbnail {medium} {i} />
        {/each}

    </JustifiedGrid>

    {/if}

</IntersectionObserver>