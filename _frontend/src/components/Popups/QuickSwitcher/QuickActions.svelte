<script lang="ts">
  import { page } from "$app/stores"
  import { mediaController } from "$lib/controllers/MediaController.svelte"
  import { prompts } from "$lib/controllers/PromptController"
  import type { possibleIcons } from "$lib/possibleIcons"
  import {
    actionBar,
    controller,
    selectedMediaIds,
    uploadPopupOpen,
    viewMode
  } from "$lib/stores"

  import Icon from "../../Icon.svelte"
  import FuzzyPopupTemplate from "./FuzzyPopupTemplate.svelte"

  type functionalitiesType = {
    name: string
    icon: keyof typeof possibleIcons
    action: () => Promise<void>
    condition: boolean
  }[]
  let promise: Promise<functionalitiesType> = new Promise(resolve => {
    const functionalities: functionalitiesType = [
      // TODO: centalize this
      //   {
      //     name: "Add tag",
      //     icon: "mdiTagPlus",
      //     async action() {
      //       const newTag = await prompts.tag("Enter new tag:")
      //       if (!newTag) return

      //       for (const i in $selectedMediaIds) {
      //         await fetch(`/api/media/${$selectedMediaIds[i]}/tag`, {
      //           method: "PUT",
      //           body: JSON.stringify({
      //             name: newTag
      //           })
      //         }).catch(console.error)
      //         mediaController.media
      //           .find(m => m.id == $selectedMediaIds[i])
      //           ?.tags.push(newTag)
      //       }
      //     },
      //     condition: $selectedMediaIds.length > 0
      //   },
      //   {
      //     name: "Remove tag",
      //     icon: "mdiTagRemove",
      //     async action() {
      //       const tagsInSelectedMedia =
      //         mediaController.media.find(m => m.id == $selectedMediaIds[0])
      //           ?.tags || []

      //       const tagToDelete = await prompts.select(
      //         "Enter tag to remove: ",
      //         tagsInSelectedMedia
      //       )
      //       if (tagToDelete == null) return

      //       for (const i in $selectedMediaIds) {
      //         await fetch(`/api/media/${$selectedMediaIds[i]}/tag`, {
      //           method: "DELETE",
      //           body: JSON.stringify({
      //             name: tagToDelete
      //           })
      //         }).catch(console.error)

      //         const media = mediaController.media.find(
      //           m => m.id == $selectedMediaIds[i]
      //         )
      //         if (media) media.tags = media.tags.filter(t => t != tagToDelete)
      //       }
      //     },
      //     condition: $selectedMediaIds.length > 0
      //   },
      {
        name: "Upload",
        icon: "mdiUpload",
        async action() {
          $uploadPopupOpen = true
        },
        condition: true
      },
      {
        name: "Import",
        icon: "mdiImport",
        async action() {
          $controller.setPopup("Quick Actions Import")
        },
        condition: true
      },
      {
        name: "Cast",
        icon: "mdiCast",
        async action() {
          $controller.setPopup(null)
          $controller.setActionBar("Cast")
        },
        condition: true
      },
      {
        name: "Enable Auto Scroll",
        icon: "mdiMouse",
        async action() {
          $controller.setActionBar("AutoScroll")
        },
        condition: $actionBar != "AutoScroll"
      },
      {
        name: "Disable Auto Scroll",
        icon: "mdiMouseOff",
        async action() {
          $controller.setActionBar(null)
        },
        condition: $actionBar == "AutoScroll"
      },
      {
        name: "View Mode: Normal",
        icon: "mdiViewComfy",
        async action() {
          $viewMode = "normal"
        },
        condition: $page.data.cluster.type == "withName" && $viewMode == "table"
      },
      {
        name: "View Mode: Table",
        icon: "mdiViewList",
        async action() {
          $viewMode = "table"
        },
        condition:
          $page.data.cluster.type == "withName" && $viewMode == "normal"
      }
      //   TODO: centralize this
      //   {
      //     name: "Rename Tag",
      //     icon: "mdiTagEdit",
      //     async action() {
      //       const oldName = await prompts.select(
      //         "What tag do you want to rename?",
      //         $selectedTags as string[]
      //       )
      //       if (!oldName) return

      //       const newName = prompts.text("Enter new name:", oldName || "")
      //       if (!newName) return

      //       await fetch(`/api/cluster/${$page.data.cluster.name}/tags/rename`, {
      //         method: "POST",
      //         body: JSON.stringify({
      //           oldName,
      //           newName
      //         })
      //       })

      //       // TODO: Do I need to invalidate the Media as well?
      //       // TODO: Invalidate Tags
      //     },
      //     condition: $selectedTags.length > 0
      //   }
    ]

    resolve(functionalities)
  })
</script>

<FuzzyPopupTemplate
  {promise}
  searchAttributes={["name"]}
  conditionAttribute="condition"
  onselected={({ action }) => action()}
  placeholder="Search..."
>
  {#snippet children(result)}
    <span>{result.name}</span>
    <Icon name={result.icon} size={0.8} />
  {/snippet}
</FuzzyPopupTemplate>
