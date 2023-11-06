<script lang="ts">
    import { browser } from "$app/environment";
    import { afterNavigate, goto, invalidate } from "$app/navigation";
    import { page } from "$app/stores";
    import {
        actionBar,
        actionBars,
        controller,
        imageSuffixParameter,
        selectedMediaIds,
        selectedTags,
        settings,
        visibleMedium,
    } from "$lib/stores";
    import { onMount } from "svelte";
    import CreateStoryPopup from "../components/Popups/CreateStoryPopup.svelte";
    import ClusterSectionMobile from "../components/Popups/Mobile/ClusterSectionMobile.svelte";
    import MediaViewerMobile from "../components/Popups/Mobile/MediaViewerMobile.svelte";
    import NavigationSectionMobile from "../components/Popups/Mobile/NavigationSectionMobile.svelte";
    import PromptPopup from "../components/Popups/Prompts/PromptPopup.svelte";
    import QuickActions from "../components/Popups/QuickSwitcher/QuickActions.svelte";
    import QuickActionsImport from "../components/Popups/QuickSwitcher/QuickActions_Import.svelte";
    import QuickSwitch from "../components/Popups/QuickSwitcher/QuickSwitch.svelte";
    import ReplaceVideoThumbnail from "../components/Popups/ReplaceVideoThumbnail.svelte";
    import SettingsPopup from "../components/Popups/SettingsPopup/index.svelte";
    import ShortcutPopup from "../components/Popups/ShortcutPopup.svelte";
    import Shortcut from "../reusables/Shortcut.svelte";
    import type { PageData } from "./[cluster]/$types";

    $: pageData = $page.data as PageData;

    afterNavigate(() => {
        selectedMediaIds.set([]);
        selectedTags.set([]);
        visibleMedium.set(null);
    });

    visibleMedium.subscribe(() => {
        imageSuffixParameter.set("");
    });
    selectedTags.subscribe(() => {
        if (!browser) return;
        invalidate("media-and-tags");
    });

    onMount(() => {
        visibleMedium.subscribe(() => {
            if ($settings.mobileLayout) {
                setPopup($visibleMedium ? "Media Viewer Mobile" : null);
            }
        });
    });

    export const goToPreviousMedia = () => {
        if (!$visibleMedium) return;

        const mediaIndex = pageData.media.findIndex(
            (m) => m.id == $visibleMedium?.id
        );

        if (mediaIndex > 0) visibleMedium.set(pageData.media[mediaIndex - 1]);
    };

    export const goToNextMedia = () => {
        if (!$visibleMedium) return;

        const mediaIndex = pageData.media.findIndex(
            (m) => m.id == $visibleMedium?.id
        );

        if (mediaIndex < pageData.media.length - 1)
            visibleMedium.set(pageData.media[mediaIndex + 1]);
    };

    //#region Prompt

    let prompt_visible = false;
    let prompt_question = "";
    let prompt_value = "";
    let prompt_callback = (b: boolean) => {};
    export const prompt = (
        question: string,
        placeholder = ""
    ): Promise<string | null> =>
        new Promise((resolve) => {
            prompt_question = question;
            prompt_value = placeholder;

            prompt_callback = (b: boolean) => {
                if (b) resolve(prompt_value);
                else resolve(null);
                prompt_visible = false;
            };

            prompt_visible = true;
        });

    //#endregion

    const shift = true,
        control = true,
        alt = true,
        opt = true,
        meta = true;

    const popups = {
        "Quick Actions": QuickActions,
        "Quick Actions Import": QuickActionsImport,
        "Quick Switch": QuickSwitch,
        Shortcuts: ShortcutPopup,
        Settings: SettingsPopup,
        "Replace Video Thumbnail": ReplaceVideoThumbnail,
        "Create Story": CreateStoryPopup,
        "Cluster Section Mobile": ClusterSectionMobile,
        "Navigation Section Mobile": NavigationSectionMobile,
        "Media Viewer Mobile": MediaViewerMobile,
    } as const;

    let popup: keyof typeof popups | null = null;
    export const setPopup = (newPopup: typeof popup) => (popup = newPopup);
    export const setActionBar = (
        newActionBar: keyof typeof actionBars | null
    ) => actionBar.set(newActionBar);
</script>

{#if popup}
    <svelte:component this={popups[popup]} />
{/if}

<Shortcut
    meta
    key="o"
    action={() => {
        popup = "Quick Switch";
    }}
/>
<Shortcut
    meta
    key="k"
    action={() => {
        popup = "Quick Actions";
    }}
/>
<Shortcut meta key="/" action={() => (popup = "Shortcuts")} />
<Shortcut meta key="," action={() => (popup = "Settings")} />

<!-- Media Navigation -->
<Shortcut key="," action={goToPreviousMedia} />
<Shortcut key="." action={goToNextMedia} />

<!-- Go up by a group -->
<!-- <Shortcut
    opt
    key="ArrowUp"
    action={() => {
        const currentGroupIndex = flattenedGroups.findIndex(g => g.id == pageData.group?.id)
        if (currentGroupIndex == 0) return;
        goto(flattenedGroups[currentGroupIndex - 1].id.toString())
    }}
/> -->

<!-- Go down by a group -->
<!-- <Shortcut
    opt
    key="ArrowDown"
    action={() => {
        const currentGroupIndex = flattenedGroups.findIndex(g => g.id == pageData.group?.id);
        if (currentGroupIndex >= flattenedGroups.length - 1) return;
        goto(flattenedGroups[currentGroupIndex + 1].id.toString())
    }}
/> -->

<!-- Go up by a cluster -->
<Shortcut
    shift
    opt
    key="ArrowUp"
    action={() => {
        const currentClusterIndex = pageData.clusters.findIndex(
            (c) => c.id == pageData.cluster.id
        );
        if (currentClusterIndex == 0) return;
        const newCluster = pageData.clusters[currentClusterIndex - 1];
        goto(`/${newCluster.name}`);
    }}
/>

<!-- Go down by a cluster -->
<Shortcut
    shift
    opt
    key="ArrowDown"
    action={() => {
        const currentClusterIndex = pageData.clusters.findIndex(
            (c) => c.id == pageData.cluster.id
        );
        if (currentClusterIndex >= pageData.clusters.length - 1) return;
        const cluster = pageData.clusters[currentClusterIndex + 1];
        goto(`/${cluster.name}`);
    }}
/>

{#if prompt_visible}
    <PromptPopup
        bind:value={prompt_value}
        text={prompt_question}
        on:result={(e) => prompt_callback(e.detail)}
    />
{/if}
