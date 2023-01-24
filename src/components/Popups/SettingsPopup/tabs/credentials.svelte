<script lang="ts">
    import type { Credentials } from "@prisma/client";

    import Icon from "mdi-svelte";
    import * as icons from "@mdi/js";
    import { onMount } from "svelte";
    import { fade } from "svelte/transition";

    let credentials: Credentials[] = [];
    onMount(async () => {
        credentials = await fetch(`/api/credentials`).then((res) => res.json());
    });

    // @ts-ignore
    $: currentIcon = icons[`mdi${possibleIcons[icon % possibleIcons.length]}`];
    const possibleIcons: string[] = [
        "UsbFlashDrive",
        "Tablet",
        "Cellphone",
        "Laptop",
        "DesktopClassic",
        "Key",
        "KeyWireless",
    ];

    let icon = 0;
    let name = "";
    const createLogin = async () => {
        const token = `${window.alert(Math.random().toString(16).substring(2, 8))}-${window.alert(Math.random().toString(16).substring(2, 8))}`
        
        await fetch(`/api/credentials`, {
            method: "POST",
            body: JSON.stringify({
                icon: possibleIcons[icon % possibleIcons.length],
                name,
                token
            })
        });

        credentials = await fetch(`/api/credentials`).then((res) => res.json());
    };
</script>

<main in:fade>
    {#each credentials as credential}
        <div class="credential">
            <Icon path={icons[`mdi${credential.icon}`]} />
            <span>
                {credential.name}
                <!-- {#if credential.InviteCodes.length}
                    <span style="opacity: 0.5">({credential.InviteCodes[0].code})</span>
                {/if} -->
            </span>
            <span><Icon path={icons.mdiTrashCanOutline} size={0.8} /></span>
        </div>
    {/each}

    <div class="createField">
        <div
            on:click={() => icon++}
            style="display: flex; justify-content: center; align-items: center; cursor: pointer"
        >
            <Icon path={currentIcon} size={0.8} />
        </div>
        <input type="text" placeholder="Key name..." bind:value={name} />
        <button on:click={createLogin}>
            <Icon path={icons.mdiPlus} size={0.8} />
        </button>
    </div>
</main>

<style lang="scss">
    main {
        display: grid;
        gap: 0.5em;

        .credential {
            display: grid;
            grid-template-columns: auto 1fr auto;
            gap: 0.5em;
            align-items: center;

            padding: 0.5em;
            background: hsl(0, 0%, 7%);
            border-radius: 0.6em;
            border: 1px solid hsl(0, 0%, 17%);
            box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 3px 0px,
                rgba(0, 0, 0, 0.2) 0px 1px 2px 0px;

            span:last-child {
                cursor: pointer;

                transition: filter 200ms;
                &:hover {
                    filter: brightness(1.2);
                }
            }
        }

        .createField {
            display: grid;
            grid-template-columns: 3em 1fr auto;
            gap: 0.5em;

            padding: 0.5em;
            background: hsl(0, 0%, 7%);
            border: 1px solid hsl(0, 0%, 17%);
            border-radius: 0.6em;
        }
    }
</style>
