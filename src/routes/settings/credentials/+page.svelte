<script lang="ts">
  import SettingsPageHeader from "$components/Settings/SettingsPageHeader.svelte"
  import Table from "$components/Table.svelte"
  import Button from "$components/Button.svelte"
  import type { PageData } from "./$types"

  export let data: PageData
</script>

<SettingsPageHeader title="Credentials">
  <Button card icon="mdiLogout" href="/settings/credentials/logout">
    Logout
  </Button>
</SettingsPageHeader>

<Table
  headers={["Username", "Permitted Clusters"]}
  data={data.credentials}
  let:entry
>
  <td>{entry.username}</td>
  <td>{entry.permittedClusters.map(c => c.name).join(", ")}</td>
</Table>

<style lang="scss">
</style>
