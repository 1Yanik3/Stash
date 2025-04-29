<script lang="ts">
    import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
</script>

<SettingsPageContent>
    <div class="wrapper">
        <main>
            <div class="details">
                <img src="/icons/web/icon-512-maskable.png" alt="" />
                <b>Stash</b>
                <span>By <a href="https://ant.lgbt/">ConfusedAnt</a></span>
            </div>

            <p class="description">
                A featureful tag based library to <br /> organise your media collections
            </p>
        </main>
    </div>
</SettingsPageContent>

<style lang="scss">
    .wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;

        main {
            display: flex;
            flex-direction: column;
            align-items: center;

            .details {
                display: grid;
                grid-template-columns: auto 1fr;

                img {
                    grid-row: span 2;
                    height: 4em;
                    margin-right: 0.75em;
                    border-radius: 0.65em;
                }

                b {
                    font-size: 1.5em;
                }
            }
        }
    }
</style>
