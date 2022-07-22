<script lang="ts">
    import Icon from "mdi-svelte"

    export let actions: Array<{ action: Function, name: string, icon: string, disabled?: boolean }>

    export let offset: { left: number, top: number } | null
</script>

<svelte:window on:click={() => offset = null}/>

<main style="top: {offset?.top}px; left: {offset?.left}px">
    {#each actions as action}
        <span
        class:disabled={action.disabled}
        on:click={() => action.action()}
        >
            <Icon path={action.icon} size={0.8}/> {action.name}
        </span>
    {/each}
</main>

<style lang="scss">
    main {
        position: fixed;
        z-index: 99;

        background: hsl(0, 0%, 13%);
        border: 1px solid hsl(0, 0%, 20%);
        border-radius: 0.35em;
        box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px, rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;

        display: grid;

        span {
            display: block;
            padding: 0.35em 0.5em;

            &:first-child {
                border-radius: 0.3em 0.3em 0 0;
            }
            &:last-child {
                border-radius: 0 0 0.3em 0.3em;
            }

            cursor: pointer;
            transition: background 100ms, border 100ms;
            border: 1px solid transparent;

            &:hover {
                background: hsl(0, 0%, 22%);
                border: 1px solid hsl(0, 0%, 24%);
            }

            &.disabled {
                // pointer-events: none;
                // filter: opacity(0.5);
                display: none;
            }
        }
    }
</style>