<script lang="ts">
    import type { Snippet } from "svelte"

    type Props = {
        title?: string
        children: Snippet
        headerActions?: Snippet
    }

    let { title, children, headerActions }: Props = $props()
</script>

<main>
    <div class="header">
        {#if title}
            <h1>{title}</h1>
        {/if}
        {#if headerActions}
            <div class="actions">
                {@render headerActions()}
            </div>
        {/if}
    </div>
    <div class="content">
        {@render children()}
    </div>
</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-rows: max-content 1fr;
        height: calc(100vh - 2em);
        padding: 1em;

        .header {
            display: flex;
            justify-content: space-between;

            h1 {
                margin-top: 0;
            }

            .actions {
                display: flex;
                gap: 0.5em;
                justify-content: flex-end;
                height: max-content;
            }
        }

        .content {
            overflow-y: scroll;
        }
    }
</style>
