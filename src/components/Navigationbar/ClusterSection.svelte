<script lang="ts">
    export let controller: any

    import Icon from 'mdi-svelte'
    import { mdiAccountOutline, mdiCog, mdiPackageVariant, mdiSafe, mdiHook, mdiHookOff } from '@mdi/js'

    import { cluster, clusters, traverse, activeSortingMethod } from '../../stores'
    import { sortingMethods } from '../../types'

    const changeCluster = (id: number) => {
        console.log(id)
        window.history.pushState({}, '', `?c=${id}`)
        cluster.set($clusters.find(c => c.id == id) || $clusters[0])
        controller.updateGroups()
    }

    const icons = {
        people: mdiAccountOutline,
        secret: mdiSafe,
        unknown: mdiPackageVariant
    }
    const getIcon = (name: string) => (icons as any)[name.toLowerCase()] || icons["unknown"]

    import { tooltip } from '../../reusables/tooltip'
</script>

<main>

    <section>
        <span
            on:click={() =>
                activeSortingMethod.set(
                    sortingMethods[(sortingMethods.indexOf($activeSortingMethod) + 1) % sortingMethods.length]
                )
            } 
            on:contextmenu|preventDefault={() =>
                activeSortingMethod.set($activeSortingMethod)
            }
        >
            <div style="margin-left: 2px"><Icon path={$activeSortingMethod.icon} size={0.8}/></div>
        </span>

        <span
            on:click={() => {
                traverse.set(!$traverse)
                localStorage.setItem('traverse', $traverse.toString())
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
        {#each $clusters as c}
            <span
            on:mousedown={() => changeCluster(c.id)}
            title={c.name}
            class:active={$cluster.id == c.id}
            >
                <Icon path={getIcon(c.name)} size={0.8} />
            </span>
        {/each}
    </section>

    <section>
        <span>
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

        span {
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

            &:hover {
                background: hsl(0, 0%, 22%);
                border: 1px solid hsl(0, 0%, 24%);
            }
            &.active {
                background: hsl(0, 0%, 24%);
                border: 1px solid hsl(0, 0%, 33%);
            }
        }
    }
</style>