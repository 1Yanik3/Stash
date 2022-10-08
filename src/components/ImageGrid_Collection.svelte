<script lang="ts">
    import { onMount } from "svelte"
    import { children, identity } from "svelte/internal";
    import { media, cluster, group, serverURL, groups } from "../stores"
    
    let data: {
        id:      number,
        name:    string,
        mediaId: number
    }[] = []

    onMount(async () => {
        const res = await fetch(`${serverURL}/${$cluster.id}/index`)
        data = await res.json()
    })

</script>

<main>
    
    {#each data.sort((a, b) => b.name.localeCompare(a.name)) as d}
        <!-- <a href="/?c={$cluster.id}&g={d.id}"> -->
        <a on:click={() => {
            let target
            
            $groups.find(g => {

                // @ts-ignore
                const recursion = (g) => {

                    if (g.id == d.id)
                        target = g
                    else
                        g.children.forEach(recursion)

                }
                return recursion(g)

            })


            console.log(target)
            if (!target) return
            group.set(target)
        }}
        href={`?c=${$cluster.id || 1}&g=${d.id}`}
        >

            {#if d.mediaId}
                <img
                src={`${serverURL}/${$cluster.id}/media/${d.mediaId}/thumbnail`}
                alt=""
                >
            {/if}

            <span style={d.mediaId == 0 ? "grid-row: 1 / span 2; padding: 0" : ""}>{d.name}</span>
        </a>
        <!-- </a> -->
    {/each}

</main>

<style lang="scss">

    main {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        margin: -0.5em;
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