<script lang="ts">
    import {
        startRegistration,
        startAuthentication,
    } from "@simplewebauthn/browser";
    import SidebarButton from "../[cluster]/[group]/SidebarButton.svelte";
    import { mdiKey, mdiKeyPlus } from "@mdi/js";

    let oneTimeRegistrationToken = "";

    let successMessage = "";
    let errorMessage = "";

    async function beginRegistration() {
        // Reset success/error messages
        successMessage = "";
        errorMessage = "";

        // GET registration options from the endpoint that calls
        const req = await fetch("/auth/generate-registration-options", {
            method: "POST",
            body: JSON.stringify({
                oneTimeRegistrationToken,
            }),
        });
        const response = await req.json();

        if (!req.ok) {
            errorMessage = response.message;
            return;
        }

        let attResp;
        try {
            // Pass the options to the authenticator and wait for a response
            attResp = await startRegistration(response);
        } catch (error: any) {
            // Some basic error handling
            if (error.name === "InvalidStateError") {
                errorMessage =
                    "Error: Authenticator was probably already registered by user";
            } else {
                errorMessage = error;
            }

            throw error;
        }

        // POST the response to the endpoint that calls
        const verificationResp = await fetch("/auth/verify-registration", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(attResp),
        });

        // Wait for the results of verification
        const verificationJSON = await verificationResp.json();

        // Show UI appropriate for the `verified` status
        if (verificationJSON && verificationJSON.verified) {
            successMessage = "Success!";
            oneTimeRegistrationToken = "";
        } else {
            errorMessage = `Oh no, something went wrong! Response: <pre>${JSON.stringify(
                verificationJSON
            )}</pre>`;
        }
    }

    async function beginAuthentication() {
        // Reset success/error messages
        successMessage = "";
        errorMessage = "";

        // GET authentication options from the endpoint that calls
        const resp = await fetch("/auth/generate-authentication-options");

        let asseResp;
        try {
            // Pass the options to the authenticator and wait for a response
            asseResp = await startAuthentication(await resp.json());
        } catch (error: any) {
            // Some basic error handling
            errorMessage = error.message;
            throw error;
        }

        // POST the response to the endpoint that calls
        const verificationResp = await fetch("/auth/verify-authentication", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(asseResp),
        });

        // Wait for the results of verification
        const verificationJSON = await verificationResp.json();

        // Show UI appropriate for the `verified` status
        if (verificationJSON && verificationJSON.verified) {
            successMessage = "Success!";
            window.location.href="/"
        } else {
            errorMessage = `Oh no, something went wrong! Response: ${JSON.stringify(verificationJSON)}`;
        }
    }
</script>

<main>
    <section>
        <SidebarButton card icon={mdiKey} on:click={beginAuthentication}
            >Login</SidebarButton
        >
    </section>

    <section>
        <input
            placeholder="One time access token..."
            bind:value={oneTimeRegistrationToken}
        />
        <SidebarButton card icon={mdiKeyPlus} on:click={beginRegistration}
            >Register</SidebarButton
        >
    </section>

    <section>
        <p>{successMessage}</p>
        <p style:color="red">{errorMessage}</p>
    </section>
</main>

<style lang="scss">
    main {
        background: hsl(0, 0%, 13%);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        section {
            display: flex;

            input {
                margin: 3px;
                width: 200px;
            }

            padding: 1em;

            &:first-child {
                border-bottom: 1px dashed hsl(0, 0%, 27%);
            }
        }
    }
</style>
