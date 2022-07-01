<script lang="ts">
    import type { Cluster, Medium } from "src/types";

    export let visibleMedium: Medium
    export let cluster: Cluster

    let isZoomedIn = false
</script>


<div class="media">
    {#if visibleMedium.type.startsWith("image")}

        <img
            src={`https://stash.hera.lan/${cluster.id}/file/${visibleMedium.id}`}
            alt={visibleMedium.name}
            class={isZoomedIn ? "zoomed" : ""}
            on:click={e => isZoomedIn = !isZoomedIn}
        >

    {:else if visibleMedium.type.startsWith("video")}

        <video
            src={`https://stash.hera.lan/${cluster.id}/file/${visibleMedium.id}`}
            alt={visibleMedium.name}
            controls
            autoplay
        ><track kind="captions"/></video>

    {:else}
        <span>{visibleMedium.name}</span>
    {/if}
</div>

<style lang="scss">

    .media {
        display: flex;
        justify-content: center;
        align-items: center;

        // TODO: Make more elegant
        height: calc(100vh - 40.5px);

        background: #202020;

        cursor: zoom-in;
        overflow: scroll;


        img, video {
            width: 100%;
            height: 100%;
            object-fit: contain;
        }

        img.zoomed {
            scale: 3;
            cursor: zoom-out;
        }
    }

</style>