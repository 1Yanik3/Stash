<script lang="ts">
  import Select from "$components/elements/Select.svelte"
  import { setSpecialFilterAttribute } from "$lib/client/actions/mediaActions.svelte"
  import { mediaController } from "$lib/controllers/MediaController.svelte"

  let { hideName = true } = $props()
</script>

{#if mediaController.visibleMedium}
  <Select
    value={mediaController.visibleMedium.specialFilterAttribute ||
      mediaController.visibleMedium.specialFilterAttributeGuess}
    options={[
      { value: null, name: "Unknown", icon: "mdiAccountQuestion", disabled: true },
      { value: "solo", name: "Solo", icon: "mdiAccount" },
      { value: "two", name: "Two", icon: "mdiAccountMultiple" },
      { value: "three", name: "Three", icon: "mdiAccountGroup" },
      { value: "group", name: "Group", icon: "mdiAccountMultiplePlus" }
    ]}
    width={hideName ? 40 : 120}
    {hideName}
    onchange={newValue => {
      if (!newValue) return
      setSpecialFilterAttribute(mediaController.visibleMedium as any, newValue)
    }}
  />
{:else}
  <span>ERROR</span>
{/if}
