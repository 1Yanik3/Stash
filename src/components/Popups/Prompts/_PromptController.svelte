<script lang="ts">
  import SelectPromptPopup from "./SelectPromptPopup.svelte"
  import TagSearchPromptPopup from "./TagSearchPromptPopup.svelte"
  import TextPromptPopup from "./TextPromptPopup.svelte"

  export const prompt = {
    text: (question: string, value = ""): Promise<string | null> =>
      new Promise(resolve => {
        const element = new TextPromptPopup({
          target: document.body,
          props: {
            question,
            value
          }
        })

        element.$on("result", ({ detail }) => {
          if (detail != null) resolve(detail)
          else resolve(null)
          element.$destroy()
        })
      }),

    select: (
      question: string,
      options: string[],
      value = ""
    ): Promise<string | null> =>
      new Promise(resolve => {
        const element = new SelectPromptPopup({
          target: document.body,
          props: {
            question,
            options,
            value: value || options[0]
          }
        })

        element.$on("result", ({ detail }) => {
          if (detail != null) resolve(detail)
          else resolve(null)
          element.$destroy()
        })
      }),

    tag: (question: string, value = ""): Promise<string | null> =>
      new Promise(resolve => {
        const element = new TagSearchPromptPopup({
          target: document.body,
          props: {
            question,
            value
          }
        })

        element.$on("result", ({ detail }) => {
          if (detail != null) resolve(detail)
          else resolve(null)
          element.$destroy()
        })
      })
  }
</script>
