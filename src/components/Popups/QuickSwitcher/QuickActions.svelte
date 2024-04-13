<script lang="ts">
  import { invalidate } from "$app/navigation"
  import { page } from "$app/stores"
  import type { possibleIcons } from "$lib/possibleIcons"
  import {
    actionBar,
    controller,
    media_store,
    selectedMediaIds,
    selectedTags,
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
      {
        name: "Add tag",
        icon: "mdiTagPlus",
        async action() {
          const newTag = await $controller.prompt().tag("Enter new tag:")
          if (!newTag) return

          for (const i in $selectedMediaIds) {
            await fetch(`/api/media/${$selectedMediaIds[i]}/tag`, {
              method: "PUT",
              body: JSON.stringify({
                name: newTag
              })
            }).catch(console.error)
            $media_store
              .find(m => m.id == $selectedMediaIds[i])
              ?.tags.push(newTag)
          }
        },
        condition: $selectedMediaIds.length > 0
      },
      {
        name: "Remove tag",
        icon: "mdiTagRemove",
        async action() {
          const tagsInSelectedMedia =
            $media_store.find(m => m.id == $selectedMediaIds[0])?.tags || []

          const tagToDelete = await $controller
            .prompt()
            .select("Enter tag to remove: ", tagsInSelectedMedia)
          if (tagToDelete == null) return

          for (const i in $selectedMediaIds) {
            await fetch(`/api/media/${$selectedMediaIds[i]}/tag`, {
              method: "DELETE",
              body: JSON.stringify({
                name: tagToDelete
              })
            }).catch(console.error)

            const media = $media_store.find(m => m.id == $selectedMediaIds[i])
            if (media) media.tags = media.tags.filter(t => t != tagToDelete)
          }
        },
        condition: $selectedMediaIds.length > 0
      },
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
        name: "Import from URL",
        icon: "mdiCloudDownload",
        async action() {
          $controller.setPopup("Quick Actions Import from URL")
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
      },
      {
        name: "Rename Tag",
        icon: "mdiTagEdit",
        async action() {
          const oldName = await $controller
            .prompt()
            .select(
              "What tag do you want to rename?",
              $selectedTags as string[]
            )
          if (!oldName) return

          const newName = await $controller
            .prompt()
            .text("Enter new name:", oldName || "")
          if (!newName) return

          await fetch(`/api/cluster/${$page.data.cluster.name}/tags/rename`, {
            method: "POST",
            body: JSON.stringify({
              oldName,
              newName
            })
          })

          invalidate("media-and-tags")
        },
        condition: $selectedTags.length > 0
      }
    ]

    resolve(functionalities)
  })
</script>

<FuzzyPopupTemplate
  {promise}
  searchAttributes={["name"]}
  conditionAttribute="condition"
  let:result
  on:selected={({ detail }) => detail.action()}
  placeholder="Search..."
>
  <span>{result.name}</span>
  <Icon name={result.icon} size={0.8} />
</FuzzyPopupTemplate>
