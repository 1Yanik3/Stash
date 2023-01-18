<script lang="ts">
    import { mdiCog, mdiInformation, mdiInformationOutline, mdiKeyChain } from "@mdi/js";
    import SidebarButton from "../../../SidebarButton.svelte";

    export let activeTab: string;
</script>

<main>
    <span>
        <SidebarButton
            on:click={() => activeTab = "general"}
            active={activeTab == "general"}
            icon={mdiCog}
        >
            General
        </SidebarButton>
    </span>

    <span>
        <SidebarButton
            on:click={() => activeTab = "credentials"}
            active={activeTab == "credentials"}
            icon={mdiKeyChain}
        >
            Credentials
        </SidebarButton>
    </span>

    <div style="flex-grow: 1" />

    <span>
        <SidebarButton
            on:click={() => activeTab = "about"}
            active={activeTab == "about"}
            icon={mdiInformationOutline}
        >
            About
        </SidebarButton>
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
