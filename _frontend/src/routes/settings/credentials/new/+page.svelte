<script lang="ts">
    import { bcrypt } from "hash-wasm"

    import { goto, invalidateAll } from "$app/navigation"
    import Button from "$components/elements/Button.svelte"
    import query from "$lib/client/call"
    import Popup from "$reusables/Popup.svelte"

    import type { PageProps } from "./$types"

    let { data }: PageProps = $props()

    let username = $state("")
    let password = $state("")
</script>

<Popup>
    <main>
        <label>
            <span>Username</span>
            <input type="text" bind:value={username} />
        </label>
        <label>
            <span>Password</span>
            <input type="password" bind:value={password} />
        </label>
    </main>

    {#snippet actionsRight()}
        <Button
            card
            icon="mdiPlus"
            onclick={async () => {
                const salt =
                    (Math.random() + 1).toString(36).substring(4) +
                    (Math.random() + 1).toString(36).substring(4)
                const hash = await bcrypt({ costFactor: 10, password, salt })
                await query("createCredential", {
                    username,
                    hash,
                    salt: salt.toString()
                })
                invalidateAll()
                goto("/settings/credentials")
            }}
        >
            Add
        </Button>
    {/snippet}
</Popup>

<style lang="scss">
    main {
        display: grid;
        gap: 0.5rem;

        label {
            display: grid;
            grid-template-columns: 100px 1fr;
            align-items: center;
        }
    }
</style>
