<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  
  export let uploading = false;
  export let previewUrl = null;
  export let code = '';
  export let selectedStyle = null;
  
  let selectedFile = null;
  let errorMessage = '';
  const dispatch = createEventDispatcher();
  
  const maxImageSize = 1024;
  const imageQuality = 0.7;
  
  async function compressImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // 计算新尺寸
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxImageSize) {
              height = Math.round((height * maxImageSize) / width);
              width = maxImageSize;
            }
          } else {
            if (height > maxImageSize) {
              width = Math.round((width * maxImageSize) / height);
              height = maxImageSize;
            }
          }
          
          // 创建Canvas并绘制调整后的图像
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // 转换为Blob
          canvas.toBlob(
            (blob) => {
              // 为压缩后的Blob添加文件名属性
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
              canvas.remove();
            },
            file.type,
            imageQuality
          );
        };
      };
    });
  }

  function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      selectedFile = file;
      previewUrl = URL.createObjectURL(file);
      dispatch('preview', { url: previewUrl });
    }
    if (selectedFile) {
      uploadImage();
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
  }
  
  function handleDragLeave(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
  }
  
  function handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      selectedFile = files[0];
      previewUrl = URL.createObjectURL(selectedFile);
      dispatch('preview', { url: previewUrl });
    } else {
      errorMessage = '请拖放图片文件';
    }
    if (selectedFile) {
      uploadImage();
    }
  }

  function handlePaste(event) {
    const items = (event.clipboardData || window.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        selectedFile = file;
        previewUrl = URL.createObjectURL(file);
        dispatch('preview', { url: previewUrl });
        break;
      }
    }
    if (selectedFile) {
      uploadImage();
    }
  }
  
  async function uploadImage() {
    if (!selectedFile) {
      console.error('没有选择文件');
      return;
    }
    
    try {
      uploading = true;
      errorMessage = '';
      dispatch('uploadstart');
      
      const formData = new FormData();
      formData.append('image', await compressImage(selectedFile));
      formData.append('style', selectedStyle);

      const response = await fetch('/api/image/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Code': code
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '上传失败');
      }
      dispatch('uploadsuccess');
    } catch (error) {
      errorMessage = `上传失败: ${error.message}`;
      dispatch('uploaderror', { error: errorMessage });
    } finally {
      uploading = false;
      dispatch('uploadend');
    }
  }
  
  onMount(() => {
    window.addEventListener('paste', handlePaste);
  });

  onDestroy(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    window.removeEventListener('paste', handlePaste);
  });
</script>

<div class="upload-section">
  {#if !uploading && !previewUrl}
    <div 
      class="drop-area"
      on:dragover={handleDragOver}
      on:dragleave={handleDragLeave}
      on:drop={handleDrop}
      role="button"
      aria-label="Drag and drop your image here"
      tabindex="0"
    >
      <div class="file-input-wrapper">
        <label for="image-upload" class="file-label">
          选择、拖拽或粘贴图片文件
          <input 
            type="file" 
            id="image-upload" 
            accept="image/*" 
            on:change={handleFileSelect} 
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  {/if}
  
  {#if previewUrl}
    <div class="preview-container">
      <img src={previewUrl} alt="预览图" class="image-preview" />
    </div>
  {/if}
</div>

<style>
  .upload-section {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .file-input-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 30vh;
  }
  
  .file-label {
    padding: 10px 15px;
    background-color: #4a90e2;
    color: white;
  }
  
  input[type="file"] {
    display: none;
  }
  
  .preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .image-preview {
    width: 100%;
    max-width: 100%;
    height: auto;
    /* max-height: 400px; */
    object-fit: contain;
    display: block;
  }

</style>