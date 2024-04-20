<script lang="ts">
  import { fade } from "svelte/transition"
  import Button from "$components/Button.svelte"
</script>

<main in:fade>
  {#await fetch(`/api/jobs/list`).then( res => res.json() ) then { missingDateExtraction, inTrash }}
    <div class="job">
      <span class="title">Trash</span>
      <div class="action">
        <Button card icon="mdiTrashCanOutline">Clear Trash</Button>
      </div>

      <span class="description">
        Contains {inTrash} Media files
      </span>
    </div>

    <div class="job">
      <span class="title">Missing Date extraction</span>
      <div class="action">
        <Button card icon="mdiScanner">Retry extraction</Button>
      </div>

      <span class="description">
        There are {missingDateExtraction} Media files with missing Metadata
      </span>
    </div>
  {/await}
</main>

<style lang="scss">
  main {
    display: grid;
    gap: 1em;

    .job {
      display: grid;
      grid-template-columns: 1fr auto;

      padding: 0.65em;

      background: hsl(0, 0%, 7%);
      border: 1px solid hsl(0, 0%, 17%);
      border-radius: 0.6em;
      box-shadow:
        rgba(0, 0, 0, 0.3) 0px 1px 3px 0px,
        rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

      .title {
        font-weight: bold;
      }

      .action {
        grid-row: span 2;
        margin-left: 0.25em;
      }
    }
  }
</style>
