<script lang="ts">
    import { page } from "$app/stores";
    import { browser } from "$app/environment";

    import type { Group } from "./types";
    import {
        visibleMedium,
        imageSuffixParameter,
        data,
        clusterIndex,
        type MainDataType,
        selectedMediaIds,
    } from "$lib/stores";

    import Shortcut from "./reusables/Shortcut.svelte";
    import type { Clusters } from "@prisma/client";
    import PromptPopup from "./components/Popups/Prompts/PromptPopup.svelte";
    import QuickSwitch from "./components/Popups/QuickSwitch.svelte";
    import { goto, afterNavigate } from "$app/navigation";
    import type { PageData } from "./routes/[group]/$types";
    import QuickActions from "./components/Popups/QuickActions.svelte";
    import ImportPopup from "./components/Popups/ImportPopup.svelte";

    afterNavigate(() => {
        selectedMediaIds.set([])
    })

    export const flattenAllGroups = () => {
        const flattentedGroups: {group: Group, cluster: Clusters}[] = []

        $data.forEach(cluster => {
            // TODO: Everything, Unsorted, Trash
            const flatten = (group: Group) => {
                flattentedGroups.push({ group, cluster });

                if (group.children.length)
                group.children.forEach(flatten);
            };
            cluster.groups.forEach(flatten);
        })

        return flattentedGroups;
    }

    export const flattenGroups = () => {
        const c = $data.find(c => c.id == $clusterIndex)
        if (!c)
            throw window.alert("Something went wrong flattening the groups")

        const flattentedGroups: Array<Group> = [
            c.groups.find(g => g.id == c.everythingGroupId) as Group,
            c.groups.find(g => g.id == c.unsortedGroupId) as Group,
            c.groups.find(g => g.id == c.trashGroupId) as Group
        ];

        const flatten = (input: Group) => {
            flattentedGroups.push(input);

            if (input.children.length)
                input.children.forEach(flatten);
        };
        c.groups.filter(g => g.id > 0).forEach(flatten);

        return flattentedGroups;
    };

    export const updateAll = async () => {
        if (!browser) return;

        console.log("Updating All...");
        try {
            const res = await fetch(`/api/cluster/all`);
            data.set(
                (await res.json() as MainDataType[])
                .map(cluster => {
                    cluster.groups = cluster.groups
                        .sort((a, b) => cluster.type == "collection"
                            ? b.name.localeCompare(a.name)
                            : a.name.localeCompare(b.name))
                    return cluster
                })
            );

            page.subscribe(() => {
                const clusterForGroup = flattenAllGroups().find(g => g.group.id == +$page.params.group)
                if (!clusterForGroup)
                    window.alert("cluster not found")
                else
                    clusterIndex.set(clusterForGroup.cluster.id)
            })
        } catch (err) {
            console.error("failed to update all", err);
        }
    }

    updateAll()

    // TODO: Optimise
    export const getGroup = () => {
        return flattenGroups().find(g => g.id == +$page.params.group) as Group
    }
    export const getCluster = () => {
        return $data.find(c => c.groups.some(g => g.id == +$page.params.group)) as MainDataType
    }
    
    visibleMedium.subscribe(() => imageSuffixParameter.set(""))

    const shift = true,
        control = true,
        alt = true,
        opt = true,
        meta = true;

    export const goToPreviousMedia = () => {
        if (!$visibleMedium) return;

        const mediaIndex = ($page.data as PageData).media.indexOf($visibleMedium);

        if (mediaIndex > 0) visibleMedium.set(($page.data as PageData).media[mediaIndex - 1]);
    };
    export const goToNextMedia = () => {
        if (!$visibleMedium) return;

        const mediaIndex = ($page.data as PageData).media.indexOf($visibleMedium);

        if (mediaIndex < ($page.data as PageData).media.length - 1)
            visibleMedium.set(($page.data as PageData).media[mediaIndex + 1]);
    };

    let quickSwitchOpen = false
    let quickActionsOpen = false
    let importPopupOpen = false
    export const showImportPopup = () => importPopupOpen = true

    let prompt_visible = false
    let prompt_question = ""
    let prompt_value = ""
    let prompt_callback = (b: boolean) => {}
    export const prompt = (question: string, placeholder = ""): Promise<string | null> => new Promise(resolve => {
        prompt_question = question
        prompt_value = placeholder

        prompt_callback = (b: boolean) => {
            if (b)
                resolve(prompt_value)
            else
                resolve(null)
            prompt_visible = false
        }

        prompt_visible = true
    })
</script>

<!-- Media Navigation -->
<Shortcut key="," action={goToPreviousMedia} />
<Shortcut key="." action={goToNextMedia} />

<!-- Go up by a group -->
<Shortcut
    opt
    key="ArrowUp"
    action={() => {
        const flattenedGroups = flattenGroups();
        const currentGroupIndex = flattenedGroups.findIndex(g => g.id == +$page.params.group);
        if (currentGroupIndex == 0) return;
        goto(`/${flattenedGroups[currentGroupIndex - 1].id}`)
    }}
/>

<!-- Go down by a group -->
<Shortcut
    opt
    key="ArrowDown"
    action={() => {
        const flattenedGroups = flattenGroups();
        const currentGroupIndex = flattenedGroups.findIndex(g => g.id == +$page.params.group);
        if (currentGroupIndex >= flattenedGroups.length - 1) return;
        goto(`/${flattenedGroups[currentGroupIndex + 1].id}`)
    }}
/>

<!-- Go up by a cluster -->
<Shortcut
    shift
    opt
    key="ArrowUp"
    action={() => {
        const currentClusterIndex = $data.findIndex(c => c.id == $clusterIndex);
        if (currentClusterIndex == 0) return;
        clusterIndex.set($data[currentClusterIndex - 1].id);
    }}
/>

<!-- Go down by a cluster -->
<Shortcut
    shift
    opt
    key="ArrowDown"
    action={() => {
        const currentClusterIndex = $data.findIndex(c => c.id == $clusterIndex);
        if (currentClusterIndex >= $data.length - 1) return;
        clusterIndex.set($data[currentClusterIndex + 1].id);
    }}
/>

{#if prompt_visible}
    <PromptPopup bind:value={prompt_value} text={prompt_question} on:result={e => prompt_callback(e.detail)} />
{/if}

<!-- Quick Switch -->
<Shortcut
    meta
    key="o"
    action={() => {
        quickSwitchOpen = !quickSwitchOpen
    }}
/>

{#if quickSwitchOpen}
    <QuickSwitch bind:visible={quickSwitchOpen}/>
{/if}

<!-- Quick Actions -->
<Shortcut
    meta
    key="k"
    action={() => {
        quickActionsOpen = !quickActionsOpen
    }}
/>

{#if quickActionsOpen}
    <QuickActions bind:visible={quickActionsOpen}/>
{/if}

{#if importPopupOpen}
    <ImportPopup bind:visible={importPopupOpen}/>
{/if}