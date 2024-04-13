<script lang="ts">
  import { createEventDispatcher } from "svelte"
  import Popup from "$reusables/Popup.svelte"
  import Button from "$components/Button.svelte"

  const dispatch = createEventDispatcher()
</script>

<Popup on:close={() => dispatch("cancel", false)}>
  <slot />

  <svelte:fragment slot="actionsLeft">
    <Button
      card
      icon={null}
      on:click={() => {
        dispatch("cancel")
      }}
    >
      Cancel
    </Button>
  </svelte:fragment>

  <svelte:fragment slot="actionsRight">
    <Button card icon={null} highlighted on:click={() => dispatch("ok")}>
      Ok
    </Button>
  </svelte:fragment>
</Popup>
