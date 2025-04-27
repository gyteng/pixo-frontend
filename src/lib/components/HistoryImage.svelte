<script>
  import { onMount } from 'svelte';

  export let src;
  export let alt = '';
  export let width = undefined;
  export let height = undefined;
  export let maxRetries = 5;
  export let retryDelay = 5000;

  // ai_generated / user_uploaded
  let currentStatus = 'ai_generated';
  let currentSrc = src;
  let retryCount = 0;
  let loading = true;
  let failed = false;
  let imgElement;

  function handleError(event) {
    if (retryCount < maxRetries) {
      retryCount++;
      loading = true;
      failed = false;

      if (currentStatus === 'ai_generated') {
        event.target.src = event.target.src.replace('ai_generated', 'user_uploaded');
        currentStatus = 'user_uploaded';
        return;
      }
      
      setTimeout(() => {
        const timestamp = new Date().getTime();
        currentSrc = `${src}${src.includes('?') ? '&' : '?'}_retry=${timestamp}`;
      }, retryDelay);
    } else {
      loading = false;
      failed = true;
    }
  }

  function handleLoad() {
    loading = false;
    failed = false;
  }

  onMount(() => {
    if (imgElement) {
      if (imgElement.complete && imgElement.naturalHeight === 0) {
        handleError();
      }
    }
  });
</script>

<div class="history-image" style="{$$props.style || ''}">
  {#if loading || failed}
  <div class="loading-placeholder" style="{width ? `width:${width}px;` : ''}{height ? `height:${height}px;` : ''}">
  </div>
  {/if}
  <img
    bind:this={imgElement}
    src={currentSrc}
    {alt}
    on:error={handleError}
    on:load={handleLoad}
    class:hidden={loading || failed}
    class="{$$props.class || ''} {loading ? 'loading' : ''}"
    style="{$$props.style || ''}"
    {width}
    {height}
    {...$$restProps}
  />
</div>


<style>
  .hidden {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  }

  .history-image {
    position: relative;
    width: 100%;
    height: 100%;
  }

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    opacity: 1;
    transition: opacity 0.2s ease-in;
  }

  .loading-placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F9F9F9;
    color: #aaa;
  }

  .loading {
    opacity: 0.7;
  }
  
  .fallback-image {
    object-fit: contain;
  }
</style>