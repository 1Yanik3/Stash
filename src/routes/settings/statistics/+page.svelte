<script lang="ts">
  import SettingsPageHeader from "$components/Settings/SettingsPageHeader.svelte"
  import type { PageData } from "./$types"
  export let data: PageData
</script>

<SettingsPageHeader title="Statistics" />

<main>
  <section>
    <span>Media Count</span>
    <b>{data.countOfMedia}</b>
  </section>
</main>

<style lang="scss">
  main {
    display: flex;
    gap: 1em;

    section {
      background: $color-dark-level-base;
      border: 1px solid $border-color-1;
      border-radius: 0.5em;
      padding: 0.75em;

      display: flex;
      flex-direction: column;
      gap: 0.25em;

      b {
        font-size: 2.5rem;
      }
    }
  }
</style>
