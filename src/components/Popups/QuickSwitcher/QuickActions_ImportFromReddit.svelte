<script lang="ts">
  import { controller } from "$lib/stores"
  import Popup from "$reusables/Popup.svelte"

  let subreddit = "publicboys"
  let duration = "month"

  const download = async (metadata: any) => {
    throw "Not implemented"
  }

  $: request = fetch(
    `https://oauth.reddit.com/r/${subreddit}/top.json?t=${duration}&limit=20`,
    {
      headers: {
        Authorization:
          "Basic MVlhbmlrMzpMT2lwQlVKa19PR2xLSk9mRUw1LUNwS3M0M3llbUE"
      }
    }
  )
    .then(res => res.json())
    .then(res => {
      console.log(res.data)
      return res
    })
    .then(res =>
      res.data.children.flatMap(({ data }: any) => {
        if (data.url_overridden_by_dest)
          return [
            {
              title: data.title,
              url: data.url_overridden_by_dest
            }
          ]

        if (data.media_metadata) {
          const results: {
            title: string
            url: string
          }[] = []
          for (const media of Object.values(data.media_metadata)) {
            results.push({
              title: data.title,
              url: (media as any).s.u.replaceAll("&amp;", "&")
            })
          }
          return results
        }

        return []
      })
    )
    .then(res => {
      console.log(res)
      return res
    }) as Promise<{ title: string; url: string }[]>
</script>

<Popup
  title="Import from Reddit"
  fullscreen
  on:close={() => $controller.setPopup(null)}
>
  {#await request}
    <span>Loading...</span>
  {:then results}
    <div class="results">
      {#each results as { title, url }}
        <div
          class="result"
          on:click={download}
          on:contextmenu|preventDefault={() => {
            window.open(url)
          }}
        >
          <img src={url} alt="" />
          <span>{title}</span>
        </div>
      {/each}
    </div>
  {/await}

  <svelte:fragment slot="headerElement">
    <select bind:value={duration}>
      <option value="day">Day</option>
      <option value="week">Week</option>
      <option value="month">Month</option>
      <option value="year">Year</option>
      <option value="all">All</option>
    </select>
    <select bind:value={subreddit}>
      <option value="publicboys">r/pulicboys</option>
      <option value="gaychastity">r/gaychastity</option>
      <option value="gaybondage">r/gaybondage</option>
      <option value="gaykink">r/gaykink</option>
      <option value="collegeboys">r/collegeboys</option>
      <option value="GayChastityLocking">r/GayChastityLocking</option>
    </select>
  </svelte:fragment>
</Popup>

<style lang="scss">
  .results {
    overflow: auto;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.5em;

    .result {
      display: flex;
      flex-direction: column;
      gap: 0.5em;
      align-items: center;

      transition: transform 0.2s;

      img {
        aspect-ratio: 1/1;
        width: 100%;
        object-fit: cover;
        border-radius: 8px;
      }

      &:hover {
        transform: scale(104%);
      }
    }
  }
</style>
