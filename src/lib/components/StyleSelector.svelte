<script>
  import { onMount, tick, onDestroy } from 'svelte';
  import { slide } from 'svelte/transition';
  
  export let selectedStyle = null;
  export let uploading = false;
  
  let styles = [];
  let loading = true;
  let error = null;
  let expanded = false;
  let selectedStyleName = '';
  let styleSelectorRef;

  async function fetchStyles() {
    loading = true;
    error = null;
    
    try {
      const response = await fetch('/api/config');
      if (!response.ok) {
        throw new Error('网络错误');
      }
      const data = await response.json();
      styles = data?.value || [];
      
      if (styles.length > 0 && !selectedStyle) {
        selectedStyle = styles[0].id;
        updateSelectedStyleName();
      }
      
      return styles;
    } catch (err) {
      console.error('获取风格列表失败:', err);
      error = '加载风格列表失败，请刷新重试';
      return [];
    } finally {
      loading = false;
    }
  }

  function updateSelectedStyleName() {
    const found = styles.find(style => style.id === selectedStyle);
    selectedStyleName = found ? found.name : '';
  }

  async function selectStyle(styleId) {
    if (!uploading && !loading) {
      selectedStyle = styleId;
      updateSelectedStyleName();
      
      await tick();
      setTimeout(() => {
        expanded = false;
      }, 200);
    }
  }

  function handleClickOutside(event) {
    if (expanded && styleSelectorRef && !styleSelectorRef.contains(event.target)) {
      expanded = false;
    }
  }
  
  function toggleExpand() {
    if (event) {
      event.stopPropagation();
    }
    if (!uploading && !loading) {
      expanded = !expanded;
    }
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleExpand(event);
    }
  }
  
  onMount(() => {
    fetchStyles();
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.addEventListener('click', handleClickOutside);
    }
  });
  
  onDestroy(() => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.removeEventListener('click', handleClickOutside);
    }
  });
</script>

<div class="style-selector" class:style-selector-border={expanded} bind:this={styleSelectorRef}>
  <div
    class="style-header"
    on:click={toggleExpand}
    on:keydown={handleKeyDown}
    role="button"
    tabindex="0"
  >
    <div class="style-title">图片风格：</div>
    {#if !expanded}
    <div class="selected-style">
      {#if selectedStyleName}
        <span>{selectedStyleName}</span>
      {:else}
        <span class="placeholder">选择风格</span>
      {/if}
      <span class="arrow {expanded ? 'up' : 'down'}">▼</span>
    </div>
    {/if}
  </div>
  
  {#if expanded}
    <div class="style-grid-container" transition:slide={{ duration: 200 }}>
      {#if loading}
        <div class="loading-message">风格加载中...</div>
      {:else if error}
        <div class="error-message">{error}</div>
      {:else if styles.length > 0}
        <div class="style-grid">
          {#each styles as style}
            <div 
              class="style-item {selectedStyle === style.id ? 'selected' : ''}"
              on:click={() => selectStyle(style.id)}
              class:disabled={uploading || loading}
            >
              <div class="style-name">{style.name}</div>
            </div>
          {/each}
        </div>
      {:else}
        <div class="empty-message">无可用风格</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .style-selector {
    margin: 20px;
    /* border: 1px solid #ddd; */
    border-radius: 12px;
    background-color: #fff;
    overflow: hidden;
    /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
  }

  .style-selector-border {
    border: 1px solid #ddd;
  }
  
  .style-header {
    padding: 15px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s;
    background-color: #f8f8f8;
  }
  
  .style-title {
    font-weight: 500;
    color: #333;
  }
  
  .selected-style {
    display: flex;
    align-items: center;
    color: #666;
  }
  
  .placeholder {
    color: #999;
    font-style: italic;
  }
  
  .arrow {
    margin-left: 10px;
    font-size: 12px;
    transition: transform 0.2s;
  }
  
  .arrow.up {
    transform: rotate(180deg);
  }
  
  .style-grid-container {
    padding: 15px;
    border-top: 1px solid #eee;
  }
  
  .style-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    max-width: 100%;
  }
  
  .style-item {
    display: flex;
    align-items: center;
    justify-content: center;
    /* height: 80px; */
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: #fff;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .style-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .style-item.selected {
    border-color: #4a90e2;
    background-color: rgba(74, 144, 226, 0.1);
  }
  
  .style-item.disabled {
    opacity: 0.6;
    pointer-events: none;
  }
  
  .style-name {
    font-size: 14px;
    text-align: center;
    color: #333;
    word-break: break-word;
  }
  
  .loading-message,
  .empty-message {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
  .error-message {
    color: #e74c3c;
    font-size: 14px;
    margin-top: 8px;
    text-align: center;
  }

  @media (max-width: 768px) {
    .style-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>