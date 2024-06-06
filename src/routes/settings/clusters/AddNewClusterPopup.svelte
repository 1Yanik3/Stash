<script lang="ts">
  import { invalidateAll } from "$app/navigation"
  import Button from "$components/Button.svelte"
  import { possibleIcons } from "$lib/possibleIcons"
  import Popup from "$reusables/Popup.svelte"
  import { ClusterType } from "@prisma/client"

  export let close: () => void

  let name = ""
  let icon = ""
  let type = "normal"
  let errors: string[] = []

  const validate = () => {
    errors = []

    if (!Object.keys(possibleIcons).includes(icon)) errors.push("icon")

    return errors.length === 0
  }

  const addNewCluster = async () => {
    if (!validate()) return

    const response = await fetch("/settings/clusters/create", {
      method: "POST",
      body: JSON.stringify({ name, icon, type })
    })

    if (!response.ok) {
      window.alert("Something went wrong, got status " + response.status)
      console.error(await response.text())
      return
    }

    invalidateAll()
    close()
  }
</script>

<Popup title="Add new Cluster" on:close={close}>
  <section>
    <label for="e-name"> Name </label>
    <input
      bind:value={name}
      class:invalid={errors.includes("name")}
      type="text"
      id="e-name"
      on:input={validate}
    />

    <!-- TODO: Search ability and preview -->
    <label for="e-icon"> Icon </label>
    <input
      bind:value={icon}
      class:invalid={errors.includes("icon")}
      type="text"
      id="icon"
      on:input={validate}
    />

    <label for="e-type"> Type </label>
    <select bind:value={type} id="e-type">
      {#each Object.keys(ClusterType) as type}
        <option value={type}
          >{type.substring(0, 1).toUpperCase()}{type.substring(1)}</option
        >
      {/each}
    </select>
  </section>

  <svelte:fragment slot="actionsLeft">
    <Button card on:click={close}>Cancel</Button>
  </svelte:fragment>

  <svelte:fragment slot="actionsRight">
    <Button
      card
      highlighted
      icon="mdiPlus"
      on:click={addNewCluster}
      shortcut={{ modifier: "meta", key: "enter" }}
    />
  </svelte:fragment>
</Popup>

<style lang="scss">
  section {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5em 1em;
    align-items: center;

    input.invalid {
      outline: 1px solid red !important;
    }
  }
</style>
