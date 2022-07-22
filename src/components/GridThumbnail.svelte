<script lang="ts">
    import type { Medium } from "src/types"
    import { fade } from 'svelte/transition'

    import { serverURL, cluster, visibleMedium } from "../stores"
    
    import IntersectionObserver from '../reusables/IntersectionObserver.svelte'

    export let i: number
    export let medium: Medium
    export let finishedLoading: boolean

    let thumbnailLoadedCompletely = false

    const dragStartHandler = (e: DragEvent) => {
        e.dataTransfer?.setData("text/plain", `mediaId_${medium.id}`)
    }
</script>

<IntersectionObserver
    on:click={() => { visibleMedium.set(medium) }}
    once={true}
    top={500}
    let:intersecting
>
    <div
        on:click={() => { visibleMedium.set(medium) }}
        transition:fade="{{duration: 120}}"
        on:dragstart|stopPropagation={dragStartHandler}
    >

        {#if (intersecting && finishedLoading) || i < 50}

            <img
                src={`${serverURL}/${$cluster.id}/media/${medium.id}/thumbnail`}
                alt={medium.name}
                class:hidden={!thumbnailLoadedCompletely}
                on:load={() => thumbnailLoadedCompletely = true}
            >
            
        {/if}

        <svg
            class:hidden={thumbnailLoadedCompletely}
            viewBox={`0 0 ${medium.width} ${medium.height}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect width={medium.width} height={medium.height} x="0" y="0"/>
        </svg>

    </div>
</IntersectionObserver>

<style lang="scss">

    .hidden {
        display: none;
    }

    img {
        width: 100%;
        height: 100%;
        cursor: pointer;

        border-radius: 3px;
        box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px, rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;

        transition: filter 200ms, transform 200ms;

        &:hover {
            filter: brightness(0.85);
            transform: scale(1.03);
        }
    }

</style>