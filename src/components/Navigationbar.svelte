<script lang="ts">
    import { mdiArchiveOutline, mdiBookshelf, mdiFolderHidden, mdiHook, mdiHookOff, mdiImageOutline, mdiPencilOutline, mdiPlus, mdiTrashCanOutline, mdiVideoOutline } from '@mdi/js'
    import Icon from 'mdi-svelte'
    
    import Navigationbar_ClusterDropdown from "./Navigationbar_ClusterDropdown.svelte"
    import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte"
    import SidebarSection from "./SidebarSection.svelte"
    import SidebarButton from "./SidebarButton.svelte"

    import { sortingMethods } from '../types'
    import { serverURL, cluster, traverse, group, groups, tags, activeSortingMethod, mediaTypeFilter } from '../stores'

    export let controller: any

    const createGroup = async () => {
        const name = window.prompt("Enter a name for the new collection")

        if (name) {
            await fetch(`${serverURL}/${$cluster.id}/groups`,{
                method: "POST",
                body: JSON.stringify({
                    Cluster: $cluster.id,
                    Name: name,
                    Parent: $group.id != -1 ? $group.id : ""
                })
            })
            controller.updateGroups()
        }
    }

    let clusterDropdownVisible = false
</script>

<svelte:window on:mouseup={() => clusterDropdownVisible = false} />

{#if clusterDropdownVisible}
    <Navigationbar_ClusterDropdown {controller}/>
{/if}

<SidebarSection justify>
    <button on:click={() => clusterDropdownVisible = true}>{$cluster.name}</button>

    <div style="display: flex; align-items: center">

        <div class="actionButton"
            on:click={() =>
                activeSortingMethod.set(
                    sortingMethods[(sortingMethods.indexOf($activeSortingMethod) + 1) % sortingMethods.length]
                )
            } 
            on:contextmenu|preventDefault={() =>
                activeSortingMethod.set($activeSortingMethod)
            }
        >
            <Icon path={$activeSortingMethod.icon} size={0.8}/>
        </div>

        <div class="actionButton"
            on:click={() => {
                traverse.set(!$traverse)
                localStorage.setItem('traverse', $traverse.toString())
            }}
        >
            {#if $traverse}
                <Icon path={mdiHook} size={0.8}/>
            {:else}
                <Icon path={mdiHookOff} size={0.8}/>
            {/if}
        </div>

    </div>
</SidebarSection>

<!-- Statics -->
<SidebarSection>
    <SidebarButton target={$groups.find(g => g.id == -3)} icon={mdiBookshelf}>
        All
    </SidebarButton>
    <SidebarButton target={$groups.find(g => g.id == -1)} icon={mdiArchiveOutline}>
        Unsorted
    </SidebarButton>
    <SidebarButton target={$groups.find(g => g.id == -2)} icon={mdiTrashCanOutline}>
        Trash
    </SidebarButton>
</SidebarSection>

<!-- Folders -->
<SidebarSection title="Folders" actions={[
    {
        action: () => {
            fetch(`${serverURL}/${$cluster.id}/${$group.id}/collapsed/${!!$group.children.length && !$group.collapsed}`, {
                method: "PATCH"
            })
            groups.set(
                $groups.map(g => {
                    if (g == $group && g.children.length) {
                        g.collapsed = !g.collapsed
                    }
                    return g
                })
            )
        },
        name: "Toggle Hidden",
        icon: mdiFolderHidden,
        disabled: !$group.children.length
    },
    {
        action: createGroup,
        name: "Create New",
        icon: mdiPlus
    },
    {
        action: () => {},
        name: "Rename",
        icon: mdiPencilOutline
    }
]}>
    {#key $groups}
        
        {#each $groups.filter(({ id }) => id > 0) as target}
            <SidebarHierarchyEntry {target}/>
        {/each}

    {/key}
</SidebarSection>

<!-- Tags -->
{#if $tags.length}
    <SidebarSection title="Tags">

        {#each $tags.sort((a, b) => b.count - a.count) as tag}
            <SidebarButton {tag}/>
        {/each}

    </SidebarSection>
{/if}

<!-- Type -->
<SidebarSection title="Media Type">

    <SidebarButton icon={mdiImageOutline} on:click={() => {
        if ($mediaTypeFilter == "image")
            mediaTypeFilter.set("")
        else
            mediaTypeFilter.set("image")
    }} active={$mediaTypeFilter == "image"}>
        Image
    </SidebarButton>
    
    <SidebarButton icon={mdiVideoOutline} on:click={() => {
        if ($mediaTypeFilter == "video")
            mediaTypeFilter.set("")
        else
            mediaTypeFilter.set("video")
    }} active={$mediaTypeFilter == "video"}>
        Video
    </SidebarButton>

</SidebarSection>

<style lang="scss">
    .actionButton {
        cursor: pointer;
        margin-right: 0.35em;

        transition: filter 100ms;
        &:hover {
            filter: brightness(0.75);
        }
    }
</style>