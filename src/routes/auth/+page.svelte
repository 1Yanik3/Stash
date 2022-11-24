<script lang="ts">
    import SidebarButton from "../../components/SidebarButton.svelte"
    import { startRegistration, startAuthentication } from "@simplewebauthn/browser"
    
    const register = async () => {

        const registration = await fetch("/auth/register/generate")
            .then(res => res.json())
            .then(startRegistration)
            .catch(e => {
                window.alert(e)
                throw e
            })

        const verification: { verified: boolean } = await fetch("/auth/register/verify", {
                method: "POST",
                body: JSON.stringify(registration)
            })
            .then(res => res.json())
            .catch(e => {
                window.alert(e)
                throw e
            })

        window.location.reload()

    }

    const login = async () => {

        const authorisation = await fetch("/auth/login/generate")
            .then(async res => {
                const data = await res.json()
                console.log({data})
                return data
            })
            .then(startAuthentication)
            .catch(e => {
                window.alert(e)
                throw e
            })

        const verification: { verified: boolean } = await fetch("/auth/login/verify", {
                method: "POST",
                body: JSON.stringify(authorisation)
            })
            .then(res => res.json())
            .catch(e => {
                window.alert(e)
                throw e
            })

        window.location.reload()

    }

</script>

<main>
    <SidebarButton card on:click={register}>Register</SidebarButton>
    <SidebarButton card on:click={login}>Login</SidebarButton>
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