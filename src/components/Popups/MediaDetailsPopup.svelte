<script lang="ts">
  import { controller, visibleMedium } from "$lib/stores"
  import Popup from "$reusables/Popup.svelte"
  import Button from "../Button.svelte"
  import Icon from "../Icon.svelte"

  function toIsoString(date: Date) {
    const pad = (num: number) => (num < 10 ? "0" : "") + num

    return (
      date.getFullYear() +
      "-" +
      pad(date.getMonth() + 1) +
      "-" +
      pad(date.getDate()) +
      " " +
      pad(date.getHours()) +
      ":" +
      pad(date.getMinutes()) +
      ":" +
      pad(date.getSeconds())
    )
  }

  const rename = async (suggestedName = $visibleMedium?.name) => {
    if (!$visibleMedium) return

    const newName = await $controller
      .prompt()
      .text("Enter new name", suggestedName)
    if (newName) {
      $visibleMedium.name = newName
      fetch(`/api/media/${$visibleMedium.id}/rename`, {
        method: "PUT",
        body: JSON.stringify({
          name: newName
        })
      })
    }
  }
</script>

<Popup title="Media Details">
  {#if $visibleMedium}
    <main>
      <div>
        <Icon name="mdiFormTextbox" />
        <span>{$visibleMedium.name}</span>
        {#if $visibleMedium.name.endsWith(".mp4")}
          <Button
            icon="mdiCreation"
            styleOverride="margin-right: -1em"
            on:click={async () => {
              if (!$visibleMedium) return

              const request = await fetch("/api/ai/prompt", {
                method: "POST",
                body: JSON.stringify({
                  prompt: `
                    extract the plain title from this filename.
                    - Answer inline
                    - Do NOT output extra commentary, descriptions, notes, or context
                    - Do not output the name of the production company
                    - Do not rephrase or change the title
                    - Output without quotation marks.
                    - If the filename mentions the names of people, add then to the end in brackets separated by a comma
                    - Your output should look something like this: "<TITLE> (<PERSON 1>, <PERSON 2>)"
                    "${$visibleMedium.name}"
                  `.replace(/^\s+|\s+$/gm, '')
                })
              })

              if (!request.ok) {
                console.error(await request.text())
                window.alert("Failed to get title from filename")
                return
              }

              rename(await request.text())
            }}
          />
        {/if}
        <Button
          icon="mdiPencil"
          on:click={() => {
            if (!$visibleMedium) return
            rename($visibleMedium.name)
          }}
        />
      </div>

      <section>
        <div>
          <b>Metadata</b>
          <Button icon="mdiReload" />
        </div>

        <div>
          <Icon name="mdiMoveResize" />
          <span>{$visibleMedium.width}x{$visibleMedium.height}</span>
        </div>

        <div>
          <Icon name="mdiCalendar" />
          <span>{toIsoString(new Date($visibleMedium.date))}</span>
        </div>
      </section>
    </main>
  {/if}
</Popup>

<style lang="scss">
  main {
    display: grid;
    gap: 0.75em;

    div {
      display: flex;
      align-items: center;
      gap: 0.5em;

      span {
        flex-grow: 1;
      }
    }

    section {
      display: grid;
      gap: 1em;
      div:first-child {
        justify-content: space-between;
        margin-bottom: -10px;
        b {
          font-size: 1.1em;
        }
      }
      div:not(:first-child) {
        margin-left: 1em;
      }
    }
  }
</style>
