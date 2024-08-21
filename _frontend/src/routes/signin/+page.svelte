<script lang="ts">
  import Button from "$components/Button.svelte"
  import Popup from "$reusables/Popup.svelte"

  const login = async () => {
    console.log("Logging in...")
    const request = await fetch(`/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: (document.getElementById("username") as HTMLInputElement)
          .value,
        password: (document.getElementById("password") as HTMLInputElement)
          .value
      })
    })

    if (request.ok) {
      console.log("Logged in!")
      window.location.href = "/People"
    } else {
      console.error("Failed to log in!")
      window.alert(await request.text())
    }
  }
</script>

<Popup hideHeader>
  <h1>Sign in to Stash</h1>

  <div class="inputs">
    <label for="username">Username</label>
    <input type="text" id="username" />
    <label for="password">Password</label>
    <input type="password" id="password" />
  </div>

  <svelte:fragment slot="actionsRight">
    <Button card icon={null} highlighted onclick={login}>Login</Button>
  </svelte:fragment>
</Popup>

<style lang="scss">
  h1 {
    margin-top: 0;
  }

  .inputs {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.5rem;
    align-items: center;
  }
</style>
