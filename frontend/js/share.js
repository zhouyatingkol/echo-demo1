/**
 * ECHO Music - Social Share Module
 * Handles sharing music to social platforms, QR codes, and embed code generation
 */

class MusicShare {
    constructor(options = {}) {
        this.baseUrl = options.baseUrl || 'https://zhouyatingkol.github.io/echo-demo1/frontend/music-market.html';
        this.cdnUrl = options.qrCodeCDN || 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
        this.qrLoaded = false;
        this.currentMusic = null;
    }

    /**
     * Generate share URL for a music
     * @param {number} tokenId - The music token ID
     * @returns {string} Share URL
     */
    generateShareUrl(tokenId) {
        return `${this.baseUrl}?music=${tokenId}`;
    }

    /**
     * Share to Twitter/X
     * @param {Object} music - Music object with name, creator, tokenId
     * @param {string} text - Custom share text (optional)
     */
    shareToTwitter(music, text) {
        const shareUrl = this.generateShareUrl(music.tokenId);
        const shareText = text || `🎵 ${music.name} - 来自 ECHO Music NFT 市场，支持 AI 训练授权 #ECHO #MusicNFT`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, '_blank', 'width=550,height=420');
    }

    /**
     * Copy link to clipboard
     * @param {number} tokenId - The music token ID
     * @returns {Promise<boolean>} Success status
     */
    async copyLink(tokenId) {
        const shareUrl = this.generateShareUrl(tokenId);
        try {
            await navigator.clipboard.writeText(shareUrl);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }

    /**
     * Load QRCode.js library dynamically
     * @returns {Promise<boolean>}
     */
    async loadQRCodeLibrary() {
        if (this.qrLoaded && window.QRCode) return true;
        
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = this.cdnUrl;
            script.onload = () => {
                this.qrLoaded = true;
                resolve(true);
            };
            script.onerror = () => resolve(false);
            document.head.appendChild(script);
        });
    }

    /**
     * Generate QR code for a music
     * @param {number} tokenId - The music token ID
     * @param {string|HTMLElement} container - Container element or ID
     * @param {Object} options - QR code options
     * @returns {Promise<boolean>} Success status
     */
    async generateQRCode(tokenId, container, options = {}) {
        const loaded = await this.loadQRCodeLibrary();
        if (!loaded) {
            console.error('Failed to load QRCode library');
            return false;
        }

        const shareUrl = this.generateShareUrl(tokenId);
        const containerEl = typeof container === 'string' 
            ? document.getElementById(container) 
            : container;

        if (!containerEl) {
            console.error('QR code container not found');
            return false;
        }

        // Clear previous QR code
        containerEl.innerHTML = '';

        const qrOptions = {
            width: options.width || 200,
            height: options.height || 200,
            colorDark: options.colorDark || '#00d4ff',
            colorLight: options.colorLight || '#1a1a2e',
            correctLevel: QRCode.CorrectLevel.H
        };

        new QRCode(containerEl, {
            text: shareUrl,
            ...qrOptions
        });

        return true;
    }

    /**
     * Generate embed code for a music
     * @param {Object} music - Music object with name, tokenId, creator
     * @param {Object} options - Embed options
     * @returns {string} HTML embed code
     */
    generateEmbedCode(music, options = {}) {
        const shareUrl = this.generateShareUrl(music.tokenId);
        const width = options.width || 300;
        const height = options.height || 400;
        const theme = options.theme || 'dark';

        return `<!-- ECHO Music Embed - ${music.name} -->
<iframe 
    src="${shareUrl}&embed=true&theme=${theme}" 
    width="${width}" 
    height="${height}" 
    frameborder="0" 
    style="border-radius: 12px; border: 1px solid rgba(0,212,255,0.3);"
    allow="encrypted-media"
    title="ECHO Music - ${music.name}"
></iframe>`;
    }

    /**
     * Generate share modal HTML
     * @returns {HTMLElement} Modal element
     */
    createShareModal() {
        const modal = document.createElement('div');
        modal.id = 'shareModal';
        modal.className = 'share-modal';
        modal.innerHTML = `
            <div class="share-modal-content">
                <div class="share-modal-header">
                    <h3>🎵 分享音乐</h3>
                    <button class="share-modal-close" onclick="musicShare.closeModal()">&times;</button>
                </div>
                <div class="share-modal-body">
                    <div class="share-music-info">
                        <div class="share-music-title" id="shareMusicTitle">--</div>
                        <div class="share-music-meta" id="shareMusicMeta">--</div>
                    </div>
                    
                    <div class="share-section">
                        <div class="share-label">分享链接</div>
                        <div class="share-url-box">
                            <input type="text" id="shareUrlInput" readonly>
                            <button class="share-btn-copy" onclick="musicShare.copyFromModal()">
                                📋 复制
                            </button>
                        </div>
                    </div>

                    <div class="share-section">
                        <div class="share-label">二维码分享</div>
                        <div class="share-qr-container" id="shareQRContainer"></div>
                        <button class="share-btn-download" onclick="musicShare.downloadQR()">
                            💾 下载二维码
                        </button>
                    </div>

                    <div class="share-section">
                        <div class="share-label">嵌入代码</div>
                        <textarea class="share-embed-code" id="shareEmbedCode" readonly></textarea>
                        <button class="share-btn-copy" onclick="musicShare.copyEmbedCode()">
                            📋 复制嵌入代码
                        </button>
                    </div>

                    <div class="share-section">
                        <div class="share-label">分享到社交平台</div>
                        <div class="share-buttons">
                            <button class="share-btn-social twitter" onclick="musicShare.shareToTwitterFromModal()">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                                X / Twitter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles if not already added
        this.injectStyles();
        
        document.body.appendChild(modal);
        return modal;
    }

    /**
     * Inject share modal styles
     */
    injectStyles() {
        if (document.getElementById('share-modal-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'share-modal-styles';
        styles.textContent = `
            .share-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                z-index: 2000;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            }
            .share-modal.active {
                display: flex;
            }
            .share-modal-content {
                background: linear-gradient(135deg, #1a1a2e, #2a2a4e);
                border-radius: 16px;
                max-width: 450px;
                width: 90%;
                max-height: 85vh;
                overflow-y: auto;
                border: 1px solid rgba(0,212,255,0.3);
            }
            .share-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 24px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .share-modal-header h3 {
                margin: 0;
                font-size: 18px;
                color: #00d4ff;
            }
            .share-modal-close {
                background: none;
                border: none;
                color: #888;
                font-size: 28px;
                cursor: pointer;
                line-height: 1;
            }
            .share-modal-close:hover {
                color: #fff;
            }
            .share-modal-body {
                padding: 24px;
            }
            .share-music-info {
                text-align: center;
                margin-bottom: 20px;
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .share-music-title {
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 8px;
            }
            .share-music-meta {
                font-size: 12px;
                color: #888;
            }
            .share-section {
                margin-bottom: 24px;
            }
            .share-section:last-child {
                margin-bottom: 0;
            }
            .share-label {
                font-size: 12px;
                color: #888;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .share-url-box {
                display: flex;
                gap: 8px;
            }
            .share-url-box input {
                flex: 1;
                padding: 10px 12px;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
                font-family: monospace;
            }
            .share-btn-copy {
                padding: 10px 16px;
                background: rgba(0,212,255,0.2);
                border: 1px solid #00d4ff;
                border-radius: 8px;
                color: #00d4ff;
                font-size: 13px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.3s;
            }
            .share-btn-copy:hover {
                background: rgba(0,212,255,0.3);
            }
            .share-qr-container {
                display: flex;
                justify-content: center;
                padding: 20px;
                background: rgba(0,0,0,0.3);
                border-radius: 12px;
                margin-bottom: 10px;
            }
            .share-qr-container img,
            .share-qr-container canvas {
                border-radius: 8px;
            }
            .share-btn-download {
                width: 100%;
                padding: 10px;
                background: rgba(255,255,255,0.1);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                color: #fff;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .share-btn-download:hover {
                background: rgba(255,255,255,0.15);
            }
            .share-embed-code {
                width: 100%;
                height: 100px;
                padding: 12px;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 8px;
                color: #00d4ff;
                font-size: 12px;
                font-family: monospace;
                resize: none;
                margin-bottom: 10px;
            }
            .share-buttons {
                display: flex;
                gap: 10px;
            }
            .share-btn-social {
                flex: 1;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 12px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .share-btn-social.twitter {
                background: #000;
                color: #fff;
                border: 1px solid rgba(255,255,255,0.2);
            }
            .share-btn-social.twitter:hover {
                background: rgba(255,255,255,0.1);
            }
            .share-copied-toast {
                position: fixed;
                bottom: 100px;
                left: 50%;
                transform: translateX(-50%) translateY(20px);
                background: rgba(0,255,0,0.9);
                color: #000;
                padding: 12px 24px;
                border-radius: 8px;
                font-size: 14px;
                opacity: 0;
                transition: all 0.3s;
                z-index: 3000;
            }
            .share-copied-toast.show {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Show toast notification
     * @param {string} message 
     */
    showToast(message) {
        let toast = document.getElementById('shareToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'shareToast';
            toast.className = 'share-copied-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }

    /**
     * Open share modal for a music
     * @param {Object} music - Music object
     */
    async openModal(music) {
        this.currentMusic = music;
        
        let modal = document.getElementById('shareModal');
        if (!modal) {
            modal = this.createShareModal();
        }

        // Update music info
        document.getElementById('shareMusicTitle').textContent = music.name;
        document.getElementById('shareMusicMeta').textContent = 
            `Token #${music.tokenId} · ${music.creator.slice(0, 6)}...${music.creator.slice(-4)}`;
        
        // Update share URL
        const shareUrl = this.generateShareUrl(music.tokenId);
        document.getElementById('shareUrlInput').value = shareUrl;
        
        // Generate QR code
        await this.generateQRCode(music.tokenId, 'shareQRContainer');
        
        // Update embed code
        document.getElementById('shareEmbedCode').value = this.generateEmbedCode(music);

        modal.classList.add('active');
    }

    /**
     * Close share modal
     */
    closeModal() {
        const modal = document.getElementById('shareModal');
        if (modal) modal.classList.remove('active');
    }

    /**
     * Copy link from modal
     */
    async copyFromModal() {
        if (!this.currentMusic) return;
        const success = await this.copyLink(this.currentMusic.tokenId);
        if (success) {
            this.showToast('✅ 链接已复制到剪贴板');
        }
    }

    /**
     * Copy embed code
     */
    async copyEmbedCode() {
        const embedCode = document.getElementById('shareEmbedCode').value;
        try {
            await navigator.clipboard.writeText(embedCode);
            this.showToast('✅ 嵌入代码已复制');
        } catch (err) {
            this.showToast('❌ 复制失败，请手动复制');
        }
    }

    /**
     * Share to Twitter from modal
     */
    shareToTwitterFromModal() {
        if (!this.currentMusic) return;
        this.shareToTwitter(this.currentMusic);
    }

    /**
     * Download QR code as image
     */
    downloadQR() {
        const qrContainer = document.getElementById('shareQRContainer');
        const img = qrContainer.querySelector('img') || qrContainer.querySelector('canvas');
        if (!img) return;

        let dataUrl;
        if (img.tagName === 'CANVAS') {
            dataUrl = img.toDataURL('image/png');
        } else {
            dataUrl = img.src;
        }

        const link = document.createElement('a');
        link.download = `echo-music-${this.currentMusic?.tokenId || 'share'}-qr.png`;
        link.href = dataUrl;
        link.click();
    }
}

// Create global instance
const musicShare = new MusicShare();

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('shareModal');
    if (modal && modal.classList.contains('active') && e.target === modal) {
        musicShare.closeModal();
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MusicShare, musicShare };
}