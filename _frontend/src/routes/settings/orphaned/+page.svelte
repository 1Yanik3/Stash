<script lang="ts">
  import { invalidateAll } from "$app/navigation"
  import Button from "$components/Button.svelte"
  import SettingsPageHeader from "$components/Settings/SettingsPageHeader.svelte"
  import Table from "$components/Table.svelte"

  import type { PageData } from "./$types"

  export let data: PageData

  const importOrphan = async (cluster: number, filename: string) => {
    const response = await fetch(`/api/cluster/${cluster}/import`, {
      method: "POST",
      body: JSON.stringify({
        filename
      })
    })

    if (!response.ok) throw "Something went wrong with the import"
    invalidateAll()
  }
</script>

<SettingsPageHeader title="Orphaned Files" />

<Table data={data.unimportedFiles} let:entry>
  <td>
    <a href="https://stash.hera.lan/file/{entry}">{entry}</a>
    {#each data.clusters as cluster}
      <Button
        noMargin
        icon="mdiImport"
        on:click={() => {
          importOrphan(cluster.id, entry)
        }}
      >
        {cluster.name}
      </Button>
    {/each}
  </td>
</Table>

<style lang="scss">
  td {
    display: flex;
    justify-content: end;
    align-items: center;

    a {
      flex-grow: 1;
    }
  }
</style>
