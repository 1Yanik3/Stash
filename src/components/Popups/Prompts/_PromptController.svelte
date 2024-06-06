<script lang="ts">
  import SelectPromptPopup from "./SelectPromptPopup.svelte"
  import TagSearchPromptPopup from "./TagSearchPromptPopup.svelte"
  import TextPromptPopup from "./TextPromptPopup.svelte"
  import NotifyPromptPopup from "./NotifyPromptPopup.svelte"
  import CodePromptPopup from "./CodePromptPopup.svelte"
  import Dropdown from "$reusables/Dropdown.svelte"
  import SelectPromptDropdown from "./SelectPromptDropdown.svelte"

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

    dropdown: (
      target: Element,
      options: string[],
      value = ""
    ): Promise<string | null> =>
      new Promise(resolve => {
        console.log(target)
        const element = new SelectPromptDropdown({
          target,
          props: {
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
      }),

    notify: (text: string): Promise<boolean> =>
      new Promise(resolve => {
        const element = new NotifyPromptPopup({
          target: document.body,
          props: {
            text
          }
        })

        element.$on("result", ({ detail }) => {
          resolve(detail)
          element.$destroy()
        })
      }),

    code: (text: string): Promise<boolean> =>
      new Promise(resolve => {
        const element = new CodePromptPopup({
          target: document.body,
          props: {
            text
          }
        })

        element.$on("result", ({ detail }) => {
          resolve(detail)
          element.$destroy()
        })
      })
  }
</script>
