<script lang="ts">
    export let title: string | null = null;
    export let action: Function | null = null;
    
    export let justify: boolean = false;

    import { mdiPlus } from '@mdi/js'
    import Icon from 'mdi-svelte'
</script>

<div class:justified={justify}>
    {#if title || action}
        <div style="display: flex;justify-content: space-between">

            {#if title}
                <span>{title}</span>
            {/if}

            {#if action}
        
                <span
                    style="filter: opacity(0.6); cursor: pointer"
                    on:click|capture={() => action && action()}
                >
                    <Icon path={mdiPlus} size={0.8}/>
                </span>
        
            {/if}

        </div>
    {/if}

    <slot/>
</div>

<style>
    div.justified {
        display: flex;
        justify-content: space-between;
        margin: 0.5em;
    }
    span {
        display: block;
        margin: 0.5em 0.75em;
        filter: opacity(0.6);
        font-weight: 200;
    }
</style>