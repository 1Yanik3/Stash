<script lang="ts">
    import type { Cluster, Group, Tag, Medium } from "src/types";

    import { JustifiedGrid } from "@egjs/svelte-grid"

    export let cluster: Cluster
    export let group: Group
    // export let tags: Array<Tag>
    export let visibleMedium: Medium

    let media: Array<Medium> = []
    ;(async () => {
        console.log("Updating media...")
        const res = await fetch(`http://localhost:8080/${cluster.id}/${group.id}/media`)
        media = await res.json() || []
        console.log(`http://localhost:8080/${cluster.id}/${group.id}/media`, media)
    })()

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

    {#each media as medium}
        <div on:click={() => visibleMedium = medium}>
            <img
                src={`http://localhost:8080/${cluster.id}/media/${medium.id}/thumbnail`}
                alt={medium.name}
            >
        </div>
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

            &:hover {
                filter: brightness(0.85);
            }
        }
    }
</style>