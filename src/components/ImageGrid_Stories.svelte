<script lang="ts">
    import { story } from "../stores";
    import SvelteMarkdown from "svelte-markdown";
    import SidebarButton from "./SidebarButton.svelte";

    const extractHeaders = (markdown: string) => {
        const headers = [];
        const lines = markdown.split("\n");
        for (const line of lines) {
            if (line.startsWith("#")) {
                headers.push(line.replace(/^[#]+/, "").trim());
            }
        }
        return headers;
    };

    $: chapters = extractHeaders($story.content);
</script>

<main>
    <!-- Chapters -->
    <div>
        <div class="chapters">
            {#each chapters as chapter, i}
                <SidebarButton icon={null} on:click={() => {
                    document.querySelector(`#${chapter.toLowerCase().replaceAll(" ", "-").replaceAll(/[’',]/g, "")}`)?.scrollIntoView()
                }}>
                    <div style="opacity: 0.5; display: grid; grid-template-columns: auto 1fr; gap: 0.5em">
                        <span>{i + 1}</span>
                        <span style="text-overflow: ellipsis; overflow: hidden">{chapter}</span>
                    </div>
                </SidebarButton>
            {/each}
        </div>
    </div>

    <!-- Content (https://github.com/pablo-abc/svelte-markdown) -->
    <div class="content">
        <SvelteMarkdown source={$story.content} />
    </div>
</main>

<style lang="scss">
    main {
        display: grid;
        grid-template-columns: minmax(15em, 1fr) minmax(30em, 50em) minmax(15em, 1fr);
        gap: 3em;

        .chapters {
            margin-top: 50vh;
            transform: translate(0, -50%);
        }

        .content {
            overflow: scroll;
            max-height: calc(100vh - 2em);
            margin: -1em 0;
            padding: 1em;
        }
    }
</style>
