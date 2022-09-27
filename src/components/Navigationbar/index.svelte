<script lang="ts">
    export let controller: any

    import ClusterSection from './ClusterSection.svelte'
    import NavigationSection from './NavigationSection.svelte'
</script>

<main>

    <ClusterSection {controller}/>

    <NavigationSection {controller}/>

</main>


<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 65px 1fr;
    }
</style>