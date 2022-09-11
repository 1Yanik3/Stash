<script lang="ts">
    import { mdiAccountOutline, mdiPackageVariant, mdiSafe } from '@mdi/js'
    import Icon from 'mdi-svelte'

    import { cluster, clusters } from '../stores'

    export let controller: any

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
</script>

<main>
    {#each $clusters as c}
        <div on:mousedown={() => changeCluster(c.id)}>
            <Icon path={getIcon(c.name)} size={0.8} />
            <span>{c.name}</span>
        </div>
    {/each}
</main>

<style lang="scss">

    main {
        position: fixed;
        z-index: 3;

        margin: 0.5em;
        left: 0;
        top: 0;

        box-shadow: rgba(0, 0, 0, 0.3) 0px 2px 6px 0px, rgba(0, 0, 0, 0.2) 0px 2px 4px 0px;
        border: 1px solid hsl(0, 0%, 30%);
        background: hsl(0, 0%, 19%);
        border-radius: 0.35em;

        display: grid;

        div {
            padding: 0.5em;
            cursor: pointer;

            &:first-child { border-radius: 0.35em 0.35em 0 0 }
            &:last-child  { border-radius: 0 0 0.35em 0.35em }

            &:hover {
                background: hsl(0, 0%, 12%);
            }

            display: grid;
            grid-template-columns: 1.75em 1fr;
        }
    }

</style>