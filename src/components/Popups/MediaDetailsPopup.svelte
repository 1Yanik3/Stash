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
</script>

<Popup title="Media Details">
  {#if $visibleMedium}
    <main>
      <div>
        <Icon name="mdiFormTextbox" />
        <span>{$visibleMedium.name}</span>
        <Button
          icon="mdiPencil"
          on:click={async () => {
            if (!$visibleMedium) return

            const newName = await $controller.prompt().text(
              "Enter new name:",
              $visibleMedium.name
            )
            if (newName) {
              $visibleMedium.name = newName
              fetch(`/api/media/${$visibleMedium.id}/rename`, {
                method: "PUT",
                body: JSON.stringify({
                  name: newName
                })
              })
            }
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
