<script lang="ts">
    export let path: any;
    export let size: number | string = 1;
    export let color: any = null;
    export let flip: any = null;
    export let rotate = 0;
    export let spin = false;
    export let title = '';
   
    // size
    if(Number(size)) size = Number(size);
    
    const getStyles = () => {
        const transform = [];
        const styles = [];
  
        if (size !== null) {
            const width = (typeof size === "string") ? size : `${size * 1.5}rem`;
            styles.push(['width',width]);
            styles.push(['height',width]);
        }
  
        // @ts-ignore
        styles.push( ['fill', (color !== null) ? color: 'currentColor'] );
  
        // @ts-ignore
        if (flip === true || flip === 'h') {
          transform.push("scaleX(-1)");
        }
  
        // @ts-ignore
        if (flip === true || flip === 'v') {
          transform.push("scaleY(-1)");
        }
  
        if (rotate != 0) {
          transform.push(`rotate(${rotate}deg)`);
    
        }
  
        if(transform.length > 0) {
          styles.push( ['transform', transform.join(' ')] );
          styles.push( ['transform-origin', 'center'] );
        }
  
  
        return styles.reduce((cur,item)=>{
          return `${cur} ${item[0]}:${item[1]};`;
        },'');
    }
  
   // @ts-ignore
     $: style = getStyles(size,color,flip,rotate);
  </script>
  
  
  <svg viewBox="0 0 24 24" {style}>
  {#if title}<title>{title}</title>{/if}
  {#if spin !== false}
      <style>@keyframes spin { to { transform: rotate(360deg) } }</style>
      <g style={`transform-origin: center`}>
        <path d={path}></path>
      </g>
     {:else}
    <path d={path}></path>
  {/if} 
  </svg>
  
  <style>
  svg{
      vertical-align: middle;
  }
  </style>
  