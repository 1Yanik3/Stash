<script lang="ts">
    import { onMount } from "svelte";
    import Popup from "../../reusables/Popup.svelte";
    import FuzzySearch from "fuzzy-search";
    import { controller, selectedMediaIds } from "../../lib/stores";
    import { page } from "$app/stores";

    export let visible: boolean;
    let inputBox: HTMLInputElement
    let value = "";

    let selectedIndex = 0;
    $: if (results) selectedIndex = 0;

    const functionalities: { name: string, function: () => Promise<void> }[] = []

    if ($selectedMediaIds.length) functionalities.push({
        name: "Add tag",
        async function() {

            const newTag = await $controller.prompt("Enter new tag: ")

            for (const i in $selectedMediaIds) {
                await fetch(`/api/media/${$selectedMediaIds[i]}/tag`, {
                    method: "PUT",
                    body: JSON.stringify({
                        name: newTag
                    })
                })
                .catch(console.error)
            }

        }
    })

    if ($page.data.group.id != $page.data.cluster.everythingGroupId) functionalities.push({
        name: "Import",
        async function() {
            visible = false
            $controller.showImportPopup()
        }
    })

    let results: typeof functionalities = []
    $: results = searcher?.search(value) || [];

    let searcher: any = null;
    onMount(async () => {
        searcher = new FuzzySearch(functionalities, ["name"], {
            caseSensitive: false,
            sort: true
        });
        inputBox.focus()
    });

    const onInput = async (event: KeyboardEvent) => {
        if (event.key == "ArrowUp") {
            selectedIndex--;
        }

        if (event.key == "ArrowDown") {
            selectedIndex++;
        }

        if (event.key == "Enter") {
            visible = false
            await results[selectedIndex].function()
            selectedMediaIds.set([])
        }
    };
</script>

<Popup bind:visible hideHeader>
    <main>
        <input type="search" bind:value on:keydown={(e) => onInput(e)} bind:this={inputBox} />

        {#each results.slice(0, 8) as {name}, i}
            <div class:active={i == selectedIndex}>
                <span>{name}</span>
            </div>
        {/each}
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
        }
    }
</style>
