<script lang="ts">
  import Select from "$components/Select.svelte"
  import SettingsPageHeader from "$components/Settings/SettingsPageHeader.svelte"
  import Toggle from "$components/Toggle.svelte"
  import { settings } from "$lib/stores"
</script>

<SettingsPageHeader title="General" />
<section>
  <div>
    <span>Tooltip Enabled</span>
    <Toggle
      state={$settings.tooltipEnabled}
      on:toggle={e =>
        settings.update(s => {
          s.tooltipEnabled = e.detail
          return s
        })}
    />
  </div>

  <div>
    <span>Window-Controls spacing</span>
    <Toggle
      state={$settings.windowControlsSpacer}
      on:toggle={e =>
        settings.update(s => {
          s.windowControlsSpacer = e.detail
          return s
        })}
    />
  </div>

  <div>
    <span>Mobile Navigation Touch areas</span>
    <Select
      options={[
        { value: "navigate", name: "Navigate" },
        { value: "zoom", name: "Zoom" }
      ]}
      bind:value={$settings.imageTapAction}
    />
  </div>

  <div>
    <span>Mobile Layout</span>
    <Toggle
      state={$settings.mobileLayout}
      on:toggle={e =>
        settings.update(s => {
          s.mobileLayout = e.detail
          return s
        })}
    />
  </div>

  <div>
    <span>Theme</span>
    <Select
      options={[
        { value: "default", name: "Default" },
        { value: "light", name: "Light" },
        { value: "amoled", name: "Amoled" }
      ]}
      bind:value={$settings.theme}
    />
  </div>
</section>

<style lang="scss">
  section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem 1rem;

    max-width: 475px;

    div {
        display: flex;
        align-items: center;
        span {
            flex-grow: 1;
        }
    }
  }
</style>
