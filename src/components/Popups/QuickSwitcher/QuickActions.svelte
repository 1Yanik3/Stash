<script lang="ts">
  import { invalidate } from "$app/navigation"
  import { page } from "$app/stores"
  import {
    controller,
    selectedMediaIds,
    selectedTags,
    uploadPopupOpen,
    viewMode
  } from "$lib/stores"
  import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte"

  type functionalitiesType = {
    name: string
    function: () => Promise<void>
  }[]
  let promise: Promise<functionalitiesType> = new Promise(resolve => {
    const functionalities: functionalitiesType = []

    if ($selectedMediaIds.length)
      functionalities.push({
        name: "Add tag",
        async function() {
          const newTag = await $controller.prompt("Enter new tag: ")

          for (const i in $selectedMediaIds) {
            await fetch(`/api/media/${$selectedMediaIds[i]}/tag`, {
              method: "PUT",
              body: JSON.stringify({
                name: newTag
              })
            }).catch(console.error)
          }

          invalidate("media-and-tags")
        }
      })

    if ($selectedMediaIds.length)
      functionalities.push({
        name: "Remove tag",
        async function() {
          // TODO: Add autocomplete
          const tagToDelete = await $controller.prompt("Enter tag to remove: ")

          for (const i in $selectedMediaIds) {
            await fetch(
              `/api/media/${$selectedMediaIds[i]}/tag`,
              {
                method: "DELETE",
                body: JSON.stringify({
                    name: tagToDelete
                })
              }
            ).catch(console.error)
          }

          invalidate("media-and-tags")
        }
      })

    functionalities.push({
      name: "Upload",
      async function() {
        $uploadPopupOpen = true
      }
    })

    functionalities.push({
      name: "Import",
      async function() {
        $controller.setPopup("Quick Actions Import")
      }
    })

    functionalities.push({
      name: "Cast",
      async function() {
        $controller.setPopup(null)
        $controller.setActionBar("Cast")
      }
    })

    if ($page.data.cluster.type == "withName") {
      if ($viewMode == "table")
        functionalities.push({
          name: "View Mode: Normal",
          async function() {
            $viewMode = "normal"
          }
        })

      if ($viewMode == "normal")
        functionalities.push({
          name: "View Mode: Table",
          async function() {
            $viewMode = "table"
          }
        })
    }

    functionalities.push({
      name: "Rename Tag",
      async function() {
        const oldName = await $controller.prompt(
          "What tag do you want to rename?",
          $selectedTags.length == 1 ? ($selectedTags[0] as string) : undefined
        )
        const newName = await $controller.prompt(
          "Enter new name:",
          oldName || ""
        )

        await fetch(`/api/cluster/${$page.data.cluster.name}/tags/rename`, {
          method: "POST",
          body: JSON.stringify({
            oldName,
            newName
          })
        })

        invalidate("media-and-tags")
      }
    })

    resolve(functionalities)
  })
</script>

<FuzzyPopupTemplate
  {promise}
  searchAttributes={["name"]}
  let:result
  on:selected={({ detail }) => detail.function()}
>
  <span>{result.name}</span>
</FuzzyPopupTemplate>
