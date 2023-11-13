<script lang="ts">
    import {
        activeSortingMethod,
        activeSetMethod,
        controller,
        settings,
        traverse,
    } from "$lib/stores";
    import { goto, invalidate } from "$app/navigation";
    import { page } from "$app/stores";
    import { setMethods, sortingMethods } from "../../types";

    import Icon from "../../components/Icon.svelte";

    import type { LayoutData } from "./$types";
    import SidebarButton from "./SidebarButton.svelte";
    $: pageData = $page.data as LayoutData;
</script>

<main
    class:mobile={$settings.mobileLayout}
    class:windowControlsSpacer={$settings.windowControlsSpacer}
>
    <section>
        {#if $settings.windowControlsSpacer}
            <span style="height: 1.5em; pointer-events: none" />
        {/if}

        <SidebarButton
            hidden={!$settings.mobileLayout}
            disabled={["collection", "stories"].includes(pageData.cluster.type)}
            on:click={() => {
                activeSortingMethod.set(
                    sortingMethods[
                        (sortingMethods.indexOf($activeSortingMethod) + 1) %
                            sortingMethods.length
                    ]
                );
                invalidate("media-and-tags");
            }}
            on:contextmenu={({ detail }) => {
                detail.preventDefault();
                invalidate("media-and-tags");
            }}
            icon={$activeSortingMethod.icon}
        >
            Sorting Method
        </SidebarButton>

        <SidebarButton
            hidden={!$settings.mobileLayout}
            disabled={pageData.cluster.type == "stories"}
            on:click={() => {
                traverse.set(!$traverse);
                invalidate("media-and-tags");
            }}
            icon={$traverse ? "mdiHook" : "mdiHookOff"}
        >
            Traverse
        </SidebarButton>

        <SidebarButton
            hidden={!$settings.mobileLayout}
            disabled={["collection", "stories"].includes(pageData.cluster.type)}
            on:click={() => {
                activeSetMethod.set(
                    setMethods[
                        (setMethods.indexOf($activeSetMethod) + 1) %
                            setMethods.length
                    ]
                );
                invalidate("media-and-tags");
            }}
            icon={$activeSetMethod.icon}
        >
            Set Method ({$activeSetMethod.title})
        </SidebarButton>
    </section>

    <section>
        {#each pageData.clusters.sort((a, b) => a.sortOrder - b.sortOrder) as c}
            <SidebarButton
                hidden={!$settings.mobileLayout}
                iconNoTyping={c.icon}
                href="/{c.name}"
                active={c.id == pageData.cluster.id}
            >
                {c.name}
            </SidebarButton>
        {/each}
    </section>

    <section>
        {#if !$settings.mobileLayout}
            <SidebarButton
                hidden
                icon="mdiKeyboard"
                on:click={() => $controller.setPopup("Shortcuts")}
            />
        {/if}

        <SidebarButton
            hidden={!$settings.mobileLayout}
            icon="mdiCog"
            on:click={() => $controller.setPopup("Settings")}
        >
            Settings
        </SidebarButton>
    </section>
</main>

<style lang="scss">
    main {
        display: grid;
        justify-content: center;
        align-items: center;
        grid-auto-rows: 1fr;

        &:not(.mobile) {
            & > :first-child {
                align-self: start;
            }
            & > :last-child {
                align-self: end;
            }
        }

        padding-top: 0.5em;
        padding-bottom: 0.5em;

        border-right: 1px solid $border-color-base;

        width: 64px;
        &.windowControlsSpacer {
            width: 77px;
        }

        section {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }

        // For desktop Electron app
        -webkit-app-region: drag;

        // TODO: Reduce duplication
        // span,
        // a {
        //     // For desktop Electron app
        //     -webkit-app-region: no-drag;

        //     cursor: pointer;

        //     width: 45px;
        //     height: 37px;

        //     display: flex;
        //     justify-content: center;
        //     align-items: center;

        //     margin: 0.25em;
        //     border-radius: 0.35em;

        //     transition: background 100ms, border 100ms;
        //     border: 1px solid transparent;
        //     -webkit-tap-highlight-color: transparent;

        //     @media (hover: hover) and (pointer: fine) {
        //         &:not(.disabled):hover {
        //             background: hsl(0, 0%, 22%);
        //             border: 1px solid hsl(0, 0%, 24%);
        //         }
        //     }
        // }

        span.disabled {
            pointer-events: none;
            filter: opacity(0.5);
        }
        // a.active {
        //     background: hsl(0, 0%, 24%);
        //     border: 1px solid hsl(0, 0%, 33%);
        // }

        &.mobile {
            width: 100%;
            border-right: none;
            display: flex;
            flex-direction: column;
            gap: 1em;

            // TODO
            // span,
            // a {
            //     width: calc(100vw - 48px);
            //     justify-content: space-between;
            //     padding-left: 8px;
            //     padding-right: 8px;
            //     text-decoration: none;
            // }
        }
    }
</style>
