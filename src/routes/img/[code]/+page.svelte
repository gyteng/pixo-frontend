<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';
  import { onMount, onDestroy } from 'svelte';
  import ImageUploader from '$lib/components/ImageUploader.svelte';
  import StyleSelector from '$lib/components/StyleSelector.svelte';
  import Loading from '$lib/components/Loading.svelte';
  
  let previewUrl = null;
  let uploading = false;
  let uploadSuccess = false;

  /**
   * loading
   * created
   * uploaded
   * finished
   * error
   */
  let codeStatus = 'loading';

  let statusMessage = '';
  let pollingInterval;
  const code = $page.params.code;

  let selectedStyle = null;
  
  async function checkCodeStatus() {
    try {
      const params = new URLSearchParams();
      params.append('code', code);
      const response = await fetch(`/api/code/status?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      const result = await response.json();
      
      if (!response.ok) {
        statusMessage = result.error || '获取状态失败';
        return;
      }
      
      codeStatus = result.codeStatus;
      
      if (codeStatus === 'created') {
        statusMessage = '可以上传图片';
      } else {
        statusMessage = '此兑换码当前无法上传图片';
      }

      if (codeStatus === 'error') {
        selectedFile = null;
        previewUrl = null;
      }
      if (codeStatus === 'finished') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
      }
    } catch (error) {
      console.error('获取兑换码状态出错:', error);
      statusMessage = '检查状态时出错，请稍后再试';
    }
  }
  
  function startPolling() {
    checkCodeStatus();
    pollingInterval = setInterval(checkCodeStatus, 20 * 1000);
  }

  function backToHomepage() {
    goto('/');
  }

  function handlePreview() {

  }

  function handleUploadSuccess() {
    uploadSuccess = true;
    uploading = false;
  }

  function hideStyleSelector() {
    if (previewUrl) {
      return true;
    }
    if (codeStatus === 'loading') {
      return true;
    }
    if (codeStatus === 'created' || codeStatus === 'error') {
      return false;
    }
    return true
  }
  
  onMount(() => {
    startPolling();
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  });

  onDestroy(() => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  });
</script>

<div class="container">
  <div class="code-info">
    <div>
      <button class="back-button" on:click={backToHomepage}>
        <Icon color="#333" icon="tabler:chevron-left" width="40" height="40" />
      </button>
    </div>
    <div class="code">{code}</div>
  </div>
  <div class="image-container">
    <div class:hidden={hideStyleSelector()} class="style-selector-container">
      <StyleSelector bind:selectedStyle={selectedStyle} />
    </div>
    {#if codeStatus === 'loading'}
      <div></div>
    {:else if codeStatus === 'created' || codeStatus === 'error' || (codeStatus === 'uploaded' && previewUrl)}
      <ImageUploader 
        {uploading}
        bind:previewUrl={previewUrl}
        {code}
        bind:selectedStyle={selectedStyle}
        {codeStatus}
        on:uploadstart={() => uploading = true}
        on:uploadend={() => uploading = false}
        on:uploadsuccess={handleUploadSuccess}
        on:preview={handlePreview}
      />
    {:else if codeStatus === 'finished'}
      <img src="/api/image?usage=ai_generated&code={code}" alt="ai_generated" class="result-image"/>
    {:else}
      <img src="/api/image?usage=user_uploaded&code={code}" alt="user_uploaded" class="result-image"/>
    {/if}

    {#if uploading || (previewUrl && codeStatus !== 'finished') || codeStatus === 'uploaded'}
      <Loading />
    {/if}
  </div>
</div>

<style>
  .hidden {
    display: none;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 10px;
    display: flex;
    flex-direction: column;
    overflow-y: hidden;
  }
  
  .code-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-height: 20vh;
  }

  .code-info .code {
    color: #666;
  }
  
  .loading {
    padding: 20px;
    text-align: center;
    color: #666;
  }

  .image-container {
    position: relative;
    display: flex;
    flex: 1;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 20px;
    justify-content: center;
    border: 1px solid #ddd;
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    max-width: 100%;
    min-height: 60vh;
    max-height: 80vh;
  }

  @media (max-width: 768px) {
    .image-container {
      min-height: 80vh;
    }
  }

  @media (max-height: 768px) {
    .image-container {
      min-height: 80vh;
    }
  }
  
  .result-image {
    width: 100%;
    max-width: 100%;
    height: auto;
    object-fit: contain;
    display: block;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .back-button {
    padding: 0.3rem 1rem;
    width: 55px;
    height: 55px;
    background-color: #EEE;
    color: white;
    border: none;
    border-radius: 30px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .back-button:hover {
    background-color: #DDD;
  }

  .style-selector-container {
    position: absolute;
    top: 0;
    left: 0;
  }
</style>