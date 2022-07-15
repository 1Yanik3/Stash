<script lang="ts">
    import type { Group, Tag, Medium } from "src/types"

    import { JustifiedGrid } from "@egjs/svelte-grid"

    import { serverURL, cluster, group, tags, visibleMedium, traverse, activeSortingMethod, mediaTypeFilter } from "../stores"

    import IntersectionObserver from '../reusables/IntersectionObserver.svelte'

    let media: Array<Medium> = []

    const setVisibleMedium = (i: number) => visibleMedium.set(media[i])
    export let mediaIndex: number
    export let mediaCount: number

    $: setVisibleMedium(mediaIndex)

    let finishedLoading = false

    ;(async () => {
        console.log("Updating media...")
        if ($cluster.id && $group.id) {
            try {

                let output: Array<Medium> = []

                const addToOutput = async (g: Group) => {
                    const res = await fetch(`${serverURL}/${$cluster.id}/${g.id}/media`)
                    output = [ ...output, ...await res.json() ]

                    if ($traverse)
                        for (const i in g.children)
                            await addToOutput(g.children[i])
                }
                await addToOutput($group)

                media = output.filter(d => d.type.startsWith($mediaTypeFilter)).sort($activeSortingMethod.method)
                mediaCount = media.length - 1

                // TODO: find out if there is a way to get rid of this
                setTimeout(() => finishedLoading = true, 100)
                
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

<JustifiedGrid
    autoResize={true}
    useResizeObserver={true}
    defaultDirection="start"
    gap={14}
    sizeRange={[150, 500]}
    useTransform={true}
>

    {#each media as medium, i}
        {#if includesActiveTags(medium, $tags)}
            <IntersectionObserver once={true} let:intersecting={intersecting}

                on:click={() => { visibleMedium.set(medium); mediaIndex = i }}>
                <div
                    on:click={() => { visibleMedium.set(medium); mediaIndex = i }}
                >
                    {#if intersecting && finishedLoading}
                        
                        <img
                            src={`${serverURL}/${$cluster.id}/media/${medium.id}/thumbnail`}
                            alt={medium.name}
                        >
                        
                    {:else}


                        <!-- <img
                            src={`data:image/svg+xml,${encodeURIComponent(`
                                    <svg
                                        viewBox="${`0 0 ${medium.width} ${medium.height}`}"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <rect width="${medium.width}" height="${medium.height}" x="0" y="0"/>
                                    </svg>
                            `)}`}
                            alt={medium.name}
                            on:load={() => loaded += 1}
                        > -->
                        <svg
                            viewBox={`0 0 ${medium.width} ${medium.height}`}
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <rect width={medium.width} height={medium.height} x="0" y="0"/>
                        </svg>

                    {/if}
                </div>

            </IntersectionObserver>
        {/if}
    {/each}

</JustifiedGrid>

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