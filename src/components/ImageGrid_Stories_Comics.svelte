<script lang="ts">
    import { storyTab } from "$lib/stores";
    import Icon from "./Icon.svelte";

    let comics: {
        synced: boolean;
        source: string;
        id: string;
    }[] = [];
    $: fetch(`/api/comics/${$storyTab}`)
        .then((r) => r.json())
        .then((res) => (comics = res));
</script>

<main>
    {#each comics as { id, source, synced }}
        <div
            class="comic"
            on:click={() => {
                fetch(
                    `/api/comics/${$storyTab}/${source}/${id}/${
                        synced ? "remove" : "add"
                    }`
                ).then(() => {
                    synced = !synced;
                });
            }}
        >
            <img src="/api/comics/{$storyTab}/{source}/{id}/cover" alt="" />
            <span>{id}</span>
            {#if synced}
                <div class="indicator">
                    <Icon name="mdiCheckBold" color="#090" />
                    Synced
                </div>
            {/if}
        </div>
    {/each}
</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 0.5em;

        .comic {
            background: hsl(0, 0%, 13%);
            border: 1px solid hsl(0, 0%, 24%);
            border-radius: 0.35em;

            position: relative;

            display: grid;

            img {
                width: 100%;
                aspect-ratio: 2/3;
                object-fit: cover;
            }

            .indicator {
                position: absolute;
                bottom: 0.35em;
                right: 0.35em;
                background: #212121;
                padding: 1px 4px;
                border-radius: 0.5em;
            }

            span {
                text-overflow: ellipsis;
                white-space: nowrap;
                overflow: hidden;
                padding: 3px;
            }

            cursor: pointer;

            transition: filter 200ms;
            &:hover {
                filter: brightness(0.8);
            }
        }
    }
</style>
