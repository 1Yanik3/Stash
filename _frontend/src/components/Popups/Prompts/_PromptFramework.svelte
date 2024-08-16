<script lang="ts">
  import Button from "$components/Button.svelte"
  import Popup from "$reusables/Popup.svelte"

  export let oncancel: () => void
  export let onok: () => void

  export let noCancel = false
</script>

<Popup on:close={oncancel}>
  <slot />

  <svelte:fragment slot="actionsLeft">
    {#if !noCancel}
      <Button
        card
        icon={null}
        on:click={oncancel}
      >
        Cancel
      </Button>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="actionsRight">
    <Button card icon={null} highlighted on:click={onok}>
      Ok
    </Button>
  </svelte:fragment>
</Popup>
