// 内容验证工具
class ContentVerifier {
    constructor() {
        this.history = JSON.parse(localStorage.getItem('echoVerificationHistory') || '[]');
    }

    // 计算文件哈希（keccak256）
    static async calculateFileHash(file, onProgress = null) {
        return new Promise((resolve, reject) => {
            const chunkSize = 1024 * 1024; // 1MB chunks
            const chunks = Math.ceil(file.size / chunkSize);
            const hash = sha3_256.create();
            let currentChunk = 0;

            const reader = new FileReader();

            reader.onload = (e) => {
                const arrayBuffer = e.target.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                hash.update(uint8Array);

                currentChunk++;
                
                if (onProgress) {
                    onProgress((currentChunk / chunks) * 100);
                }

                if (currentChunk < chunks) {
                    readNextChunk();
                } else {
                    resolve('0x' + hash.hex());
                }
            };

            reader.onerror = () => reject(new Error('文件读取失败'));

            function readNextChunk() {
                const start = currentChunk * chunkSize;
                const end = Math.min(start + chunkSize, file.size);
                const chunk = file.slice(start, end);
                reader.readAsArrayBuffer(chunk);
            }

            readNextChunk();
        });
    }

    // 验证哈希匹配
    static verifyHash(localHash, onChainHash) {
        const normalizedLocal = localHash.toLowerCase().trim();
        const normalizedOnChain = onChainHash.toLowerCase().trim();
        return normalizedLocal === normalizedOnChain;
    }

    // 添加到历史
    addToHistory(tokenId, success, details = {}) {
        this.history.unshift({
            tokenId,
            success,
            timestamp: new Date().toISOString(),
            ...details
        });

        // 只保留最近 50 条
        this.history = this.history.slice(0, 50);
        localStorage.setItem('echoVerificationHistory', JSON.stringify(this.history));
    }

    // 获取历史
    getHistory() {
        return this.history;
    }

    // 清除历史
    clearHistory() {
        this.history = [];
        localStorage.removeItem('echoVerificationHistory');
    }

    // 格式化文件大小
    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 截断哈希显示
    static truncateHash(hash, start = 10, end = 8) {
        if (!hash || hash.length < start + end) return hash;
        return hash.slice(0, start) + '...' + hash.slice(-end);
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.ContentVerifier = ContentVerifier;
}