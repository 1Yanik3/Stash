<script lang="ts">
  import { run } from "svelte/legacy"

  import { page } from "$app/stores"
  import Button from "$components/elements/Button.svelte"
  import ChapterPageController from "$lib/client/Stories/Pages/ChapterPageController.svelte"
  import {
    controller,
    mobileBottomBarVisible,
    settings
  } from "$lib/stores.svelte"
  import varsSvelte from "$lib/vars.svelte"
  import Popup from "$reusables/Popup.svelte"
  import Shortcut from "$reusables/Shortcut.svelte"

  import type { PageData } from "../../routes/[cluster]/$types"

  let pageData = $page.data as PageData

  const selectStory = async (
    _story: Awaited<typeof pageData.streamed.stories>[number]
  ) => {
    varsSvelte.selectedChapterIndex = 0
    varsSvelte.chaptersOfStory = []

    const chapters = _story.content.split("\n#")

    for (const i in chapters) {
      const chapter = chapters[i]

      varsSvelte.chaptersOfStory.push({
        name: chapter.split("\n")[0].replaceAll("#", "").trim(),
        content: chapter
      })
    }
    window.history.pushState({ storyOpen: true }, "")
  }
</script>

<svelte:window onpopstate={() => (varsSvelte.chaptersOfStory = [])} />

{#if varsSvelte.chaptersOfStory.length}
  {#key varsSvelte.selectedChapterIndex}
    <ChapterPageController
      storyContent={varsSvelte.chaptersOfStory[varsSvelte.selectedChapterIndex]
        .content}
    />
  {/key}
{:else}
  <main class="stories-grid">
    {#await pageData.streamed.stories then stories}
      {#each stories as story}
        <div class="story" onclick={() => selectStory(story)}>
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
  main.stories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5em;

    .story {
      cursor: pointer;

      padding: 0.5em;

      background: hsl(0, 0%, 13%);
      border: 1px solid var(--border-color-1-hover);
      border-radius: 0.35em;

      &:hover {
        background: var(--color-dark-level-2);
        border: 1px solid var(--border-color-1);
      }

      .title {
        height: 120px;
        padding: 0.5em;
      }

      .date {
        display: flex;
        justify-content: center;
        margin: 0.25em;
        font-size: 14px;
        opacity: 0.8;
      }
    }
  }
</style>
