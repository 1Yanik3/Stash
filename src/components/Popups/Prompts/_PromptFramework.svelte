<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import Popup from "../../../reusables/Popup.svelte"
  import SidebarButton from "../../../routes/[cluster]/SidebarButton.svelte"

  const dispatch = createEventDispatcher()
</script>

<Popup on:close={() => dispatch("cancel", false)}>
  <slot />

  <svelte:fragment slot="actionsLeft">
    <SidebarButton
      card
      icon={null}
      on:click={() => {
        dispatch("cancel")
      }}
    >
      Cancel
    </SidebarButton>
  </svelte:fragment>

  <svelte:fragment slot="actionsRight">
    <SidebarButton card icon={null} highlighted on:click={() => dispatch("ok")}>
      Ok
    </SidebarButton>
  </svelte:fragment>
</Popup>
