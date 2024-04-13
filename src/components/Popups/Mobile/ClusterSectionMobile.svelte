<script lang="ts">
    import { controller } from "$lib/stores";
    import Popup from "$reusables/Popup.svelte";
    import ClusterSection from "../../../routes/[cluster]/ClusterSection.svelte";
</script>

<Popup bottomSheet on:close={() => $controller.setPopup(null)}>
    <ClusterSection />
</Popup>
