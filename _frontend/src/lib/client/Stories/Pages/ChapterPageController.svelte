<script lang="ts">
    import { onMount } from "svelte"
    import SvelteMarkdown from "svelte-markdown"

    const { storyContent }: { storyContent: string } = $props()

    let globalRemainingStoryContent = $state($state.snapshot(storyContent))

    let pageElements: HTMLElement[] = $state([])
    let pageContents: string[] = $state([])

    const fillPage = async (pageElement: HTMLElement, pageIndex: number) => {
        console.log("Filling page", pageIndex)
        let remainingStoryContent = globalRemainingStoryContent

        pageContents[pageIndex] = ""

        while (pageElement.scrollHeight <= pageElement.clientHeight) {
            if (!remainingStoryContent) {
                console.log("No more content to display")
                break
            }
            const nextNewLineIndex = remainingStoryContent.indexOf("\n")
            const nextLine =
                nextNewLineIndex == -1
                    ? remainingStoryContent
                    : remainingStoryContent.slice(0, nextNewLineIndex)
            remainingStoryContent = remainingStoryContent.slice(
                nextNewLineIndex + 1
            )
            const previousContent = pageContents[pageIndex]
            pageContents[pageIndex] += nextLine + "\n"
            await new Promise(resolve => setTimeout(resolve, 0))
            if (pageElement.scrollHeight > pageElement.clientHeight) {
                pageContents[pageIndex] = previousContent
                remainingStoryContent = nextLine + "\n" + remainingStoryContent
                break
            }
            await new Promise(resolve => setTimeout(resolve, 0))
        }

        globalRemainingStoryContent = remainingStoryContent
        console.log("Finished filling page", pageIndex)
    }

    const fillPages = async () => {
        pageElements = []
        pageContents = []
        globalRemainingStoryContent = $state.snapshot(storyContent)
        let pageIndex = 0
        let previousRemaining = globalRemainingStoryContent
        await new Promise(resolve => setTimeout(resolve, 0)) // Allow DOM to update
        while (globalRemainingStoryContent) {
            pageContents.push("")
            await new Promise(resolve => setTimeout(resolve, 0)) // Allow DOM to update
            await fillPage(pageElements[pageIndex], pageIndex)
            if (globalRemainingStoryContent === previousRemaining) {
                // No content was consumed, prevent infinite loop
                break
            }
            previousRemaining = globalRemainingStoryContent
            pageIndex++
        }
    }

    onMount(fillPages)
</script>

<svelte:window onresize={fillPages} />

<div>
    <main>
        {#each pageContents as content, index}
            <section
                bind:this={pageElements[index]}
                style="text-align: justify"
            >
                <SvelteMarkdown source={content} options={{}} />
            </section>
        {/each}
    </main>
</div>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css2?family=Caudex:ital,wght@0,400;0,700;1,400;1,700&display=swap");

    div {
        width: calc(100vw - 250px - 2rem);
    }

    main {
        overflow: scroll;
        display: flex;
        gap: 1rem;

        width: max-content;
        height: calc(100vh - 2rem);

        section {
            overflow: hidden;

            width: calc(50vw - 125px - 3.5rem);
            max-width: 700px;
            padding: 1rem;
            padding-top: 0;

            font-family: "Caudex", serif;
            font-size: 17px;

            background: var(--color-dark-level-1);
        }
    }

    :global(code) {
        white-space: normal;
    }
</style>
