<script lang="ts">
    import Popup from "../../reusables/Popup.svelte"
    import Shortcut from "../../reusables/Shortcut.svelte"

    import Key from './ShortcutPopup_Key.svelte'

    export let isShortcutsVisible = true
</script>

<Shortcut meta key="/" action={() => isShortcutsVisible = true} />
<Popup title="Shortcuts" bind:visible={isShortcutsVisible}>
    <main>
        <b>Navigation</b>
        <div>
            <span>Previous Group</span>
            <Key key="option" />
            <Key key="arrowUp" />
        </div>
        <div>
            <span>Next Group</span>
            <Key key="option" />
            <Key key="arrowDown" />
        </div>

        <b>Media Viewer</b>
        <div>
            <span>Toggle Fullscreen</span>
            <Key key="f" />
        </div>

        <b>Global</b>
        <div>
            <span>Open Settings</span>
            <Key key="command" />
            <Key key="," />
        </div>
        <div>
            <span>Open Shortcuts</span>
            <Key key="command" />
            <Key key="/" />
        </div>
    </main>
</Popup>

<style lang="scss">
    main {
        display: grid;
        gap: 0.25em;

        b {
            font-weight: 700;
            &:not(:first-child) { margin-top: 1em }
        }

        div {
            display: flex;
            align-items: center;

            span {
                flex-grow: 1;
            }
        }
    }
</style>