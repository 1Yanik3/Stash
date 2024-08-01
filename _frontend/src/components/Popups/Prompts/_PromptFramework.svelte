<script lang="ts">
  import { createEventDispatcher } from "svelte"

  import Button from "$components/Button.svelte"
  import Popup from "$reusables/Popup.svelte"

  const dispatch = createEventDispatcher()

  export let noCancel = false
</script>

<Popup on:close={() => dispatch("cancel", false)}>
  <slot />

  <svelte:fragment slot="actionsLeft">
    {#if !noCancel}
      <Button
        card
        icon={null}
        on:click={() => {
          dispatch("cancel")
        }}
      >
        Cancel
      </Button>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="actionsRight">
    <Button card icon={null} highlighted on:click={() => dispatch("ok")}>
      Ok
    </Button>
  </svelte:fragment>
</Popup>
