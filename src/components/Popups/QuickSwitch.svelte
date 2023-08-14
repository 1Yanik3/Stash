<script lang="ts">
    import { onMount } from "svelte";
    import Popup from "../../reusables/Popup.svelte";
    import FuzzySearch from "fuzzy-search";
    import { goto } from "$app/navigation";
    import { clusterIndex, controller, data } from "../../lib/stores";

    const Cluster = $data.find(c => c.id == $clusterIndex)

    export let visible: boolean;
    let inputBox: HTMLInputElement
    let value = "";

    let selectedIndex = 0;
    let results: {id: number, name: number, cluster :{id: number,name: string} }[] = []
    $: if (results) selectedIndex = 0;
    $: results = searcher?.search(value).slice(0, 8).sort((a: any, b: any) => +(b.cluster.id == Cluster?.id) - +(a.cluster.id == Cluster?.id)) || [];

    let searcher: any = null;
    onMount(async () => {
        let allGroups: typeof results = await (await fetch(`/api/group/all`)).json()
        searcher = new FuzzySearch(allGroups, ["name", "cluster.name"], {
            caseSensitive: false,
            sort: true
        });
        inputBox.focus()
    });

    const onInput = (event: KeyboardEvent) => {
        if (event.key == "ArrowUp") {
            selectedIndex--;
        }

        if (event.key == "ArrowDown") {
            selectedIndex++;
        }

        if (event.key == "Enter") {
            visible = false
            goto(`/${results[selectedIndex].id}`)
        }
    };
</script>

<Popup bind:visible hideHeader>
    <main>
        <input type="search" bind:value on:keydown={(e) => onInput(e)} bind:this={inputBox} />

        {#each results as {name, cluster}, i}
            <div class:active={i == selectedIndex}>
                <span>{name}</span>
                <span>{cluster.name}</span>
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
