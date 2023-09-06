<script lang="ts">
	import { mdiClose } from "@mdi/js";
	import { createEventDispatcher } from 'svelte';
	import { fade, scale } from 'svelte/transition';
	import Icon from "../components/Icon.svelte";
	import { controller } from '../lib/stores';

    export let title = ""
    export let hideHeader = false

    const dispatch = createEventDispatcher();

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.key != "Escape") return

        e.preventDefault()
        dispatch('close')
        $controller.setPopup(null)
    }
</script>

<svelte:window on:keydown={onKeyDown}/>

<main transition:fade={{ duration: 100 }}>
    <section transition:scale={{ start: 1.1, duration: 100 }}>
        {#if !hideHeader}
            <div id="header">

                <h2>{title}</h2>
                
                <button on:click={() => {
                    dispatch('close')
                    $controller.setPopup(null)
                }}>
                    <Icon path={mdiClose}/>
                </button>

            </div>
        {/if}
        <div id="content">
            <slot/>
        </div>
    </section>
</main>

<style lang="scss">

    main {
        position: fixed;
        z-index: 99;

        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;

        display: flex;
        justify-content: center;
        align-items: center;

        background: hsla(0, 0%, 0%, 30%);

        section {
            min-width: 320px;
            max-width: 90%;
            max-height: 90%;

            background: hsl(0, 0%, 13%);
            border: 1px solid hsl(0, 0%, 30%);
            border-radius: 0.5em;
            box-shadow: rgba(0, 0, 0, 0.4) 0px 3px 9px 0px, rgba(0, 0, 0, 0.24) 0px 2px 4px 0px;

            #header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.5em;

                h2 { margin: 0 0.2em }

                box-shadow: inset 0 -0.7px 0 rgba($color: #fff, $alpha: 0.15);
            }

            #content {
                padding: 0.5em;
            }
        }
    }
</style>