<script lang="ts">
    import Popup from "../../reusables/Popup.svelte"
    import Shortcut from "../../reusables/Shortcut.svelte"
    import SettingsPopupToggle from './SettingsPopup_Toggle.svelte'

    import { settings } from '../../stores'

    export let isSettingsVisible = true
</script>

<Shortcut meta key="," action={() => isSettingsVisible = true} />
<Popup title="Settings" bind:visible={isSettingsVisible}>
    <main>

        <span>Mobile Navigation Touch areas</span>
        <SettingsPopupToggle
            state={$settings.mobileNavigationButtons}
            on:toggle={e => settings.update(s => { 
                s.mobileNavigationButtons = e.detail
                return s
            })}
        />

        <span>Window-Controls spacing</span>
        <SettingsPopupToggle
            state={$settings.windowControlsSpacer}
            on:toggle={e => settings.update(s => { 
                s.windowControlsSpacer = e.detail
                return s
            })}
        />

    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.25em;
        padding: 0.5em;

        align-items: center;
    }
</style>