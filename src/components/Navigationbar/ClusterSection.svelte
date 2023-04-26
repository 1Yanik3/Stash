<script lang="ts">
    import Icon from 'mdi-svelte'
    import { mdiCog, mdiPackageVariant, mdiHook, mdiHookOff, mdiKeyboard } from '@mdi/js'
    import * as Icons from '@mdi/js'

    import { traverse, activeSortingMethod, settings, data, clusterIndex } from '$lib/stores'
    import { sortingMethods } from '../../types'
    
    import ShortcutPopup from '../Popups/ShortcutPopup.svelte'
    import SettingsPopup from '../Popups/SettingsPopup/index.svelte';
    import { page } from '$app/stores';
    import { invalidate, invalidateAll } from '$app/navigation';

    const getIcon = (name: string) => (Icons as any)[`mdi${name.substring(0, 1).toUpperCase() + name.substring(1)}`] || mdiPackageVariant

    let isSettingsVisible = false
    let isShortcutsVisible = false

    $: c = $data.find(c => c.groups.some(g => g.id == +$page.params.group))
</script>

<SettingsPopup bind:isSettingsVisible/>
<ShortcutPopup bind:isShortcutsVisible/>

<main>

    <section>
        {#if $settings.windowControlsSpacer}
            <span style="height: 0.5em; pointer-events: none"></span>
        {/if}
        <span
            class:disabled={c?.type == "collection" || c?.type == "stories"}
            on:click={() => {
                activeSortingMethod.set(
                    sortingMethods[(sortingMethods.indexOf($activeSortingMethod) + 1) % sortingMethods.length]
                )
                invalidateAll()
            }} 
            on:contextmenu|preventDefault={() =>
                invalidateAll()
            }
        >
            <div style="margin-left: 2px"><Icon path={$activeSortingMethod.icon} size={0.8}/></div>
        </span>

        <span
            class:disabled={c?.type == "stories"}
            on:click={() => {
                traverse.set(!$traverse)
                invalidate("app:load")
            }}
        >
            <div style="margin-left: 2px">
                {#if $traverse}
                    <Icon path={mdiHook} size={0.8}/>
                {:else}
                    <Icon path={mdiHookOff} size={0.8}/>
                {/if}
            </div>
        </span>
    </section>

    <section>
        {#each $data.sort((a, b) => a.sortOrder - b.sortOrder) as c}
            <a
            href="/{c.everythingGroupId}"
            title={c.name}
            class:active={$clusterIndex == c.id}
            >
                <Icon path={getIcon(c.icon)} size={0.8} />
            </a>
        {/each}
    </section>

    <section>
        <span on:click={() => isShortcutsVisible = true}>
            <Icon path={mdiKeyboard} size={0.8} />
        </span>
        <span on:click={() => isSettingsVisible = true}>
            <Icon path={mdiCog} size={0.8} />
        </span>
    </section>
</main>

<style lang="scss">
    main {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-direction: column;

        padding-top: 0.5em;
        padding-bottom: 0.5em;
        border-right: 1px solid hsl(0, 0%, 22%);
        
        section {
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
        }

        // For desktop Electron app
        -webkit-app-region: drag;

        span, a {
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

            &:not(.disabled):hover {
                background: hsl(0, 0%, 22%);
                border: 1px solid hsl(0, 0%, 24%);
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
    }
</style>