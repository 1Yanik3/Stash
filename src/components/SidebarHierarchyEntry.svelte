<script lang="ts">
    import type { Cluster, Group } from 'src/types'

    import SidebarButton from '../components/SidebarButton.svelte'
    import { mdiFolder } from '@mdi/js'

    export let group: Group
    export let target: Group
    export let indent: number = 0
</script>

<SidebarButton
    bind:group {target} {indent}
    icon={target.icon || mdiFolder}
>
    {target.name}
</SidebarButton>

{#if target.children}
    {#each target.children.sort((a, b) => a.name.localeCompare(b.name)) as child}
        <svelte:self target={child} bind:group indent={indent + 1}/>
    {/each}
{/if}