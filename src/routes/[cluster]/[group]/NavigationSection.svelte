<script lang="ts">
    import { mdiArchiveOutline, mdiBookshelf, mdiDotsVertical, mdiFolderHidden, mdiImageOutline, mdiImport, mdiPlus, mdiRenameBox, mdiTagOffOutline, mdiTrashCanOutline, mdiVideoOutline } from '@mdi/js'
    
    import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte"
    import SidebarSection from "../../../components/SidebarSection.svelte"
    import SidebarButton from "./SidebarButton.svelte"

    import { story, mediaTypeFilter, controller, selectedTags } from '$lib/stores'
    import { slide } from 'svelte/transition'
    import Shortcut from '../../../reusables/Shortcut.svelte'
    import { page } from '$app/stores';

    import type { PageData } from './$types';
    import { invalidate } from '$app/navigation';

    $: pageData = $page.data as PageData

    // TODO: Move into other section
    let showOptions = false
    const createGroup = async () => {
        const name = await $controller.prompt("Enter a name for the new collection")

        if (name) {
            await fetch(`/api/cluster/${pageData.cluster.id}/group`,{
                method: "POST",
                body: JSON.stringify({
                    name,
                    parentId: +$page.params.group != -1 ? +$page.params.group : ""
                })
            })
            $controller.updateAll()
        }
    }

    const renameGroup = async () => {
        const name = await $controller.prompt("Enter a name for the group", pageData.group?.name)

        if (name) {
            await fetch(`/api/group/${$page.params.group}/rename`,{
                method: "PUT",
                body: JSON.stringify({
                    name
                })
            })
            $controller.updateAll()
        }
    }
    
    const toggleHidden = () => {
        // const g = $controller.flattenAllGroups().find(g => g.group.id == +$page.params.group)

        // fetch(`/api/group/${g?.group.id}/collapsed/${!!g?.group.children.length && !g?.group.collapsed}`, {
        //     method: "PATCH"
        // })
    }
</script>

<!-- Create Group -->
<Shortcut key="c" action={() => pageData.cluster.type != "stories" && createGroup()} />
<Shortcut key="r" action={renameGroup} />

<main>
    {#if pageData.cluster.type == "stories"}
    <div style="margin-top: 8px; margin-right: 2px">
        <!-- <SidebarButton icon={mdiPlus}>
            Add
        </SidebarButton> -->
        <!-- <SidebarSection title="Stories"> -->
        <SidebarSection>
            {#each pageData.stories as s}
                <SidebarButton icon={null} active={$story == s} on:click={() => story.set(s)}>
                    {s.title}
                </SidebarButton>
            {/each}
        </SidebarSection>
    </div>
    {:else}
    <div>
        <!-- Statics -->
        <SidebarSection horizontal>
            <SidebarButton hidden target={{ id: pageData.cluster.everythingGroupId }} icon={mdiBookshelf}>
                All
            </SidebarButton>
            <SidebarButton hidden target={{ id: pageData.cluster.unsortedGroupId }} icon={mdiArchiveOutline}>
                Unsorted
            </SidebarButton>
            <SidebarButton hidden target={{ id: pageData.cluster.trashGroupId }} icon={mdiTrashCanOutline}>
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
                <SidebarButton right on:click={renameGroup} icon={mdiRenameBox}>
                    Rename Group
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
            {#each pageData.groups as target}
                <SidebarHierarchyEntry {target} />
            {/each}
        </SidebarSection>

        {#if pageData.cluster.type != "collection"}

        <!-- Tags -->
        {#if pageData.tags.length}
            <SidebarSection title="Tags">

                {#each pageData.tags
                    .filter(t => t.name != "Untagged")
                    .sort((a, b) => b.count - a.count)
                as tag}
                    <SidebarButton {tag}
                        on:click={() => {
                            if ($selectedTags.find(e => e && e.id == -1))
                                selectedTags.set([])

                            if ($selectedTags.includes(tag))
                                selectedTags.set($selectedTags.filter(t => t != tag))
                            else
                                selectedTags.set([...$selectedTags, tag])
                        }}
                        active={$selectedTags.includes(tag)}
                        />
                {/each}

                <SidebarButton
                    tag={pageData.tags.find(t => t.name == "Untagged")}
                    icon={mdiTagOffOutline}
                    active={!!$selectedTags.find(e => e && e.id == -1)}
                    on:click={() => {
                        if ($selectedTags.find(e => e && e.id == -1))
                            selectedTags.set([])
                        else
                            selectedTags.set([{
                                id: -1,
                                name: "Untagged",
                                count: 0, // TODO
                                active: true
                            }])
                    }}
                />

            </SidebarSection>
        {/if}

        <!-- Type -->
        <SidebarSection title="Media Type">

            <SidebarButton icon={mdiImageOutline} on:click={() => {
                if ($mediaTypeFilter == "image")
                    mediaTypeFilter.set("")
                else
                    mediaTypeFilter.set("image")
                invalidate("media-and-tags")
            }} active={$mediaTypeFilter == "image"}>
                Image
            </SidebarButton>
            
            <SidebarButton icon={mdiVideoOutline} on:click={() => {
                if ($mediaTypeFilter == "video")
                    mediaTypeFilter.set("")
                else
                    mediaTypeFilter.set("video")
                invalidate("media-and-tags")
            }} active={$mediaTypeFilter == "video"}>
                Video
            </SidebarButton>

        </SidebarSection>
        
        {/if}
    </div>
    {/if}
</main>

<style lang="scss">
    main {
        height: 100vh;
        overflow: hidden;

        background: hsl(0, 0%, 13%);
        border-right: 1px solid hsl(0, 0%, 22%);

        & > :nth-child(2) {
            overflow: scroll;
            scrollbar-width: none;
            &::-webkit-scrollbar {
                display: none;
            }
            height: calc(100% - 60px);
            scroll-padding: 38px;
        }
    }
</style>