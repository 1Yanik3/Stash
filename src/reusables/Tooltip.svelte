<script lang="ts">
	export let title: string
	export let x: number
	export let y: number
</script>
<div style="
    top: {y + 2.5}px;
    left: {x + 2.5}px;"
><span>{title}</span></div>

<style lang="scss">
	div {
		background: hsl(0, 0%, 13%);
		border: 1px solid hsl(0, 0%, 17%);
		border-radius: 0.5em;
		padding: 0.4em 0.5em;
		position: absolute;

		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
