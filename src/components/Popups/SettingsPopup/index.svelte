<script lang="ts">
    import Popup from "../../../reusables/Popup.svelte";
    import Sidebar from "./components/Sidebar.svelte";
    import About from "./tabs/about.svelte";
    import General from "./tabs/general.svelte";
    import Jobs from "./tabs/jobs.svelte";
    import Statistics from "./tabs/statistics.svelte";
    import TagIcons from "./tabs/tagIcons.svelte";

    let activeTab = "general";
</script>

<Popup title="Settings">
    <main>
        <Sidebar bind:activeTab />

        <section>
            {#if activeTab == "general"}
                <General />
            {/if}

            {#if activeTab == "jobs"}
                <Jobs />
            {/if}

            {#if activeTab == "tag-icons"}
                <TagIcons />
            {/if}

            {#if activeTab == "statistics"}
                <Statistics />
            {/if}

            {#if activeTab == "about"}
                <About />
            {/if}
        </section>
    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: auto 1fr;
        grid-template-rows: 23em;

        section {
            gap: 2em;
            padding: 1em;
            overflow: scroll;
        }
    }
</style>
