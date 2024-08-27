<script lang="ts">
  import Button from "$components/Button.svelte"
  import Icon from "$components/Icon.svelte"
  import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
  import Table from "$components/Table.svelte"

  let { data } = $props()
</script>

<SettingsPageContent title="Tags">
  <Table
    headers={["Id", "Tag", "Media count", "Parent"]}
    data={data.allTags}
    let:entry
  >
    <td>
      {entry.id}
    </td>
    <td>
      {#if entry.icon}
        <Icon nameAlt={entry.icon} />
      {/if}
      {entry.tag}
    </td>
    <td>
      {entry._count.media}
    </td>
    <td>
      {#if entry.parent}
        {entry.parent.id} ({entry.parent.tag})
      {/if}
    </td>
  </Table>
</SettingsPageContent>
