<script>
  import { onMount } from 'svelte';
  import QRCode from 'qrcode';

  export let src;
  export let alt = '';
  export let width = undefined;
  export let height = undefined;
  export let maxRetries = 5;
  export let retryDelay = 5000;
  export let fit = 'cover';
  export let qrText = '';

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

  let qrCanvas;
  async function generateQRCode(text) {
    if (!text) return null;
    
    try {
      await QRCode.toCanvas(qrCanvas, text, {
        width: 100,
        margin: 1,
        color: {
          dark: '#3a3a3a',
          light: '#e3e3e3'
        }
      });
      return qrCanvas;
    } catch (err) {
      console.error('二维码生成失败:', err);
      return null;
    }
  }

  let canvas;
  let composedImageUrl = '';
  async function composeImage() {
    const img = new Image();
    try {
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = src;
      });
      const ctx = canvas.getContext('2d');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
      await generateQRCode(qrText);
      const qrSize = 100;
      const margin = 15;
      ctx.globalAlpha = 0.35;
      ctx.drawImage(
        qrCanvas, 
        canvas.width - qrSize - margin,
        canvas.height - qrSize - margin,
        qrSize,
        qrSize
      );
      ctx.globalAlpha = 1;
      composedImageUrl = canvas.toDataURL('image/png');
    } catch (error) {
      console.error('图片合成失败:', error);
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    if (imgElement) {
      if (imgElement.complete && imgElement.naturalHeight === 0) {
        handleError();
      }
    }
    if (qrText) {
      composeImage();
    }
  });
</script>

<div class="image" style="{$$props.style || ''}">
  {#if loading || failed}
  <div class="loading-placeholder" style="{width ? `width:${width}px;` : ''}{height ? `height:${height}px;` : ''}">
  </div>
  {/if}
  <img
    bind:this={imgElement}
    src={qrText ? composedImageUrl : currentSrc}
    {alt}
    on:error={handleError}
    on:load={handleLoad}
    class:hidden={loading || failed}
    class="{$$props.class || ''} {loading ? 'loading' : ''}"
    style="{$$props.style || ''} object-fit: {fit};"
    {width}
    {height}
    {...$$restProps}
  />
  {#if qrText}
    <canvas bind:this={canvas} class="hidden-canvas"></canvas>
    <canvas bind:this={qrCanvas} class="hidden-canvas"></canvas>
  {/if}
</div>


<style>
  .hidden {
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s ease-out;
  }

  .hidden-canvas {
    display: none;
  }

  .image {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  img {
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