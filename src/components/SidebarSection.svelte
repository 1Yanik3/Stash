<script lang="ts">
    export let title: string | null = null
    export let actions: Array<{ action: Function, name: string, icon: string, disabled?: boolean }> = []
    
    export let justify: boolean = false

    import { mdiDotsVertical } from '@mdi/js'
    import Icon from 'mdi-svelte'

    import SidebarSectionDropdown from './SidebarSection_Dropdown.svelte'

    let popupOffset: { left: number, top: number } | null

</script>

{#if popupOffset}
    <SidebarSectionDropdown {actions} bind:offset={popupOffset}/>
{/if}

<div class:justified={justify}>
    {#if title || actions.length}
        <div style="display: flex;justify-content: space-between">

            {#if title}
                <span>{title}</span>
            {/if}

            {#if actions.length}
                <span
                    class="actionButton"
                    on:click|capture|stopPropagation={e => popupOffset = { left: e.clientX, top: e.clientY }}
                >
                    <Icon path={mdiDotsVertical} size={0.8}/>
                </span>
            {/if}

        </div>
    {/if}

    <slot/>
</div>

<style lang="scss">
    div.justified {
        display: flex;
        justify-content: space-between;
        margin: 0.5em;
    }
    span {
        display: block;
        margin: 0.5em 0.75em;
        filter: opacity(0.65);
        font-weight: 200;
    }

    .actionButton {
        cursor: pointer;
        transition: filter 100ms;
        &:hover {
            filter: opacity(0.65) brightness(0.75);
        }
    }
</style>