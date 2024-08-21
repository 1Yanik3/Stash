<script lang="ts">
  import Button from "$components/Button.svelte"
  import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
  import Table from "$components/Table.svelte"
  import Popup from "$reusables/Popup.svelte"

  let { data } = $props()

  const colourPalletteStatus = {
    created: "#eed18c",
    running: "#6fb5e0",
    completed: "grey",
    failed: "red",
    invalid: "red"
  } as const

  let jobDetails: null | (typeof data.jobs)[number] = $state(null)
</script>

<SettingsPageContent title="Jobs">
  <Table headers={["id", "name", "status"]} data={data.jobs} let:entry>
    <td>{entry.id}</td>
    <td>{entry.name}</td>
    <td style="color: {colourPalletteStatus[entry.status]}">{entry.status}</td>
    <div>
      <Button
        noMargin
        icon="mdiInformation"
        onclick={() => (jobDetails = entry)}
      />
    </div>
  </Table>
</SettingsPageContent>

{#if jobDetails}
  <Popup
    title="Job details for {jobDetails.id}"
    onclose={() => (jobDetails = null)}
  >
    <pre>{JSON.stringify(jobDetails, null, 2)}</pre>
  </Popup>
{/if}

<style lang="scss">
  div {
    position: absolute;
    top: 0;
    right: 0;
  }
</style>
