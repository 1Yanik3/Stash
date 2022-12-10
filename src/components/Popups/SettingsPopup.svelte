<script lang="ts">
    import Popup from "../../reusables/Popup.svelte"
    import Shortcut from "../../reusables/Shortcut.svelte"

    import SettingsPopupCredentials from "./SettingsPopup_Credentials.svelte"
    import SettingsPopupSettings from "./SettingsPopup_Settings.svelte"

    export let isSettingsVisible = true
</script>

<Shortcut meta key="," action={() => isSettingsVisible = true} />
<Popup title="Settings" bind:visible={isSettingsVisible}>
    <main>

        <div>
            <SettingsPopupSettings/>
        </div>

        <div>
            <SettingsPopupCredentials/>
        </div>

    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2em;
        padding: 1em;
    }
</style>