<script lang="ts">
  import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"

  import type { PageData } from "./$types"

  interface Props {
    data: PageData
  }

  let { data }: Props = $props()
</script>

<SettingsPageContent title="Statistics">
  <main>
    <section>
      <span>Media Count</span>
      <b>{data.countOfMedia}</b>
    </section>
  </main>
</SettingsPageContent>

<style lang="scss">
  main {
    display: flex;
    gap: 1em;

    section {
      display: flex;
      flex-direction: column;
      gap: 0.25em;

      padding: 0.75em;
      border: 1px solid var(--border-color-1);
      border-radius: 0.5em;

      background: var(--color-dark-level-base);

      b {
        font-size: 2.5rem;
      }
    }
  }
</style>
