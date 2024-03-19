<script lang="ts">
  import { settings } from "$lib/stores"
  import Toggle from "$components/Popups/SettingsPopup/components/Toggle.svelte"
</script>

<main>
  <section>
    <span>Window-Controls spacing</span>
    <Toggle
      state={$settings.windowControlsSpacer}
      on:toggle={e =>
        settings.update(s => {
          s.windowControlsSpacer = e.detail
          return s
        })}
    />

    <span>Mobile Navigation Touch areas</span>
    <Toggle
      state={$settings.touchNavigationButtons}
      on:toggle={e =>
        settings.update(s => {
          s.touchNavigationButtons = e.detail
          return s
        })}
    />

    <span>Mobile Layout</span>
    <Toggle
      state={$settings.mobileLayout}
      on:toggle={e =>
        settings.update(s => {
          s.mobileLayout = e.detail
          return s
        })}
    />
  </section>
</main>

<style lang="scss">
  main {
    display: flex;
    section {
      display: grid;
      grid-template-columns: 300px auto;
      gap: 0.25em 1em;
      align-items: flex-start;
    }
  }
</style>
