<script lang="ts">
	import { createEventDispatcher } from 'svelte'
	const dispatch = createEventDispatcher()

    $: if (state != undefined)
        dispatch('toggle', state)
    $: if (state == true)
        dispatch('enable')
    $: if (state == false)
        dispatch('disable')

    export let state = false
</script>

<main on:click={() => state = !state}>
    <div class:on={state} class:off={!state}/>
</main>

<style lang="scss">
    $size: 20px;
    $padding: 2px;

    main {
        width: $size * 2.25;
        height: $size;
        padding: $padding;

        background: hsl(0, 0%, 7%);
        border-radius: 0.6em;
        border: 1px solid hsl(0, 0%, 17%);
        box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 3px 0px, rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

        position: relative;

        div {
            width: $size;
            height: $size;
            border-radius: 0.45em;

            position: absolute;
            top: $padding;
            right: $padding;

            background: hsl(0, 0%, 24%);

            transition: all 200ms ease;
            &.off {
                transform: translate(-125%, 0);
            }
            &.on {
                background: hsl(0, 0%, 35%);
            }

        }
        
        cursor: pointer;

        @media (hover: hover) and (pointer: fine) {
            &:hover div {
                filter: brightness(1.2);
            }
        }
    }
</style>