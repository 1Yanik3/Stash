<script lang="ts">
    import SidebarSection from "../../components/SidebarSection.svelte";
    import SidebarButton from "./SidebarButton.svelte";
    import SidebarHierarchyEntry from "./SidebarHierarchyEntry.svelte";

    import { page } from "$app/stores";
    import { mediaTypeFilter, selectedTags, settings, story, traverse } from "$lib/stores";

    import { invalidate } from "$app/navigation";
    import type { PageData } from "./$types";

    $: pageData = $page.data as PageData;

    const toggleHidden = () => {
        // const g = $controller.flattenAllGroups().find(g => g.group.id == +$page.params.group)
        // fetch(`/api/group/${g?.group.id}/collapsed/${!!g?.group.children.length && !g?.group.collapsed}`, {
        //     method: "PATCH"
        // })
    };

    function orderDataHierarchically(rawData: typeof pageData.tags) {
        type TagData = {
            name: string;
            count: number;
            children: TagData;
        }[];

        let tagData: TagData = [];
        rawData
            .sort((a, b) => a.tag.length - b.tag.length)
            .forEach(({ tag, direct_count, indirect_count }) => {
                const addAt = (at: TagData, i: number) => {
                    if (!tag[i]) return;

                    const parent = at.find((t) => t.name == tag[i]);

                    if (parent) {
                        // Add as child
                        addAt(parent.children, i + 1);
                    } else {
                        // Add as new
                        const children: TagData = [];
                        at.push({
                            name: tag[i],
                            count: $traverse ? direct_count + indirect_count : direct_count,
                            children,
                        });
                        addAt(children, i + 1);
                    }
                };

                addAt(tagData, 0);
            });

        // TODO
        return tagData.sort((a, b) => $page.params.cluster == "Camp Buddy" ? b.name.localeCompare(a.name) : b.count - a.count);
    }
</script>

<!-- Create Group -->
<!-- <Shortcut key="c" action={() => pageData.cluster.type != "stories" && createGroup()} /> -->
<!-- <Shortcut key="r" action={renameGroup} /> -->

<main class:mobile={$settings.mobileLayout}>
    {#if pageData.cluster.type == "stories"}
        <div style="margin-top: 8px; margin-right: 2px">
            <!-- <SidebarButton icon={mdiPlus}>
            Add
        </SidebarButton> -->
            <!-- <SidebarSection title="Stories"> -->
            <SidebarSection>
                {#each pageData.stories as s}
                    <SidebarButton
                        icon={null}
                        active={$story == s}
                        on:click={() => story.set(s)}
                    >
                        {s.title}
                    </SidebarButton>
                {/each}
            </SidebarSection>
        </div>
    {:else}
        <div>
            <!-- Statics -->
            <SidebarSection horizontal>

                <SidebarButton
                    hidden
                    icon="mdiBookshelf"
                    on:click={() => {
                        selectedTags.set([]);
                    }}
                    active={$selectedTags.length == 0}
                >
                    All
                </SidebarButton>
                <SidebarButton
                    hidden
                    icon="mdiArchiveOutline"
                    on:click={() => {
                        selectedTags.set(["SHOW_UNSORTED"]);
                    }}
                    active={$selectedTags[0] == "SHOW_UNSORTED"}
                >
                    Unsorted
                </SidebarButton>

                <SidebarButton
                    hidden
                    icon="mdiImageOutline"
                    on:click={() => {
                        if ($mediaTypeFilter == "image")
                            mediaTypeFilter.set("");
                        else mediaTypeFilter.set("image");
                        invalidate("media");
                    }}
                    active={$mediaTypeFilter == "image"}
                >
                    Image
                </SidebarButton>

                <SidebarButton
                    hidden
                    icon="mdiVideoOutline"
                    on:click={() => {
                        if ($mediaTypeFilter == "video")
                            mediaTypeFilter.set("");
                        else mediaTypeFilter.set("video");
                        invalidate("media");
                    }}
                    active={$mediaTypeFilter == "video"}
                >
                    Video
                </SidebarButton>
            </SidebarSection>
        </div>

        <div>
            <!-- Folders -->
            <!-- <SidebarSection title="Folders">
            {#each pageData.groups as target}
                <SidebarHierarchyEntry {target} />
            {/each}
        </SidebarSection> -->

            <!-- {#if pageData.cluster.type != "collection"} -->
                <SidebarSection title="Tags">
                    {#each orderDataHierarchically(pageData.tags) as { name, count, children }}
                        <SidebarHierarchyEntry {name} {count} {children} />
                    {/each}
                </SidebarSection>

                <!-- Tags -->
                <!-- {#if pageData.tags.length}
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
                /> -->

                <!-- </SidebarSection> -->
                <!-- {/if} -->
            <!-- {/if} -->
        </div>
    {/if}
</main>

<style lang="scss">
    main {
        height: 100vh;
        width: 234px;
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

        &.mobile {
            height: 80vh;
            width: 100%;
            border: none;
        }
    }
</style>
