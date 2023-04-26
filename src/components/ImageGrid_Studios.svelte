<script lang="ts">
    import IntersectionObserver from "../reusables/IntersectionObserver.svelte"
    import GridThumbnail from './GridThumbnail.svelte'
    import { clusterIndex, controller, data, getCluster, visibleMedium } from '$lib/stores'
    import type { Media, Tags } from '@prisma/client'
    import { onMount } from "svelte"
    import { page } from "$app/stores";

    let finishedLoading = false
    onMount(() => setTimeout(() => finishedLoading = true, 100))

    export let media: Array<Media & { tags: Tags[] }>
    export let i: number

    $: c = $data.find(c => c.groups.some(g => g.id == +$page.params.group))
</script>

<IntersectionObserver
    once={true}
    top={750}
    let:intersecting
    delay={i > 0 ? 300 : 0}
>
    {#if intersecting}

        <main>

            {#each media as medium}
                <div
                class="row"
                on:mousedown={() => visibleMedium.set(medium)}
                class:active={$visibleMedium == medium}
                >

                    <div class="thumb">
                        <GridThumbnail {medium} {i} {finishedLoading} disableActive />
                    </div>

                    <div class="details">
                        <b>{medium.name}</b>
                        <span>
                            {#if $controller.getGroup().id == c?.everythingGroupId}
                                {getCluster($clusterIndex).groups.find(g => g.id == medium.groupId)?.name},
                            {/if}
                            {medium.width}x{medium.height}
                        </span>
                    </div>

                </div>
            {/each}

        </main>


    {/if}

</IntersectionObserver>

<style lang="scss">

    main {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(40em, 1fr));;
        gap: 0.5em;
        margin-bottom: 1em;

        .row {
            display: grid;
            grid-template-columns: 10em 1fr;
            max-width: calc(100% - 64px);

            padding: 1em;
            border: 1px solid transparent;
            border-radius: 0.5em;

            transition: all 200ms;
            &:hover, &.active {
                background: #212121;
                box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px, rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;
                border: 1px solid hsl(0, 0%, 22%);
            }

            .thumb {
                pointer-events: none;
            }

            .details {
                display: flex;
                flex-direction: column;
                gap: 0.25em;
                margin: 0.5em;
                margin-left: 0.75em;

                b {
                    font-weight: bold;
                }
            }
        }
    }

</style>