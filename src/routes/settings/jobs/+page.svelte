<script lang="ts">
  import SettingsPageHeader from "$components/Settings/SettingsPageHeader.svelte"
  import Table from "$components/Table.svelte"
  import type { PageData } from "./$types"

  export let data: PageData
</script>

<SettingsPageHeader title="Jobs" />

{#each data.queues as { queueName, jobs }}
  <h1>{queueName}</h1>
  <Table headers={["title", "progress", "id", "status"]} data={jobs} let:entry>
    <td>{entry.name}</td>
    <td>{entry.progress}</td>
    <td>{entry.id}</td>
    <td>{entry.failedReason || "waiting"}</td>
  </Table>
{/each}

<style lang="scss">
</style>
