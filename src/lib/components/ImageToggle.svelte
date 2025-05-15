<script>
  import { createEventDispatcher } from 'svelte';
  import { ls } from '$lib/localStorage'
  
  const dispatch = createEventDispatcher();
  
  const history = ls('history_v0', []);
  // 默认显示历史图片
  export let showHistory = true;
  
  function toggleView(value) {
    showHistory = value;
    dispatch('toggle', { showHistory });
  }

  $: {
    showHistory = $history.length > 0;
  }
</script>

<div class="toggle-container">
  <div class="toggle-buttons">
    <button 
      class:active={showHistory} 
      on:click={() => toggleView(true)}
      disabled={$history.length === 0}
      title={$history.length === 0 ? "暂无历史记录" : "查看历史记录"}
    >
      历史
    </button>
    <button 
      class:active={!showHistory} 
      on:click={() => toggleView(false)}
    >
      示例
    </button>
    <div class="slider" style={`transform: translateX(${showHistory ? '0' : '100%'})`}></div>
  </div>
</div>

<style>
  .toggle-container {
    width: 100%;
    display: flex;
    justify-content: center;
    margin: 10px 0 0 0;
  }

  .toggle-buttons {
    display: flex;
    background-color: #f3f3f3;
    border-radius: 20px;
    padding: 4px;
    position: relative;
    overflow: hidden;
  }

  .toggle-buttons button {
    background: none;
    border: none;
    padding: 8px 16px;
    border-radius: 16px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    width: auto;
    height: auto;
    position: relative;
    z-index: 2;
  }

  .toggle-buttons button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .toggle-buttons .slider {
    position: absolute;
    top: 4px;
    left: 4px;
    width: calc(50% - 4px);
    height: calc(100% - 8px);
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
    z-index: 1;
  }

  .toggle-buttons button.active {
    color: #333;
  }

  .toggle-buttons button:hover:not(.active):not(:disabled) {
    color: #444;
  }
</style>