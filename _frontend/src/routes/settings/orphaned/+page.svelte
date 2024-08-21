<script lang="ts">
  import { invalidateAll } from "$app/navigation"
  import Button from "$components/Button.svelte"
  import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
  import Table from "$components/Table.svelte"

  import type { PageData } from "./$types"

  export let data: PageData

  const importOrphan = async (cluster: number, filename: string) => {
    const response = await fetch(`/settings/orphaned/${filename}`, {
      method: "POST",
      body: JSON.stringify({
        cluster: cluster
      })
    })

    if (!response.ok) throw "Something went wrong with the import"
    invalidateAll()
  }

  const deleteOrphan = async (filename: string) => {
    const response = await fetch(`/settings/orphaned/${filename}`, {
      method: "DELETE"
    })

    if (!response.ok) throw "Something went wrong with the deletion"
    invalidateAll()
  }
</script>

<SettingsPageContent title="Orphaned Files">
  <Table data={data.unimportedFiles} let:entry>
    <td>
      <a href="https://stash.hera.lan/file/{entry}">{entry}</a>
      {#each data.clusters as cluster}
        <Button
          noMargin
          on:click={() => {
            importOrphan(cluster.id, entry)
          }}
        >
          {cluster.name}
        </Button>
      {/each}
      <Button
        noMargin
        icon="mdiTrashCan"
        on:click={() => {
          deleteOrphan(entry)
        }}
      />
    </td>
  </Table>
</SettingsPageContent>

<style lang="scss">
  td {
    display: flex;
    align-items: center;
    justify-content: end;

    a {
      flex-grow: 1;
    }
  }
</style>
