<script lang="ts">
  import SettingsPageHeader from "$components/Settings/SettingsPageHeader.svelte"
  import Table from "$components/Table.svelte"
  import Button from "$components/Button.svelte"
  import type { PageData } from "./$types"
  import { controller } from "$lib/stores"
  import { invalidateAll } from "$app/navigation"

  export let data: PageData

  const editUsername = async (id: number, newUsername: string) => {
    const response = await fetch("/settings/credentials/edit/username", {
      method: "POST",
      body: JSON.stringify({ id, username: newUsername })
    })

    if (!response.ok) {
      window.alert(`Something went wrong, got status: ${response.status}`)
      console.error(await response.text())
      return
    }

    invalidateAll()
  }

  const editPermittedClusters = async (id: number, newClusters: number[]) => {
    const response = await fetch("/settings/credentials/edit/clusters", {
      method: "POST",
      body: JSON.stringify({ id, clusters: newClusters })
    })

    if (!response.ok) {
      window.alert(`Something went wrong, got status: ${response.status}`)
      console.error(await response.text())
      return
    }

    invalidateAll()
  }
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
  <td>
    {entry.username}
    <div class="floating">
      <Button
        noMargin
        icon="mdiPencil"
        on:click={async () => {
          const newName = await $controller
            .prompt()
            .text("New name", entry.username)
          if (newName) editUsername(entry.id, newName)
        }}
      />
    </div>
  </td>
  <td>
    {entry.permittedClusters.map(c => c.name).join(", ")}
    <div class="floating">
      <Button
        noMargin
        icon="mdiPencil"
        on:click={async () => {
          const newClusters = await $controller.prompt().selectMultiple(
            "Permitted Clusters",
            data.allClusters.map(c => ({ value: c.id.toString(), name: c.name })),
            entry.permittedClusters.map(c => c.id.toString())
          )
          if (newClusters)
            editPermittedClusters(
              entry.id,
              newClusters.map(v => +v)
            )
        }}
      />
    </div>
  </td>
</Table>

<style lang="scss">
  td {
    position: relative;
    .floating {
      position: absolute;
      top: 0;
      right: 0;
    }

    &:not(:hover) {
      .floating {
        display: none;
      }
    }
  }
</style>
