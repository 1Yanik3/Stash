<script lang="ts">
  import { controller, mobileBottomBarVisible, settings } from "$lib/stores"
  import SvelteMarkdown from "svelte-markdown"
  import Shortcut from "../reusables/Shortcut.svelte"
  import SidebarButton from "../routes/[cluster]/SidebarButton.svelte"
  import { page } from "$app/stores"
  import type { PageData } from "../routes/[cluster]/$types"
  import Popup from "../reusables/Popup.svelte"

  let pageData = $page.data as PageData

  const extractHeaders = (markdown: string) => {
    const headers = []
    const lines = markdown.split("\n")
    for (const line of lines) {
      if (line.startsWith("#")) {
        headers.push(line.replace(/^[#]+/, "").trim())
      }
    }
    return headers
  }

  const goToChapter = (chapter: string) => {
    setTimeout(() => {
      const element = document.querySelector(
        `#${chapter
          .toLowerCase()
          .replaceAll(" ", "-")
          .replaceAll(/[’',]/g, "")}`
      )
      element?.scrollIntoView({
        block: "start"
      })
    }, 0)
  }

  let story: Awaited<typeof pageData.streamed.stories>[number] | null = null
  let chapters: string[] = []

  let serif = false

  let mainElement: HTMLElement
  let contentElement: HTMLDivElement
  let scrollElement: HTMLDivElement
  let scrollElementSpacer: HTMLDivElement

  const selectStory = async (
    _story: Awaited<typeof pageData.streamed.stories>[number]
  ) => {
    story = _story
    chapters = extractHeaders(story.content)

    // await new Promise((resolve) => setTimeout(resolve, 100))

    // // scrollElementSpacer.style.height = `${contentElement.scrollHeight}px`

    // // source: https://stackoverflow.com/questions/9236314/how-do-i-synchronize-the-scroll-position-of-two-divs
    // var isSyncingLeftScroll = false
    // var isSyncingRightScroll = false

    // contentElement.onscroll = (e) => {
    //   if (!isSyncingLeftScroll) {
    //     isSyncingRightScroll = true
    //     scrollElement.scrollTop = contentElement.scrollTop
    //   }
    //   isSyncingLeftScroll = false
    // }

    // scrollElement.onscroll = (e) => {
    //   if (!isSyncingRightScroll) {
    //     isSyncingLeftScroll = true
    //     contentElement.scrollTop = scrollElement.scrollTop
    //   }
    //   isSyncingRightScroll = false
    // }
  }

  let buttonsHidden = false
  let chapterSelectionPopupOpen = false
  $: $mobileBottomBarVisible = !story

  let processTouchAreas = (e: MouseEvent) => {
    // Top touch area (25%) => toggle buttons always on temporarely
    // Left touch area (50%) => go back a page
    // Right touch area (50%) => go forward a page

    if (!$settings.mobileLayout) return

    const left = e.clientX / window.innerWidth
    const top = e.clientY / window.innerHeight

    console.log(`left: ${left * 100}%, top: ${top * 100}%`)

    if (top < 0.25) {
      if (!buttonsHidden) return
      buttonsHidden = false
    } else {
      contentElement.scrollBy({
        top: left < 0.5 ? -window.innerHeight - 80 : window.innerHeight - 80
      })
    }
  }
</script>

{#if chapterSelectionPopupOpen}
  <Popup on:close={() => (chapterSelectionPopupOpen = false)} bottomSheet>
    {#each chapters as chapter}
      <SidebarButton
        on:click={() => {
          goToChapter(chapter)
          chapterSelectionPopupOpen = false
        }}
      >
        {chapter}
      </SidebarButton>
    {/each}
  </Popup>
{/if}

{#if story}
  <main
    class="story-view"
    class:is-mobile={$settings.mobileLayout}
    on:mousedown={processTouchAreas}
    bind:this={mainElement}
  >
    <!-- Chapters -->
    <div class:buttonsHidden>
      <div class="button">
        <SidebarButton icon="mdiArrowLeft" on:click={() => (story = null)} />
        <div
          class="spacer"
          on:mousedown|capture|stopPropagation={() => (buttonsHidden = true)}
        />
        <SidebarButton icon="mdiFormatFont" on:click={() => (serif = !serif)} />
        {#if $settings.mobileLayout}
          <SidebarButton
            icon="mdiFormatHeaderPound"
            on:click={() => (chapterSelectionPopupOpen = true)}
          />
        {/if}
      </div>
      <div class="chapters">
        {#each chapters as chapter, i}
          <SidebarButton
            icon={null}
            on:click={e => {
              e.preventDefault()
              goToChapter(chapter)
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
      <h1 class="title">{story.title}</h1>
      <SvelteMarkdown source={story.content} />
    </div>
    <div class="content" bind:this={scrollElement}>
      <div bind:this={scrollElementSpacer} />
    </div>
  </main>
{:else}
  <main class="stories-grid">
    {#await pageData.streamed.stories then stories}
      {#each stories as story}
        <div class="story" on:click={() => selectStory(story)}>
          <div class="title">
            {story.title}
          </div>
          <div class="date">
            {new Date(story.date).toISOString().slice(0, 10)}
          </div>
        </div>
      {/each}
    {/await}
  </main>

  <!-- Add new story -->
  <Shortcut key="c" action={() => $controller.setPopup("Create Story")} />
{/if}

<style lang="scss">
  @import url("https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&display=swap");

  main.stories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5em;

    .story {
      padding: 0.5em;

      background: hsl(0, 0%, 13%);
      border: 1px solid hsl(0, 0%, 24%);
      border-radius: 0.35em;

      cursor: pointer;

      &:hover {
        background: hsl(0, 0%, 22%);
        border: 1px solid hsl(0, 0%, 24%);
      }

      .title {
        height: 120px;
        padding: 0.5em;
      }

      .date {
        font-size: 14px;
        opacity: 0.8;
        display: flex;
        justify-content: center;
        margin: 0.25em;
      }
    }
  }

  main.story-view {
    display: grid;
    grid-template-columns: minmax(18em, 1fr) minmax(30em, 50em) minmax(
        18em,
        1fr
      );

    .button {
      display: flex;
      position: fixed;
      left: 60px;
      top: 0;
      width: calc(100vw - 2em);
      padding: 1em;
      padding-bottom: 0;
    }

    .chapters {
      margin-top: 50vh;
      transform: translate(0, -50%);
      margin-right: 3em;
    }

    .content {
      max-height: calc(100vh);
      margin-top: -1em;
      overflow: scroll;
      padding: 1em 0;
      padding-top: 3em;

      scrollbar-width: none;
      &:not(:last-child)::-webkit-scrollbar {
        display: none;
      }

      &.serif {
        font-family: "EB Garamond", Arial;
        font-size: 120%;
      }

      .title {
        font-size: 2rem;
        font-weight: 500;
      }
    }

    &.is-mobile {
      grid-template-columns: 1fr;
      .chapters {
        display: none;
      }

      .button {
        padding-bottom: 1em;
        background: #303030;
        left: 0;

        .spacer {
          flex-grow: 1;
        }
      }

      .buttonsHidden {
        opacity: 0;
        pointer-events: none;
        .button {
          background: transparent !important;
        }
      }

      .content {
        margin-top: 0;
      }
    }
  }
</style>
