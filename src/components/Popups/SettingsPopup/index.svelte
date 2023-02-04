<script lang="ts">
    import Popup from "../../../reusables/Popup.svelte"
    import Shortcut from "../../../reusables/Shortcut.svelte"
    import Sidebar from "./components/Sidebar.svelte";

    import About from "./tabs/about.svelte";
    import General from "./tabs/general.svelte";
    import Credentials from "./tabs/credentials.svelte"
    import Statistics from "./tabs/statistics.svelte";
    import Jobs from "./tabs/jobs.svelte";

    export let isSettingsVisible = true
    
    let activeTab = "general"
</script>

<Shortcut meta key="," action={() => isSettingsVisible = true} />
<Popup title="Settings" bind:visible={isSettingsVisible}>
    <main>

        <Sidebar bind:activeTab/>

        <section >
            {#if activeTab == "general"}
                <General/>
            {/if}

            {#if activeTab == "credentials"}
                <Credentials/>
            {/if}

            {#if activeTab == "jobs"}
                <Jobs/>
            {/if}

            {#if activeTab == "statistics"}
                <Statistics/>
            {/if}

            {#if activeTab == "about"}
                <About/>
            {/if}
        </section>

    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: auto 30em;
        grid-template-rows: 23em;

        section {
            gap: 2em;
            padding: 1em;
            overflow: scroll;
        }
    }
</style>