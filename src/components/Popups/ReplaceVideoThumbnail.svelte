<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { controller, serverURL, visibleMedium } from "$lib/stores";
    import Popup from "../../reusables/Popup.svelte";
    import SidebarButton from "../../routes/[cluster]/[group]/SidebarButton.svelte";

    let videoElement: HTMLVideoElement;

    const dataURItoBlob = (dataURI: string) => {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        const byteString = atob(dataURI.split(",")[1]);

        // separate out the mime component
        const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

        // write the bytes of the string to an ArrayBuffer
        const ab = new ArrayBuffer(byteString.length);

        // create a view into the buffer
        const ia = new Uint8Array(ab);

        // set the bytes of the buffer to the correct values
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        // write the ArrayBuffer to a blob, and you're done
        const blob = new Blob([ab], { type: mimeString });
        return blob;
    };

    const replace = async () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

        // Set the canvas size to match the video dimensions
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;

        // Draw the current frame of the video onto the canvas
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Get the image data from the canvas
        const imageData = canvas.toDataURL("image/png");

        // Convert the image data to a Blob object
        const blob = dataURItoBlob(imageData);

        const data = new FormData();
        data.append(
            "file",
            blob,
            "frame.png"
        )

        fetch(`/api/media/${$visibleMedium?.id}/thumbnail`, {
            method: "POST",
            body: data,
        }).then(async () => {
            invalidateAll();
            $controller.setPopup(null);
        });
    };
</script>

<Popup title="Replace Video Thumbnail">
    <main>
        <!-- svelte-ignore a11y-media-has-caption -->
        <video
            bind:this={videoElement}
            src="{$serverURL}/file/{$visibleMedium?.id}"
            controls
            crossorigin="use-credentials"
        />
        <div class="actions">
            <SidebarButton card on:click={replace}>Replace Screenshot</SidebarButton>
        </div>
    </main>
</Popup>

<style lang="scss">
    main {
        video {
            height: 400px;
        }
    }
</style>
