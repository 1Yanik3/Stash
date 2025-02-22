<script lang="ts">
  import { onMount } from "svelte"

  import Table from "$components/elements/Table.svelte"
  import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"

  let { data } = $props()

  onMount(async () => {
    console.log("data", await data.queries)
  })
</script>

<SettingsPageContent title="Jobs">
  <Table
    headers={["Timestamp", "Query", "Duration"]}
    data={Object.values(data.queries)}
  >
    {#snippet children({ entry })}
      {@const object = JSON.parse(entry)}
      <td>{object.timestamp}</td>
      <td>{object.query}</td>
      <td>{object.duration}ms</td>
    {/snippet}
  </Table>
</SettingsPageContent>

<style lang="scss">
</style>
