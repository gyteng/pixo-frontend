<script>
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import Icon from '@iconify/svelte';
  import { onMount, onDestroy } from 'svelte';
  import ImageUploader from '$lib/components/ImageUploader.svelte';
  import StyleSelector from '$lib/components/StyleSelector.svelte';
  import Loading from '$lib/components/Loading.svelte';
  import ThumbnailImage from '$lib/components/ThumbnailImage.svelte';
  import Image from '$lib/components/Image.svelte';
  import { ls } from '$lib/localStorage'

  let previewUrl = null;
  let uploading = false;
  let uploadSuccess = false;
  let loadingText = '...';
  let isWechat = false;
  const history = ls('history_v0', []);

  /**
   * loading
   * created
   * uploaded
   * finished
   * error
   */
  let codeStatus = 'loading';

  let pollingInterval;
  const code = $page.params.code;

  let selectedStyle = null;
  $: loadingBackground = uploadSuccess || codeStatus === 'uploaded';
  $: loadingText = uploading ? '上传图片' : '正在转换图片';
  $: qrText = isWechat ? `${window.location.origin}/img/${code}` : '';
  
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
        goto('/');
        return;
      }
      
      codeStatus = result.codeStatus;

      if (codeStatus === 'error') {
        previewUrl = null;
      }
      if (codeStatus === 'finished') {
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        addHistory(code);
      }
    } catch (error) {
      console.error('获取兑换码状态出错:', error);
    }
  }
  
  function startPolling() {
    checkCodeStatus();
    pollingInterval = setInterval(checkCodeStatus, 20 * 1000);
  }

  function backToHomepage() {
    goto('/');
  }

  function addHistory(code, toFirst = false) {
    const exists = $history.includes(code);
    if (exists && !toFirst) {
      return;
    }
    history.update(currentHistory => {
      const filteredHistory = currentHistory.filter(item => item !== code);
      return [code, ...filteredHistory].slice(0, 15);
    });
  }

  function handleUploadSuccess() {
    uploadSuccess = true;
    uploading = false;
    addHistory(code, true);
  }

  function handleUploadError() {
    uploadSuccess = false;
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

    const uaHasWechat = /MicroMessenger/i.test(navigator.userAgent);
    const hasWeixinJSBridge = typeof window !== 'undefined' && 
                              typeof window.WeixinJSBridge !== 'undefined';
    const hasWxEnvironment = typeof window !== 'undefined' && 
                             window.__wxjs_environment === 'miniprogram';
    const hasWxObject = typeof window !== 'undefined' && typeof window.wx !== 'undefined';
    isWechat = uaHasWechat || hasWeixinJSBridge || hasWxEnvironment || hasWxObject;
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
    <div class="code">
      {#if codeStatus === 'error'}
        <div class="error-message">
          图片转换错误，请重新上传
        </div>
      {:else}
        <div>{code}</div>
      {/if}
    </div>
  </div>
  <div class="image-container">
    <div class:hidden={hideStyleSelector()} class="style-selector-container">
      <StyleSelector bind:selectedStyle={selectedStyle} />
    </div>
    {#if codeStatus === 'finished'}
      <ThumbnailImage imageUrl={"/api/image?usage=user_uploaded&code=" + code} altText="原始图片" />
    {/if}
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
        on:uploaderror={handleUploadError}
      />
    {:else if codeStatus === 'finished'}
      <div class="result-image">
        <Image src="/api/image?usage=ai_generated&code={code}" alt="ai_generated" fit="contain" qrText={qrText}/>
        />
      </div>
    {:else}
      <div class="result-image">
        <Image src="/api/image?usage=user_uploaded&code={code}" alt="user_uploaded" fit="contain"/>
      </div>
    {/if}
    {#if uploading || (previewUrl && codeStatus !== 'finished') || codeStatus === 'uploaded'}
      <Loading bind:loadingBackground={loadingBackground} bind:loadingText={loadingText}/>
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

  .error-message {
    color: #990000;
  }
</style>