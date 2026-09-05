/**
 * Universal Multi-Provider Image & File Uploader
 * Supports:
 * 1. ImgBB (Free, Instant, 32MB limit, no expiration)
 * 2. Cloudinary (Direct Unsigned / Preset / API)
 * 3. FreeImage.host API (Free image host, permanent)
 * 4. Catbox.moe (Free, permanent file & image host, no account required via litterbox/catbox proxy or userhash)
 * 
 * Includes automatic failover: If provider A fails or quota exceeded, automatically tries provider B -> C -> D!
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'COMED_MULTI_STORAGE_CONFIG_V1';

  // Default keys and fallbacks
  const DEFAULT_CONFIG = {
    activeProvider: 'auto', // 'auto' | 'imgbb' | 'cloudinary' | 'freeimage' | 'catbox'
    
    // 1. ImgBB API Key (Users can put their free key from https://api.imgbb.com)
    imgbbApiKey: localStorage.getItem('COMED_IMGBB_KEY') || '6d207e02198a847aa5ad8ac504ff3463',

    // 2. Cloudinary Config (Unsigned upload preset)
    cloudinaryCloudName: localStorage.getItem('COMED_CLOUDINARY_NAME') || 'demo',
    cloudinaryUploadPreset: localStorage.getItem('COMED_CLOUDINARY_PRESET') || 'docs_upload_example_preset',

    // 3. FreeImage API Key (From https://freeimage.host/page/api)
    freeimageApiKey: localStorage.getItem('COMED_FREEIMAGE_KEY') || '6d207e02198a847aa5ad8ac504ff3463',

    // 4. Catbox Userhash (Optional, empty for anonymous permanent upload)
    catboxUserHash: localStorage.getItem('COMED_CATBOX_HASH') || ''
  };

  class MultiCloudUploader {
    constructor() {
      this.config = this.loadConfig();
    }

    loadConfig() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : { ...DEFAULT_CONFIG };
      } catch (e) {
        return { ...DEFAULT_CONFIG };
      }
    }

    saveConfig(newCfg) {
      this.config = { ...this.config, ...newCfg };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config));
    }

    /**
     * Upload an image file with multi-provider failover
     * @param {File|Blob|string} fileInput - File object or Base64 DataURL
     * @param {Object} options - { onProgress: function(percent, statusText), preferredProvider: string }
     * @returns {Promise<{url: string, provider: string, success: boolean}>}
     */
    async upload(fileInput, options = {}) {
      const onProgress = options.onProgress || (() => {});
      const preferred = options.preferredProvider || this.config.activeProvider || 'auto';

      let fileObj = fileInput;
      let base64Clean = '';

      // Convert Base64 DataURL to File if needed
      if (typeof fileInput === 'string' && fileInput.startsWith('data:')) {
        base64Clean = fileInput.split(',')[1] || fileInput;
        fileObj = this.dataURLtoFile(fileInput, 'upload_' + Date.now() + '.png');
      }

      // Priority order of providers to try
      let providers = [];
      if (preferred !== 'auto') {
        providers.push(preferred);
      }
      
      const allList = ['imgbb', 'freeimage', 'catbox', 'cloudinary'];
      for (const p of allList) {
        if (!providers.includes(p)) providers.push(p);
      }

      let lastError = null;

      for (const provider of providers) {
        try {
          onProgress(20, `กำลังอัปโหลดผ่าน ${this.getProviderName(provider)}...`);
          let resultUrl = null;

          if (provider === 'imgbb') {
            resultUrl = await this.uploadToImgBB(fileObj, base64Clean);
          } else if (provider === 'freeimage') {
            resultUrl = await this.uploadToFreeImage(fileObj, base64Clean);
          } else if (provider === 'catbox') {
            resultUrl = await this.uploadToCatbox(fileObj);
          } else if (provider === 'cloudinary') {
            resultUrl = await this.uploadToCloudinary(fileObj);
          }

          if (resultUrl) {
            onProgress(100, `อัปโหลดสำเร็จผ่าน ${this.getProviderName(provider)}!`);
            return {
              url: resultUrl,
              provider: provider,
              success: true
            };
          }
        } catch (err) {
          console.warn(`[MultiUploader] Provider ${provider} failed:`, err);
          lastError = err;
          onProgress(40, `${this.getProviderName(provider)} ไม่ตอบสนอง กำลังสลับผู้ให้บริการสำรอง...`);
        }
      }

      // If all fail, throw error
      throw new Error("ไม่สามารถอัปโหลดไฟล์ผ่านบริการใดๆ ได้: " + (lastError?.message || "Unknown error"));
    }

    /**
     * 1. ImgBB Upload (POST https://api.imgbb.com/1/upload)
     */
    async uploadToImgBB(fileObj, base64Clean) {
      const apiKey = this.config.imgbbApiKey || '6d207e02198a847aa5ad8ac504ff3463';
      const formData = new FormData();
      
      if (base64Clean) {
        formData.append('image', base64Clean);
      } else {
        formData.append('image', fileObj);
      }

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
        method: 'POST',
        body: formData
      });

      const json = await response.json();
      if (json && json.data && json.data.url) {
        return json.data.display_url || json.data.url;
      }
      throw new Error(json?.error?.message || "ImgBB upload rejected");
    }

    /**
     * 2. FreeImage.host API (POST https://freeimage.host/api/1/upload)
     */
    async uploadToFreeImage(fileObj, base64Clean) {
      const apiKey = this.config.freeimageApiKey || '6d207e02198a847aa5ad8ac504ff3463';
      const formData = new FormData();
      formData.append('key', apiKey);
      formData.append('action', 'upload');
      formData.append('format', 'json');

      if (base64Clean) {
        formData.append('source', base64Clean);
      } else {
        formData.append('source', fileObj);
      }

      const response = await fetch('https://freeimage.host/api/1/upload', {
        method: 'POST',
        body: formData
      });

      const json = await response.json();
      if (json && json.image && json.image.url) {
        return json.image.display_url || json.image.url;
      }
      throw new Error(json?.error?.message || "FreeImage upload rejected");
    }

    /**
     * 3. Catbox.moe API (POST https://catbox.moe/user/api.php)
     */
    async uploadToCatbox(fileObj) {
      const formData = new FormData();
      formData.append('reqtype', 'fileupload');
      if (this.config.catboxUserHash) {
        formData.append('userhash', this.config.catboxUserHash);
      }
      formData.append('fileToUpload', fileObj);

      // Catbox direct or via reliable CORS proxy
      const targetUrl = 'https://corsproxy.io/?url=' + encodeURIComponent('https://catbox.moe/user/api.php');
      const response = await fetch(targetUrl, {
        method: 'POST',
        body: formData
      });

      const text = (await response.text()).trim();
      if (text.startsWith('http://') || text.startsWith('https://')) {
        return text.replace('http://', 'https://');
      }
      throw new Error("Catbox response error: " + text);
    }

    /**
     * 4. Cloudinary Unsigned Upload (POST https://api.cloudinary.com/v1_1/<cloud_name>/image/upload)
     */
    async uploadToCloudinary(fileObj) {
      const cloudName = this.config.cloudinaryCloudName || 'demo';
      const preset = this.config.cloudinaryUploadPreset || 'docs_upload_example_preset';
      
      const formData = new FormData();
      formData.append('file', fileObj);
      formData.append('upload_preset', preset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`, {
        method: 'POST',
        body: formData
      });

      const json = await response.json();
      if (json && json.secure_url) {
        return json.secure_url;
      }
      throw new Error(json?.error?.message || "Cloudinary upload rejected");
    }

    getProviderName(p) {
      switch (p) {
        case 'imgbb': return 'ImgBB API (ฟรี ไม่จำกัด)';
        case 'freeimage': return 'FreeImage.host API';
        case 'catbox': return 'Catbox.moe (ถาวร ไม่ต้องสมัคร)';
        case 'cloudinary': return 'Cloudinary CDN';
        default: return 'Auto Smart Cloud';
      }
    }

    dataURLtoFile(dataurl, filename) {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: mime });
    }
  }

  // Expose global instance
  window.MultiCloudUploader = new MultiCloudUploader();

})(window);
