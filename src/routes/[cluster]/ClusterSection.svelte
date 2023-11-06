<script lang="ts">
    import {
        activeSortingMethod,
        activeSetMethod,
        controller,
        settings,
        traverse,
    } from "$lib/stores";
    import { invalidate } from "$app/navigation";
    import { page } from "$app/stores";
    import { setMethods, sortingMethods } from "../../types";

    import Icon from "../../components/Icon.svelte";

    import type { LayoutData } from "./$types";
    $: pageData = $page.data as LayoutData;
</script>

<main
    class:mobile={$settings.mobileLayout}
    class:windowControlsSpacer={$settings.windowControlsSpacer}
    class:eink={$settings.eink}
>
    <section>
        {#if $settings.windowControlsSpacer}
            <span style="height: 0.5em; pointer-events: none" />
        {/if}
        <span
            class:disabled={pageData.cluster.type == "collection" ||
                pageData.cluster.type == "stories"}
            on:click={() => {
                activeSortingMethod.set(
                    sortingMethods[
                        (sortingMethods.indexOf($activeSortingMethod) + 1) %
                            sortingMethods.length
                    ]
                );
                invalidate("media-and-tags");
            }}
            on:contextmenu|preventDefault={() => invalidate("media-and-tags")}
        >
            <div style="margin-left: 2px">
                <Icon name={$activeSortingMethod.icon} size={0.8} />
            </div>

            {#if $settings.mobileLayout}
                Sorting Method
            {/if}
        </span>

        <span
            class:disabled={pageData.cluster.type == "stories"}
            on:click={() => {
                traverse.set(!$traverse);
                invalidate("media-and-tags");
            }}
        >
            <div style="margin-left: 2px">
                {#if $traverse}
                    <Icon name="mdiHook" size={0.8} />
                {:else}
                    <Icon name="mdiHookOff" size={0.8} />
                {/if}
            </div>

            {#if $settings.mobileLayout}
                Traverse
            {/if}
        </span>

        <span
            class:disabled={pageData.cluster.type == "collection" ||
                pageData.cluster.type == "stories"}
            on:click={() => {
                activeSetMethod.set(
                    setMethods[
                        (setMethods.indexOf($activeSetMethod) + 1) %
                            setMethods.length
                    ]
                );
                invalidate("media-and-tags");
            }}
        >
            <div style="margin-left: 2px" title={$activeSetMethod.title}>
                <Icon name={$activeSetMethod.icon} size={0.8} />
            </div>

            {#if $settings.mobileLayout}
                Set Method ({$activeSetMethod.title})
            {/if}
        </span>
    </section>

    <section>
        {#each pageData.clusters.sort((a, b) => a.sortOrder - b.sortOrder) as c}
            <a
                href="/{c.name}"
                title={c.name}
                class:active={c.id == pageData.cluster.id}
            >
                <Icon nameAlt={c.icon} size={0.8} />
                {#if $settings.mobileLayout}
                    {c.name}
                {/if}
            </a>
        {/each}
    </section>

    <section>
        {#if !$settings.mobileLayout}
            <span on:click={() => $controller.setPopup("Shortcuts")}>
                <Icon name="mdiKeyboard" size={0.8} />
            </span>
        {/if}
        <span on:click={() => $controller.setPopup("Settings")}>
            <Icon name="mdiCog" size={0.8} />
            {#if $settings.mobileLayout}
                Settings
            {/if}
        </span>
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

        border-right: 1px solid hsl(0, 0%, 22%);

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
        span,
        a {
            // For desktop Electron app
            -webkit-app-region: no-drag;

            cursor: pointer;

            width: 45px;
            height: 37px;

            display: flex;
            justify-content: center;
            align-items: center;

            margin: 0.25em;
            border-radius: 0.35em;

            transition: background 100ms, border 100ms;
            border: 1px solid transparent;
            -webkit-tap-highlight-color: transparent;

            @media (hover: hover) and (pointer: fine) {
                &:not(.disabled):hover {
                    background: hsl(0, 0%, 22%);
                    border: 1px solid hsl(0, 0%, 24%);
                }
            }
        }

        span.disabled {
            pointer-events: none;
            filter: opacity(0.5);
        }
        a.active {
            background: hsl(0, 0%, 24%);
            border: 1px solid hsl(0, 0%, 33%);
        }

        &.mobile {
            width: 100%;
            border-right: none;
            display: flex;
            flex-direction: column;
            gap: 1em;

            span,
            a {
                width: calc(100vw - 48px);
                justify-content: space-between;
                padding-left: 8px;
                padding-right: 8px;
                text-decoration: none;
            }
        }

        &.eink {
            a {
                color: #000;
                &.active {
                    background: #fff;
                    border: 1px solid #444;
                }
            }
            section span {
                color: #000;
            }
        }
    }
</style>
