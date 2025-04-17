<script>
  import { onMount } from 'svelte';

  // 组件属性，继承所有 img 标签的原生属性
  export let src;
  export let alt = '';
  export let width = undefined;
  export let height = undefined;
  export let fallbackSrc = '/images/image-fallback.svg'; // 默认的失败图标路径
  export let maxRetries = 3; // 最大重试次数
  export let retryDelay = 2000; // 重试间隔时间(毫秒)

  let currentSrc = src;
  let retryCount = 0;
  let loading = true;
  let failed = false;
  let imgElement;

  // 图片加载失败时的处理函数
  function handleError() {
    if (retryCount < maxRetries) {
      retryCount++;
      loading = true;
      failed = false;
      
      // 延迟重试
      setTimeout(() => {
        // 添加时间戳参数避免浏览器缓存
        const timestamp = new Date().getTime();
        currentSrc = `${src}${src.includes('?') ? '&' : '?'}_retry=${timestamp}`;
      }, retryDelay);
    } else {
      // 达到最大重试次数，显示失败图标
      loading = false;
      failed = true;
    }
  }

  // 图片加载成功时的处理函数
  function handleLoad() {
    loading = false;
    failed = false;
  }

  onMount(() => {
    if (imgElement) {
      // 如果图片已经有错误（可能在组件挂载前就加载失败了）
      if (imgElement.complete && imgElement.naturalHeight === 0) {
        handleError();
      }
    }
  });
</script>

{#if failed}
  <!-- 显示失败图标 -->
  <img
    src={fallbackSrc}
    {alt}
    class="fallback-image {$$props.class || ''}"
    style={$$props.style || ''}
    {width}
    {height}
  />
{:else}
  <!-- 显示实际图片 -->
  <img
    bind:this={imgElement}
    src={currentSrc}
    {alt}
    on:error={handleError}
    on:load={handleLoad}
    class="{$$props.class || ''} {loading ? 'loading' : ''}"
    style="{$$props.style || ''}"
    {width}
    {height}
    {...$$restProps}
  />
{/if}

<style>
  .loading {
    opacity: 0.7;
  }
  
  .fallback-image {
    object-fit: contain;
  }
</style>