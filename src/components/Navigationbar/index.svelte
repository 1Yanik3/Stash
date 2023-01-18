<script lang="ts">
    import { settings } from '$lib/stores'

    import ClusterSection from './ClusterSection.svelte'
    import NavigationSection from './NavigationSection.svelte'
</script>

<main style={$settings.windowControlsSpacer ? "grid-template-columns: 68px 1fr" : ""} >

    <ClusterSection/>

    <NavigationSection/>

</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 65px 1fr;
    }
</style>