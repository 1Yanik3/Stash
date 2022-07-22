<script lang="ts">
    import { mdiArchive, mdiArchiveOutline, mdiBookshelf, mdiDotsVertical, mdiFileHidden, mdiFolderHidden, mdiHook, mdiHookOff, mdiImage, mdiImageOutline, mdiPen, mdiPencil, mdiPencilOutline, mdiPlus, mdiTrashCan, mdiTrashCanOutline, mdiVideo, mdiVideoOutline } from '@mdi/js'
    import Icon from 'mdi-svelte'
    import { sortingMethods } from '../types'
    
    import SidebarButton from "../components/SidebarButton.svelte"
    import SidebarSection from "../components/SidebarSection.svelte"
    import SidebarHierarchyEntry from "../components/SidebarHierarchyEntry.svelte"

    import { serverURL, cluster, clusters, traverse, group, groups, tags, activeSortingMethod, mediaTypeFilter } from '../stores'
import { children } from 'svelte/internal'

    export let controller: any

    const changeCluster = ((e: any) => {
        const { target }: { target: HTMLInputElement} = e
        window.history.pushState({}, '', `?c=${target.value}`)
        cluster.set($clusters.find(c => c.id == (target.value as any as number)) || $clusters[0])
        controller.updateGroups()
    })

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


</script>

<SidebarSection justify>
    {#key $clusters}
        <select on:change={changeCluster} >
            {#each $clusters as c}
                <option value={c.id} selected={c.id == $cluster.id}>
                    {c.name} 
                    <!-- {#if c.id == $cluster.id}
                        ▼
                        ▽
                    {/if} -->
                </option>
            {/each}
        </select>
    {/key}

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