<script lang="ts">
    import { isStoryFullScreen, story } from "$lib/stores";
    import { onMount } from "svelte";
    import SvelteMarkdown from "svelte-markdown";
    import Shortcut from "../reusables/Shortcut.svelte";
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

    let serif = false
    $: console.log({serif})

    $: chapters = extractHeaders($story.content);


    let contentElement: HTMLDivElement
    let scrollElement: HTMLDivElement
    let scrollElementSpacer: HTMLDivElement

    onMount(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))

        scrollElementSpacer.style.height = `${contentElement.scrollHeight}px`

        // source: https://stackoverflow.com/questions/9236314/how-do-i-synchronize-the-scroll-position-of-two-divs
        var isSyncingLeftScroll = false;
        var isSyncingRightScroll = false;

        contentElement.onscroll = e => {
            if (!isSyncingLeftScroll) {
                isSyncingRightScroll = true;
                scrollElement.scrollTop = contentElement.scrollTop
            }
            isSyncingLeftScroll = false
        }

        scrollElement.onscroll = e => {
            if (!isSyncingRightScroll) {
                isSyncingLeftScroll = true;
                contentElement.scrollTop = scrollElement.scrollTop
            }
            isSyncingRightScroll = false
        }

    })

</script>

<!-- Toggle Serif -->
<Shortcut
    opt
    key="ß"
    action={() => {
        serif = !serif
    }}
/>

<!-- Toggle Fullscreen -->
<Shortcut key="f" action={() => {
    isStoryFullScreen.set(!$isStoryFullScreen)
}} />


<main>
    <!-- Chapters -->
    <div>
        <div class="chapters">
            {#each chapters as chapter, i}
                <SidebarButton
                    icon={null}
                    on:click={(e) => {
                        e.preventDefault();
                        setTimeout(() => {
                            const element = document.querySelector(
                                `#${chapter
                                    .toLowerCase()
                                    .replaceAll(" ", "-")
                                    .replaceAll(/[’',]/g, "")}`
                            );
                            element?.scrollIntoView({
                                block: "start",
                                behavior: "smooth",
                            });
                        }, 0);
                    }}
                >
                    <div
                        style="opacity: 0.5; display: grid; grid-template-columns: auto 1fr; gap: 0.5em"
                    >
                        <span>{i + 1}</span>
                        <span style="text-overflow: ellipsis; overflow: hidden"
                            >{chapter}</span
                        >
                    </div>
                </SidebarButton>
            {/each}
        </div>
    </div>

    <!-- Content (https://github.com/pablo-abc/svelte-markdown) -->
    <div class="content" class:serif bind:this={contentElement}>
        <h1 class="title">{$story.title}</h1>
        <SvelteMarkdown source={$story.content} />
    </div>

    <div class="content" bind:this={scrollElement}>
        <div bind:this={scrollElementSpacer}></div>
    </div>
</main>

<style lang="scss">
    @import url("https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap");

    main {
        display: grid;
        grid-template-columns: minmax(18em, 1fr) minmax(30em, 50em) minmax(18em, 1fr);

        .chapters {
            margin-top: 50vh;
            transform: translate(0, -50%);
            margin-right: 3em;
        }

        .content {
            overflow: scroll;
            max-height: calc(100vh - 2em);
            margin: -1em 0;
            padding: 1em;

            scrollbar-width: none;

            &.serif {
                font-family: "EB Garamond", Arial;
                font-size: 120%;
            }

            .title {
                font-size: 2rem;
                font-weight: 500;
            }
        }
    }
</style>
