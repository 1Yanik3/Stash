<script lang="ts">
    import type { Medium } from 'src/types';

    import Icon from 'mdi-svelte'
    import { mdiClose, mdiDownload, mdiFullscreen, mdiInformationOutline, mdiOpenInNew, mdiPencil } from '@mdi/js'

    export let visibleMedium: Medium | null
</script>

<main>
    <div>

        <div on:click={() => visibleMedium = null}>
            <Icon path={mdiClose}/>
        </div>
        <div>
            <Icon path={mdiDownload} size={0.8}/>
        </div>
        <div>
            <Icon path={mdiFullscreen}/>
        </div>

    </div>

    <span>{visibleMedium?.name}</span>

    <div>

        <div>
            <Icon path={mdiOpenInNew} size={0.8}/>
        </div>
        <div>
            <Icon path={mdiInformationOutline} size={0.8}/>
        </div>
        <div>
            <Icon path={mdiPencil} size={0.8}/>
        </div>
    </div>

</main>

<style lang="scss">
    main {
        box-shadow: inset 0 -0.7px 0 rgba($color: #fff, $alpha: 0.15);
        padding: 0.35em;

        display: flex;
        justify-content: space-between;
        align-items: center;

        & > div {
            display: flex;
            align-items: center;

            div {
                height: 30px;
                width: 30px;

                display: flex;
                align-items: center;
                justify-content: center;

                cursor: pointer;
            }
        }
    }
</style>