<script lang="ts">
  import { ClusterType } from "@prisma/client/wasm"

  import { invalidateAll } from "$app/navigation"
  import Button from "$components/Button.svelte"
  import Icon from "$components/Icon.svelte"
  import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
  import Table from "$components/Table.svelte"
  import { prompts } from "$lib/controllers/PromptController"
  import { possibleIcons } from "$lib/possibleIcons"

  import type { PageData } from "./$types"
  import AddNewClusterPopup from "./AddNewClusterPopup.svelte"

  export let data: PageData

  let popup: AddNewClusterPopup | null = null

  const editClusterAttribute = async (
    id: number,
    attribute: "name" | "icon" | "type",
    value: string
  ) => {
    if (!["name", "icon", "type"].includes(attribute)) {
      window.alert(`Invalid attribute: ${attribute}`)
      return
    }

    if (attribute == "icon" && !Object.keys(possibleIcons).includes(value)) {
      window.alert(`Invalid icon: ${value}`)
      return
    }

    if (attribute == "type" && !Object.keys(ClusterType).includes(value)) {
      window.alert(`Invalid type: ${value}`)
      return
    }

    const response = await fetch("/settings/clusters/edit", {
      method: "POST",
      body: JSON.stringify({ id, attribute, value })
    })

    if (!response.ok) {
      window.alert(`Something went wrong, got status: ${response.status}`)
      console.error(await response.text())
      return
    }

    invalidateAll()
    close()
  }
</script>

<SettingsPageContent title="Clusters">
  {#snippet headerActions()}
    <Button
      card
      icon="mdiPlus"
      on:click={() =>
        (popup = new AddNewClusterPopup({
          target: document.body,
          props: {
            close: () => {
              popup?.$destroy()
            }
          }
        }))}
    >
      Add new cluster
    </Button>
  {/snippet}

  <Table
    headers={["Id", "Icon", "Name", "Type"]}
    data={data.clusters}
    let:entry
  >
    <td>
      {entry.id}
    </td>
    <td>
      <Icon nameAlt={entry.icon} />
      {entry.icon}
      <div class="floating">
        <Button
          icon="mdiPencil"
          on:click={async () => {
            // TODO: Icon Picker
            const newIcon = await prompts.text("New icon", entry.icon)
            if (newIcon) editClusterAttribute(entry.id, "icon", newIcon)
          }}
        />
      </div>
    </td>
    <td>
      {entry.name}
      <div class="floating">
        <Button
          icon="mdiPencil"
          on:click={async () => {
            const newName = await prompts.text("New name", entry.name)
            if (newName) editClusterAttribute(entry.id, "name", newName)
          }}
        />
      </div>
    </td>
    <td>
      {entry.type.substring(0, 1).toUpperCase() + entry.type.substring(1)}
      <div class="floating">
        <Button
          icon="mdiPencil"
          on:click={async ({ detail }) => {
            const newType = await prompts.dropdown(
              detail.target?.closest("td"),
              Object.keys(ClusterType),
              entry.type
            )
            if (newType && newType != entry.type)
              editClusterAttribute(entry.id, "type", newType)
          }}
        />
      </div>
    </td>
  </Table>
</SettingsPageContent>

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
