<script lang="ts">
    import { selectedMediaIds, serverURL, visibleMedium } from "$lib/stores";
    
    import type { Media, Tags } from "@prisma/client";
    import IntersectionObserver from '../reusables/IntersectionObserver.svelte';

    export let i: number
    export let medium: Media & { tags: Tags[] }
    export let disableActive = false

    let thumbnailLoadedCompletely = false

    const dragStartHandler = (e: DragEvent) => {
        e.dataTransfer?.setData("text/plain", `mediaId_${medium.id}`)
    }

    let element: HTMLDivElement
    visibleMedium.subscribe(async () => {
        if (!element) return

        const r = element.getBoundingClientRect()
        if ($visibleMedium == medium && !(
            r.top >= 210 &&
            r.bottom <= (window.innerHeight - 210)
        )) {
            element.scrollIntoView({
                block: "nearest",
                behavior: "smooth"
            })
        }
    })

    const leftClick = (e: MouseEvent) => {
        if (e.metaKey) {
            visibleMedium.set(null)
            if ($selectedMediaIds.includes(medium.id))
                selectedMediaIds.set($selectedMediaIds.filter(j => j != medium.id))
            else
                selectedMediaIds.set([...$selectedMediaIds, medium.id])
        } else {
            selectedMediaIds.set([])
            visibleMedium.set(medium)
        }
    }
</script>

<IntersectionObserver
    on:click={e => leftClick(e.detail)}
    once={true}
    top={500}
    let:intersecting
>
    <div
        on:dragstart|stopPropagation={dragStartHandler}
        bind:this={element}
        class:selected={$selectedMediaIds.includes(medium.id)}
    >

        {#if (intersecting) || i == 0}

            <img
                src={`${$serverURL}/api/media/${medium.id}/thumbnail`}
                alt={medium.name}
                class:hidden={!thumbnailLoadedCompletely}
                class:active={!disableActive && $visibleMedium == medium}
                on:load={() => thumbnailLoadedCompletely = true}
                crossorigin="use-credentials"
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

    div {
        scroll-margin: 11px;

        &.selected img {
            outline: 3px solid hsl(0, 0%, 36%);
        }
    }

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
            transform: scale(1.04);
        }
        &.active {
            transform: scale(1.04);
        }
    }

</style>