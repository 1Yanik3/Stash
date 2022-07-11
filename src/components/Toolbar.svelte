<script lang="ts">
    import { serverURL, cluster, visibleMedium } from '../stores'

    import Icon from 'mdi-svelte'
    import { mdiClose, mdiFullscreen, mdiInformationOutline, mdiOpenInNew, mdiTrashCanOutline } from '@mdi/js'

    export let isFullscreen: boolean 

    const handleKeyDown = (e: KeyboardEvent) => {
        const value: string = (e.target as any).value
        if (e.key == "Enter" && value) {

            fetch(`${serverURL}/${$cluster.id}/media/${$visibleMedium?.id}/tag`, {
                method: "PUT",
                body: JSON.stringify({
                    Name: value
                })
            })
            .then(() => {
                const tmp = $visibleMedium
                tmp?.tags.push(value)
                visibleMedium.set(tmp)

                // TODO: increase count of tags in sidebar
            })
            .catch(console.error)

        }
    }
    
    const removeTagFromMedia = (tag: string) => {
        
        fetch(`${serverURL}/${$cluster.id}/media/${$visibleMedium?.id}/tag/${tag}`, {
            method: "DELETE"
        })
        .then(() => {

            if (!$visibleMedium) return
            const tmp = $visibleMedium
            tmp.tags = tmp.tags.filter(t => t != tag)
            visibleMedium.set(tmp)

        })
    }
</script>

<main style="min-width: calc(100% - 4em)">
    <section>

        <div on:click={() => visibleMedium.set(null)}>
            <Icon path={mdiClose}/>
        </div>
        <div on:click={() => isFullscreen = !isFullscreen}>
            <Icon path={mdiFullscreen}/>
        </div>

    </section>

    <!-- <span>{visibleMedium?.name}</span> -->
    <div style="overflow: scroll">
        {#each $visibleMedium?.tags || [] as tag}
            <span
                class="tag"
                on:contextmenu|preventDefault={() => {
                    removeTagFromMedia(tag)
                }}
            >{tag}</span>
        {/each}
        <input type="text" on:keydown={handleKeyDown}>
    </div>

    <section>

        <div on:click={() => window.open(`/${$cluster.id}/file/${$visibleMedium?.id}`, "_blank")}>
            <Icon path={mdiOpenInNew} size={0.8}/>
        </div>
        <div>
            <Icon path={mdiInformationOutline} size={0.8}/>
        </div>
        <div>
            <Icon path={mdiTrashCanOutline} size={0.8}/>
        </div>

    </section>

</main>

<style lang="scss">
    main {
        box-shadow: inset 0 -0.7px 0 rgba($color: #fff, $alpha: 0.15);
        padding: 0.35em;

        display: flex;
        justify-content: space-between;
        align-items: center;

        & > div {
            display: flex;
            .tag {
                background: rgb(104, 104, 1);
                padding: 0.15em 0.4em;
                margin: 0.15em;
                box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
                border-radius: 3px;

                margin-right: 0.25em;

                cursor: pointer;
            }
            input {
                margin-left: 0.25em;
                width: 2em;

                transition: width 200ms;

                &:focus {
                    width: 7em;
                }
            }
        }

        section {

            display: flex;
            align-items: center;
            
            div {
                height: 30px;
                width: 30px;

                display: flex;
                align-items: center;
                justify-content: center;

                cursor: pointer;
            }

        }
    }
</style>