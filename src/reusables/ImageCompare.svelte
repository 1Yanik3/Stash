<svelte:window 
	on:touchmove={move} 
	on:touchend={end} 
	on:mousemove={move} 
	on:mouseup={end} 
	on:resize={resize}
/>

<div class="container" {style} on:touchstart={start} on:mousedown={start}>
	<img 
		bind:this={img} 
		src={after} 
		alt="after" 
		on:mousedown|preventDefault 
		on:load={resize} 
		{style}
	>
	<img 
		src={before} 
		alt="before" 
		on:mousedown|preventDefault 
		style="{style}clip:rect(0, {x}px, {h}px, 0);"
	>
	<div class="handle" style="left: calc({offset * 100}% - 20px)">
		<div class="arrow-left"></div>
		<div class="arrow-right"></div>
	</div>
</div>

<script>
    // @ts-nocheck

	let hideOnSlide = true,
		imgOffset = null,
		sliding = false,
		contain = false,
		offset = 0.5,
		before = '',
		after = '',
		img;

	function resize(e) {
		imgOffset = (e.type === 'load' ? e.target : img).getBoundingClientRect();
	}

	function move(e) {
		if (sliding && imgOffset) {
			let x = (e.touches ? e.touches[0].pageX : e.pageX) - imgOffset.left;
			x = x < 0 ? 0 : ((x > w) ? w : x);
			offset = x / w;
		}
	}

	function start(e) {
		sliding = true;
		move(e);
	}

	function end() {
		sliding = false;
	}

	$: w = imgOffset && imgOffset.width;
	$: h = imgOffset && imgOffset.height;
	$: x = w * offset;
	$: opacity = hideOnSlide && sliding ? 0 : 1;
	$: style = contain ? `width:100%;height:100%;` : `width:${w}px;height:${h}px;`;

	export { before, after, offset, contain, hideOnSlide };
</script>

<style>
	.container {
		overflow: hidden;
		position: relative;
		box-sizing: content-box;
	}
	.container img {
		top: 0;
		left: 0;
		z-index: 20;
		display: block;
		max-width: 100%;
		user-select: none;
		/* object-fit: cover; */
		object-fit: contain;
		position: absolute;
		width: 100%;
	}
	.handle {
		z-index: 30;
		width: 40px; 
		height: 40px;
		cursor: move;
		background: none;
		margin-top: -4px;
		margin-left: -4px;
		user-select: none;
		position: absolute;
		border-radius: 50px;
		top: calc(50% - 20px);
		border: 4px solid white;
	}
	.handle:before, .handle:after {
		content: "";
		height: 9999px;
		position: absolute;
		left: calc(50% - 2px);
		border: 2px solid white;
	}
	.handle:before { top: 40px; }
	.handle:after { bottom: 40px; }
	.arrow-right, .arrow-left {
		width: 0;
		height: 0;
		user-select: none;
		position: relative;
		border-top: 10px solid transparent;
		border-bottom: 10px solid transparent;
	}
	.arrow-right {
		left: 23px;
		bottom: 10px;
		border-left: 10px solid white;
	}
	.arrow-left {
		left: 7px;
		top: 10px;
		border-right: 10px solid white;
	}
</style>