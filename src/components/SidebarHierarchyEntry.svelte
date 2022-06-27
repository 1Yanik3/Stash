<script lang="ts">
    import type { Group } from 'src/types'

    import SidebarButton from '../components/SidebarButton.svelte'
    import { mdiFolder } from '@mdi/js'

    export let group: Group
    export let target: Group
    export let indent: number = 0
</script>

<SidebarButton {target} bind:group icon={target.icon || mdiFolder} {indent}>
    {target.name}
</SidebarButton>

{#if target.children}
    {#each target.children as child}
        <svelte:self target={child} bind:group indent={indent + 1}/>
    {/each}
{/if}