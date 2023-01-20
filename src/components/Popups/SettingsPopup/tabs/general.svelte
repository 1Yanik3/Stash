<script lang="ts">
    import SettingsPopupToggle from '../components/Toggle.svelte'

    import { settings } from '$lib/stores'
    import { fade } from 'svelte/transition';
</script>

<main in:fade>
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

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 0.25em 1em;
        align-items: flex-start;
    }
</style>