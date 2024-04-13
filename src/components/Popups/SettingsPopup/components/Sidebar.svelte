<script lang="ts">
    import Button from "$components/Button.svelte";

    export let activeTab: string;
</script>

<main>
    <span>
        <Button
            on:click={() => (activeTab = "general")}
            active={activeTab == "general"}
            icon="mdiCog"
        >
            General
        </Button>
    </span>

    <span>
        <Button
            on:click={() => (activeTab = "jobs")}
            active={activeTab == "jobs"}
            icon="mdiSync"
        >
            Jobs
        </Button>
    </span>

    <span>
        <Button
            on:click={() => (activeTab = "tag-icons")}
            active={activeTab == "tag-icons"}
            icon="mdiTagSearch"
        >
            Tag Icons
        </Button>
    </span>

    <div style="flex-grow: 1" />

    <span>
        <Button
            on:click={() => (activeTab = "statistics")}
            active={activeTab == "statistics"}
            icon="mdiChartBar"
        >
            Statistics
        </Button>
    </span>

    <span>
        <Button
            on:click={() => (activeTab = "about")}
            active={activeTab == "about"}
            icon="mdiInformationOutline"
        >
            About
        </Button>
    </span>
</main>

<style lang="scss">
    main {
        display: flex;
        flex-direction: column;

        margin-top: -0.5em;
        margin-bottom: -0.5em;
        margin-right: 0.5em;

        padding-top: 0.5em;
        padding-bottom: 0.5em;
        padding-right: 0.5em;

        border-right: 1px solid hsl(0, 0%, 22%);

        span {
            display: block;
            margin: 0.1em 0;
        }
    }
</style>
