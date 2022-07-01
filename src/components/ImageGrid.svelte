<script lang="ts">
    import type { Group, Tag, Medium } from "src/types"

    import { JustifiedGrid } from "@egjs/svelte-grid"

    import { cluster, group, tags, visibleMedium, traverse, activeSortingMethod } from "../stores"

    let media: Array<Medium> = []

    const setVisibleMedium = (i: number) => visibleMedium.set(media[i])
    export let mediaIndex: number
    export let mediaCount: number

    $: setVisibleMedium(mediaIndex);

    (async () => {
        console.log("Updating media...")
        if ($cluster.id && $group.id) {
            try {
                let output: Array<Medium> = []

                const addToOutput = async (g: Group) => {
                    const res = await fetch(`https://stash.hera.lan/${$cluster.id}/${g.id}/media`)
                    output = [ ...output, ...await res.json() ]

                    if ($traverse)
                        for (const i in g.children)
                            await addToOutput(g.children[i])
                }
                await addToOutput($group)

                media = output.sort($activeSortingMethod.method)
                mediaCount = media.length - 1
            } catch (err) {
                console.error("failed to update media", err)
            }
        }
    })()

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

{#key !visibleMedium}
<JustifiedGrid
    autoResize={true}
    useResizeObserver={true}
    defaultDirection="start"
    gap={14}
    sizeRange={[150, 500]}

    isCroppedSize={true}
>

    {#each media as medium, i}
        {#if includesActiveTags(medium, $tags)}
            <div on:click={() => { visibleMedium.set(medium); mediaIndex = i }}>
                <img
                    src={`https://stash.hera.lan/${$cluster.id}/media/${medium.id}/thumbnail`}
                    alt={medium.name}
                >
            </div>
        {/if}
    {/each}

</JustifiedGrid>
{/key}

<style lang="scss">
    div {

        img {
            width: 100%;
            height: 100%;
            cursor: pointer;

            border-radius: 3px;
            box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px, rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;

            transition: filter 200ms;

            &:hover {
                filter: brightness(0.85);
            }
        }
    }
</style>