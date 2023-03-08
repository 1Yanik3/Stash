<script lang="ts">
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";
    import { clusters } from "$lib/stores";
    import Icon from "mdi-svelte";
    import * as Icons from "@mdi/js"

    let data: { id: number, mediaCount: number }[] = []

    onMount(async () => {
        data = await (await fetch("/api/global/statistics")).json()
    });

    const getIcon = (name: string) => (Icons as any)[`mdi${name.substring(0, 1).toUpperCase() + name.substring(1)}`] || Icons.mdiPackageVariant

</script>

<main in:fade>
    <div class="header">
        <span>Media Count</span>
        <span>Storage Usage</span>
        <span class="bigNumber"> 12'551 </span>
        <span class="bigNumber"> 56.2 GB </span>
    </div>

    {#each $clusters as c}
        <section>
            <div>
                <Icon path={getIcon(c.icon)} size={1.5} />
                <b>{c.name}</b>
            </div>

            <div>
                <span>Media Count</span>
                <span class="bigNumber"> {data.find(d => d.id == c.id)?.mediaCount} </span>
                <!-- <span style="margin-top: 1em">Storage Usage</span>
                <span class="bigNumber"> 10.2 GB </span> -->
                <span>​</span>
                <span>​</span>
            </div>
        </section>
    {/each}
</main>

<style lang="scss">
    .header {
        display: grid;
        grid-template-columns: 1fr auto;
        margin: 1em;
        margin-bottom: 2em;

        .bigNumber {
            font-size: 2.75em;
        }
    }

    section {
        display: grid;
        grid-template-columns: 1fr auto;
        margin-top: 1em;

        padding: 1em;
        background: hsl(0, 0%, 7%);
        border-radius: 0.6em;
        border: 1px solid hsl(0, 0%, 17%);
        box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 3px 0px,
            rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

        b {
            font-size: 1.5em;
        }

        .bigNumber {
            font-size: 1.5em;
        }

        div {
            // display: grid;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
    }
</style>
