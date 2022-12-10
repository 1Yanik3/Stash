<script lang="ts">
    import SidebarButton from "../../components/SidebarButton.svelte";
    import {
        startRegistration,
        startAuthentication,
    } from "@simplewebauthn/browser";

    let inviteCode = "";

    const register = async () => {
        const registration = await fetch("/auth/register/generate", {
            method: "POST",
            body: JSON.stringify({
                inviteCode
            })
        })
            .then((res) => res.json())
            .then(startRegistration)
            .catch((e) => {
                window.alert(e);
                throw e;
            });

        const verification: { verified: boolean } = await fetch(
            "/auth/register/verify",
            {
                method: "POST",
                body: JSON.stringify({
                    credential: registration,
                    inviteCode
                }),
            }
        )
            .then((res) => res.json())
            .catch((e) => {
                window.alert(e);
                throw e;
            });

        window.location.reload();
    };

    const login = async () => {
        const authorisation = await fetch("/auth/login/generate")
            .then(async (res) => {
                const data = await res.json();
                console.log({ data });
                return data;
            })
            .then(startAuthentication)
            .catch((e) => {
                window.alert(e);
                throw e;
            });

        const verification: { verified: boolean } = await fetch(
            "/auth/login/verify",
            {
                method: "POST",
                body: JSON.stringify(authorisation),
            }
        )
            .then((res) => res.json())
            .catch((e) => {
                window.alert(e);
                throw e;
            });

        window.location.reload();
    };
</script>

<main>
    <div>
        <input type="text" bind:value={inviteCode} />
        <SidebarButton card on:click={register}>Register</SidebarButton>
    </div>
    <div style="margin-top: 25px; margin-left: 1em">
        <SidebarButton card on:click={login}>Login</SidebarButton>
    </div>
</main>

<style lang="scss">
    main {
        background: hsl(0, 0%, 13%);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
