<script lang="ts">
    import SidebarButton from "../../components/SidebarButton.svelte";

    let token = "";

    const login = async () => {

        const response = await fetch("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                token
            })
        })

        if (response.ok)
            window.location.reload();
        else {
            token = ""
            window.alert("Login failed")
        }
    };
</script>

<main>
    <div>
        <input type="password" bind:value={token} />
        <div style="display: flex; justify-content: right">
            <SidebarButton card on:click={login}>Login</SidebarButton>
        </div>
    </div>
</main>

<style lang="scss">
    main {
        background: hsl(0, 0%, 13%);
        min-height: 100vh;
        display: grid;
        justify-content: center;
        align-items: center;
    }
</style>
