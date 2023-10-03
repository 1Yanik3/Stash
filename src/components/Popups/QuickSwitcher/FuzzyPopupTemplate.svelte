<script lang="ts">
    import { controller, settings } from "$lib/stores";

    import FuzzySearch from "fuzzy-search";
    import Popup from "../../../reusables/Popup.svelte";
    import { createEventDispatcher, onMount } from "svelte";
    import SidebarButton from "../../../routes/[cluster]/SidebarButton.svelte";

    type T = $$Generic<Record>;
    type TAsArray = Array<T>;

    export let promise: Promise<TAsArray>;
    export let searchAttributes: string[];
    export let disableClose = false;

    let inputBox: HTMLInputElement;
    let selectedIndex = 0;
    let value = "";

    let searcher: any = null;
    let results: T[];
    $: results = (searcher?.search(value).slice(0, $settings.mobileLayout ? 16 : 8) as T) || [];
    $: console.log(results);
    promise.then((data) => {
        searcher = new FuzzySearch(data, searchAttributes, {
            caseSensitive: false,
            sort: true,
        });
    });

    const dispatch = createEventDispatcher<{
        selected: T;
        close: void;
    }>();

    const onInput = (event: KeyboardEvent) => {
        if (event.key == "ArrowUp") {
            if (selectedIndex > 0) selectedIndex--;
        }

        if (event.key == "ArrowDown") {
            if (selectedIndex <= results.length) selectedIndex++;
        }

        if (event.key == "Enter") {
            if (!disableClose) {
                dispatch("close");
                $controller.setPopup(null)
            }
            dispatch("selected", results[selectedIndex]);
        }
    };

    onMount(() => {
        inputBox.focus();
    });
</script>

<Popup on:close={() => dispatch("close")} hideHeader>
    <main>
        <input
            type="search"
            bind:value
            on:keydown={(e) => onInput(e)}
            bind:this={inputBox}
        />

        {#each results as result, i}
            <div class:active={i == selectedIndex}>
                <slot {result} />
            </div>
        {/each}

        {#if $settings.mobileLayout}
            <div class="mobileNavigationButtons">
                <SidebarButton card icon="mdiArrowUp" on:click={() => {
                    if (selectedIndex > 0) selectedIndex--;
                }}/>
                <SidebarButton card icon="mdiArrowDown" on:click={() => {
                    if (selectedIndex <= results.length) selectedIndex++;
                }}/>
                <SidebarButton card icon="mdiKeyboardReturn" on:click={() => {
                    if (!disableClose) {
                        dispatch("close");
                        $controller.setPopup(null)
                    }
                    dispatch("selected", results[selectedIndex]);
                }}/>
            </div>
        {/if}
    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        width: 30em;
        max-height: 20.5em;

        input {
            padding: 0.5em;
            margin-bottom: 1em;
        }

        div {
            display: flex;
            justify-content: space-between;
            margin: 0 0.15em;
            border-radius: 0.35em;
            padding: 0.4em;
            border: 1px solid transparent;

            background: transparent;
            &.active {
                transition: background 150ms;
                background: #303030;
                border: 1px solid hsl(0, 0%, 24%);
            }

            &.mobileNavigationButtons {
                position: absolute;
                bottom: 1em;
                right: 1em;
            }
        }
    }
</style>
