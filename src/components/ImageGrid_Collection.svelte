<script lang="ts">
    import { onMount } from "svelte"
    import { fade } from "svelte/transition";
    import { serverURL, data as dataStore } from "$lib/stores"
    import { page } from "$app/stores";

    export let guest = false

    let data: {
        id:      number,
        name:    string,
        Media: number
    }[] = []

    $: c = $dataStore.find(c => c.groups.some(g => g.id == +$page.params.group))

    onMount(async () => {
        const res = await fetch(`/api/cluster/${c?.id}/index`)
        data = await res.json()
    })

    const collator = new Intl.Collator([], {numeric: true})

    let filter = ""
</script>

<main transition:fade={{ duration: 150 }}>

    <div class="search">
        <label>
            Search
            <input type="search" bind:value={filter}>
        </label>
    </div>
    
    {#each data
        .filter(a => a.name.includes(filter))
        .sort((a, b) => collator.compare(b.name, a.name))
    as d}
        <a href={guest ? `/guest/${d.id}` : `/${d.id}`}>

            {#if d.Media}
                <img
                src={`${serverURL}/api/media/${d.Media}/thumbnail`}
                alt=""
                >
            {/if}

            <span style={d.Media == 0 ? "grid-row: 1 / span 2; padding: 0" : ""}>{d.name}</span>
        </a>
    {/each}

</main>

<style lang="scss">

    main {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        margin: -0.5em;

        .search {
            grid-column: 1 / -1;
            width: 100%;
        }
    }

    a {
        display: grid;
        grid-template-rows: 300px 1.8em;
        gap: 0.5em;
        align-items: center;
        justify-content: center;

        background: #212121;
        box-shadow: rgba(0, 0, 0, 0.2) 0px 1px 3px 0px, rgba(0, 0, 0, 0.12) 0px 1px 2px 0px;

        margin: 0.5em;
        border-radius: 0.4em;

        text-decoration: none;
        transition: filter 200ms, transform 200ms;

        span {
            padding-bottom: 0.6em;
            text-align: center;
        }

        &:hover {
            filter: brightness(0.85);
            transform: scale(1.03);
        }

        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-top-left-radius: 0.4em;
            border-top-right-radius: 0.4em;
        }
    }
    
</style>