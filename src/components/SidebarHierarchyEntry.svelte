<script lang="ts">
    import type { Cluster, Group } from 'src/types'
    
    import { group, cluster } from '../stores'

    import SidebarButton from '../components/SidebarButton.svelte'
    import { mdiFolder, mdiFolderHidden } from '@mdi/js'

    export let target: Group
    export let indent: number = 0
</script>

<SidebarButton
    bind:target {indent} cluster={$cluster}
    icon={target.icon || target.collapsed ? mdiFolderHidden : mdiFolder}
>
    {target.name}
</SidebarButton>

{#if target.children && !target.collapsed}
    {#each target.children.sort((a, b) => a.name.localeCompare(b.name)) as child}
        <svelte:self bind:target={child} indent={indent + 1}/>
    {/each}
{/if}