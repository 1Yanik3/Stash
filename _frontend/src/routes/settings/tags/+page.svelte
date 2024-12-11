<script lang="ts">
  import Icon from "$components/Icon.svelte"
  import SettingsPageContent from "$components/Layouts/SettingsPageContent.svelte"
  import Table from "$components/Table.svelte"

  let { data } = $props()
</script>

<SettingsPageContent title="Tags">
  <Table
    headers={["Id", "Icons", "Tag", "Media count", "Parent", "Clusters"]}
    data={data.allTags}
    let:entry
  >
    <td>
      {entry.id}
    </td>
    <td align="center">
      {#if entry.icon}
        <Icon nameAlt={entry.icon} />
      {/if}
    </td>
    <td>
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
    <td>
        {entry.clusters.map(c => c.name).join(", ")}
    </td>
  </Table>
</SettingsPageContent>
