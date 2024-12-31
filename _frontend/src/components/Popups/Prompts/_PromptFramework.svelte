<script lang="ts">
  import Button from "$components/elements/Button.svelte"
  import Popup from "$reusables/Popup.svelte"

  interface Props {
    oncancel: () => void
    onok: () => void
    noCancel?: boolean
    children?: import("svelte").Snippet
  }

  let { oncancel, onok, noCancel = false, children }: Props = $props()
</script>

<Popup onclose={oncancel}>
  {@render children?.()}

  {#snippet actionsLeft()}
    {#if !noCancel}
      <Button card icon={null} onclick={oncancel}>Cancel</Button>
    {/if}
  {/snippet}

  {#snippet actionsRight()}
    <Button card icon={null} highlighted onclick={onok}>Ok</Button>
  {/snippet}
</Popup>
