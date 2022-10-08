<script lang="ts">
    import { mdiArchiveOutline, mdiBookshelf, mdiDotsVertical, mdiFolderHidden, mdiImageOutline, mdiPlus, mdiTrashCanOutline, mdiVideoOutline } from '@mdi/js'
    
    import SidebarHierarchyEntry from "../SidebarHierarchyEntry.svelte"
    import SidebarSection from "../SidebarSection.svelte"
    import SidebarButton from "../SidebarButton.svelte"

    import { serverURL, cluster, traverse, group, groups, tags, activeSortingMethod, mediaTypeFilter } from '../../stores'
    import { slide } from 'svelte/transition';
    import Shortcut from '../../reusables/Shortcut.svelte';

    export let controller: any

    // TODO: Move into other section
    let showOptions = false
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
    const toggleHidden = () => {
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
    }
</script>

<!-- Create Group -->
<Shortcut control={true} key="n" action={createGroup} />

<main>
    <div>
        <!-- Statics -->
        <SidebarSection horizontal>
            <SidebarButton hidden target={$groups.find(g => g.id == -3)} icon={mdiBookshelf}>
                All
            </SidebarButton>
            <SidebarButton hidden target={$groups.find(g => g.id == -1)} icon={mdiArchiveOutline}>
                Unsorted
            </SidebarButton>
            <SidebarButton hidden target={$groups.find(g => g.id == -2)} icon={mdiTrashCanOutline}>
                Trash
            </SidebarButton>
            <SidebarButton hidden on:click={e =>
                showOptions = !showOptions
            } icon={mdiDotsVertical}/>
        </SidebarSection>

        {#if showOptions}
        <div transition:slide>
            <SidebarSection>
                <SidebarButton right on:click={toggleHidden} icon={mdiFolderHidden}>
                    Toggle Hidden
                </SidebarButton>
                <SidebarButton right on:click={createGroup} icon={mdiPlus}>
                    Create Group
                </SidebarButton>
            </SidebarSection>
        </div>
        {/if}
    </div>

    <div>
        <!-- Folders -->
        <SidebarSection title="Folders">
            {#key $groups}
                
                {#each $groups.filter(({ id }) => id > 0) as target}
                    <SidebarHierarchyEntry {target}/>
                {/each}

            {/key}
        </SidebarSection>

        {#if $cluster.type != "collection"}

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
        
        {/if}
    </div>
</main>

<style lang="scss">
    main {
        height: 100vh;
        overflow: hidden;

        & > :nth-child(2) {
            overflow: scroll;
            scrollbar-width: none;
            height: calc(100% - 60px);
            scroll-padding: 38px;
        }
    }
</style>