<script lang="ts">
  import Select from "$components/Select.svelte"
  import SettingsPageHeader from "$components/Settings/SettingsPageHeader.svelte"
  import Toggle from "$components/Toggle.svelte"
  import { settings } from "$lib/stores"
</script>

<SettingsPageHeader title="General" />
<section>
  <span>Tooltip Enabled</span>
  <Toggle
    state={$settings.tooltipEnabled}
    on:toggle={e =>
      settings.update(s => {
        s.tooltipEnabled = e.detail
        return s
      })}
  />

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
  <Select
    options={[
      { value: "navigate", name: "Navigate" },
      { value: "zoom", name: "Zoom" }
    ]}
    bind:value={$settings.imageTapAction}
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

  <span>Theme</span>
  <Select
    options={[
      { value: "default", name: "Default" },
      { value: "light", name: "Light" },
      { value: "amoled", name: "Amoled" }
    ]}
    bind:value={$settings.theme}
  />
</section>

<style lang="scss">
  section {
    display: grid;
    grid-template-columns: 300px auto;
    gap: 0.25em 1em;
    align-items: flex-start;

    max-width: 450px;
  }
</style>
