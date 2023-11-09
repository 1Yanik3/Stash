<script lang="ts">
    import { controller, settings } from "../lib/stores";
    import SidebarButton from "../routes/[cluster]/SidebarButton.svelte";
</script>

<main>
    <!-- Cluster Section (Clusters and Settings) -->
    <SidebarButton
        icon="mdiMenu"
        card
        on:click={() => $controller.setPopup("Cluster Section Mobile")}
    />

    <!-- Navigation Section (Tags) -->
    <!-- or mdiAnimation -->
    <SidebarButton
        icon="mdiTagMultiple"
        card
        on:click={() => $controller.setPopup("Navigation Section Mobile")}
    />

    <div class="spacer" />

    <!-- Quick Switch -->
    <SidebarButton
        icon="mdiTabSearch"
        card
        on:click={() => $controller.setPopup("Quick Switch")}
    />

    <!-- Quick Actions -->
    <SidebarButton
        icon="mdiConsoleLine"
        card
        on:click={() => $controller.setPopup("Quick Actions")}
    />
</main>

<style lang="scss">
    main {
        background: #212121;
        border-top: 1px solid hsl(0, 0%, 30%); // 22

        display: flex;
        padding: 8px;

        .spacer {
            flex: 1;
        }
    }
</style>
