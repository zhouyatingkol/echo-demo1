/**
 * ECHO Mint Service
 * 处理作品上链（铸造）流程
 * 
 * 功能：
 * - 上传文件到 IPFS（模拟/真实）
 * - 构建作品元数据
 * - 配置四权参数
 * - 调用合约铸造
 * - 显示交易状态
 */

// IPFS 配置 (使用模拟或真实服务)
const IPFS_CONFIG = {
    // 模拟模式：在开发/测试阶段使用 base64 或本地 URL
    // 生产模式：使用真实 IPFS 服务如 Pinata, NFT.Storage
    mode: 'mock', // 'mock' | 'pinata' | 'nft.storage'
    pinata: {
        apiKey: '',
        secretKey: ''
    }
};

/**
 * 铸造状态枚举
 */
const MintStatus = {
    IDLE: 'idle',
    UPLOADING: 'uploading',
    BUILDING_METADATA: 'building_metadata',
    APPROVING: 'approving',
    CONFIRMING: 'confirming',
    SUCCESS: 'success',
    ERROR: 'error'
};

/**
 * 铸造服务类
 */
class MintService {
    constructor() {
        this.status = MintStatus.IDLE;
        this.progress = 0;
        this.error = null;
        this.result = null;
        this.onStatusChange = null;
        this.onProgress = null;
        this.onError = null;
        this.onSuccess = null;
    }

    /**
     * 设置回调函数
     * @param {Object} callbacks - 回调函数对象
     */
    setCallbacks(callbacks) {
        this.onStatusChange = callbacks.onStatusChange || null;
        this.onProgress = callbacks.onProgress || null;
        this.onError = callbacks.onError || null;
        this.onSuccess = callbacks.onSuccess || null;
    }

    /**
     * 更新状态
     * @param {string} status - 状态
     * @param {number} progress - 进度 (0-100)
     */
    updateStatus(status, progress = null) {
        this.status = status;
        if (progress !== null) {
            this.progress = progress;
        }
        
        if (this.onStatusChange) {
            this.onStatusChange(status, this.progress);
        }
        
        if (this.onProgress && progress !== null) {
            this.onProgress(progress);
        }

        console.log(`[MintService] Status: ${status}, Progress: ${this.progress}%`);
    }

    /**
     * 上传文件到 IPFS
     * @param {File} file - 文件对象
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<{uri: string, hash: string}>}
     */
    async uploadToIPFS(file, onProgress = null) {
        this.updateStatus(MintStatus.UPLOADING, 10);

        try {
            let uri, hash;

            if (IPFS_CONFIG.mode === 'mock') {
                // 模拟模式：使用 base64 或本地 blob URL
                const result = await this.mockUpload(file, onProgress);
                uri = result.uri;
                hash = result.hash;
            } else if (IPFS_CONFIG.mode === 'pinata') {
                // Pinata IPFS 上传
                const result = await this.uploadToPinata(file, onProgress);
                uri = result.uri;
                hash = result.hash;
            } else {
                throw new Error('未配置的 IPFS 模式');
            }

            this.updateStatus(MintStatus.UPLOADING, 30);
            return { uri, hash };

        } catch (error) {
            console.error('[MintService] IPFS upload failed:', error);
            throw new Error('文件上传失败: ' + error.message);
        }
    }

    /**
     * 模拟上传（开发测试用）
     * @param {File} file - 文件对象
     * @returns {Promise<{uri: string, hash: string}>}
     */
    async mockUpload(file) {
        // 模拟上传延迟
        await this.delay(1000);

        // 生成模拟的 IPFS URI
        const mockHash = this.generateMockHash();
        const uri = `ipfs://${mockHash}/${file.name}`;

        // 可选：创建本地 blob URL 用于预览
        const localUrl = URL.createObjectURL(file);

        console.log('[MintService] Mock upload completed:', uri);
        
        return {
            uri,
            hash: mockHash,
            localUrl // 用于本地预览
        };
    }

    /**
     * 上传到 Pinata IPFS
     * @param {File} file - 文件对象
     * @returns {Promise<{uri: string, hash: string}>}
     */
    async uploadToPinata(file) {
        if (!IPFS_CONFIG.pinata.apiKey) {
            throw new Error('Pinata API Key 未配置');
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                'pinata_api_key': IPFS_CONFIG.pinata.apiKey,
                'pinata_secret_api_key': IPFS_CONFIG.pinata.secretKey
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Pinata 上传失败: ${response.statusText}`);
        }

        const data = await response.json();
        return {
            uri: `ipfs://${data.IpfsHash}`,
            hash: data.IpfsHash
        };
    }

    /**
     * 构建作品元数据
     * @param {Object} params - 参数
     * @returns {Object}
     */
    buildMetadata(params) {
        this.updateStatus(MintStatus.BUILDING_METADATA, 35);

        const metadata = {
            name: params.name,
            description: params.description,
            assetType: params.assetType || 'music',
            uri: params.uri,
            contentHash: params.contentHash,
            image: params.coverImage || '', // 封面图
            attributes: [
                {
                    trait_type: '作品类型',
                    value: params.assetType || 'music'
                },
                {
                    trait_type: '创建时间',
                    display_type: 'date',
                    value: Math.floor(Date.now() / 1000)
                }
            ],
            rights: {
                usage: {
                    commercialUse: params.commercialUse !== false,
                    modificationAllowed: params.modificationAllowed !== false
                },
                derivative: {
                    allowDerivatives: params.allowDerivatives !== false,
                    parentShare: params.parentShare || 30
                },
                pricing: {
                    buyout: params.buyoutPrice || 100,
                    perUse: params.perUsePrice || 0.5,
                    daily: params.dailyPrice || 10
                }
            }
        };

        this.updateStatus(MintStatus.BUILDING_METADATA, 40);
        return metadata;
    }

    /**
     * 构建权益配置
     * @param {Object} formData - 表单数据
     * @returns {Object}
     */
    buildRightsConfig(formData) {
        const config = {
            // 使用权
            usageFee: formData.usageFee || '0',
            commercialUse: formData.commercialUse === 'allow',
            modificationAllowed: true,
            allowedScopes: ['personal', 'commercial'],
            restrictedScopes: [],
            maxUsers: 100,
            licenseDuration: 365,

            // 衍生权
            derivativeFee: formData.derivativeFee || '0',
            allowDerivatives: formData.deriveOpen !== 'forbid',
            parentShare: parseInt(formData.parentShare) || 30,
            allowedTypes: ['remix', 'cover', 'sample'],

            // 扩展权
            extensionFee: '0',
            allowExtensions: formData.platformExt === 'auto',
            allowedExtensions: ['game', 'film', 'streaming'],

            // 收益权
            creatorShare: parseInt(formData.creatorShare) || 70,
            autoDistribute: true
        };

        return config;
    }

    /**
     * 执行铸造
     * @param {Object} params - 铸造参数
     * @returns {Promise<Object>}
     */
    async mint(params) {
        try {
            // 1. 检查钱包连接
            if (!window.walletManager || !window.walletManager.isConnected) {
                throw new Error('请先连接钱包');
            }

            // 2. 上传文件到 IPFS
            let fileUri, fileHash;
            if (params.file) {
                const uploadResult = await this.uploadToIPFS(params.file);
                fileUri = uploadResult.uri;
                fileHash = uploadResult.hash;
            } else {
                throw new Error('请上传作品文件');
            }

            // 3. 构建元数据
            const metadata = this.buildMetadata({
                name: params.name,
                description: params.description,
                assetType: params.assetType,
                uri: fileUri,
                contentHash: fileHash,
                coverImage: params.coverImage,
                commercialUse: params.commercialUse,
                allowDerivatives: params.allowDerivatives,
                parentShare: params.parentShare,
                buyoutPrice: params.buyoutPrice,
                perUsePrice: params.perUsePrice,
                dailyPrice: params.dailyPrice
            });

            // 4. 构建权益配置
            const rightsConfig = this.buildRightsConfig(params);

            this.updateStatus(MintStatus.APPROVING, 50);

            // 5. 初始化合约服务
            const provider = window.walletManager.provider;
            const signer = window.walletManager.signer;
            
            if (!contractService.isInitialized) {
                await contractService.initialize(provider, signer);
            }

            this.updateStatus(MintStatus.CONFIRMING, 60);

            // 6. 调用合约铸造
            const result = await contractService.mintECHO(metadata, rightsConfig);

            this.updateStatus(MintStatus.SUCCESS, 100);

            // 7. 构建结果
            this.result = {
                tokenId: result.tokenId,
                txHash: result.txHash,
                blockNumber: result.blockNumber,
                name: params.name,
                assetType: params.assetType,
                uri: fileUri,
                explorerUrl: `${CONTRACT_CONFIG.network.blockExplorer}/tx/${result.txHash}`
            };

            if (this.onSuccess) {
                this.onSuccess(this.result);
            }

            return this.result;

        } catch (error) {
            this.error = error;
            this.updateStatus(MintStatus.ERROR, this.progress);
            
            if (this.onError) {
                this.onError(error);
            }
            
            throw error;
        }
    }

    /**
     * 验证铸造参数
     * @param {Object} params - 参数
     * @returns {Object} - {valid: boolean, errors: string[]}
     */
    validateParams(params) {
        const errors = [];

        if (!params.name || params.name.trim().length === 0) {
            errors.push('请输入作品名称');
        }

        if (!params.description || params.description.trim().length === 0) {
            errors.push('请输入作品描述');
        }

        if (!params.assetType) {
            errors.push('请选择作品类型');
        }

        if (!params.file) {
            errors.push('请上传作品文件');
        }

        // 验证价格设置
        const selectedModes = params.selectedLicenseModes || ['buyout'];
        if (selectedModes.includes('buyout') && (!params.buyoutPrice || params.buyoutPrice <= 0)) {
            errors.push('买断价格必须大于 0');
        }
        if (selectedModes.includes('per-use') && (!params.perUsePrice || params.perUsePrice <= 0)) {
            errors.push('按次价格必须大于 0');
        }
        if (selectedModes.includes('time') && (!params.dailyPrice || params.dailyPrice <= 0)) {
            errors.push('日租价格必须大于 0');
        }

        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * 获取状态文本
     * @param {string} status - 状态码
     * @returns {string}
     */
    getStatusText(status) {
        const statusTexts = {
            [MintStatus.IDLE]: '准备就绪',
            [MintStatus.UPLOADING]: '正在上传文件到 IPFS...',
            [MintStatus.BUILDING_METADATA]: '正在构建作品元数据...',
            [MintStatus.APPROVING]: '等待交易授权...',
            [MintStatus.CONFIRMING]: '等待区块确认...',
            [MintStatus.SUCCESS]: '铸造成功！',
            [MintStatus.ERROR]: '铸造失败'
        };
        return statusTexts[status] || status;
    }

    /**
     * 生成模拟哈希
     * @returns {string}
     */
    generateMockHash() {
        return 'Qm' + Array.from({length: 44}, () => 
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]
        ).join('');
    }

    /**
     * 延迟函数
     * @param {number} ms - 毫秒
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 重置服务状态
     */
    reset() {
        this.status = MintStatus.IDLE;
        this.progress = 0;
        this.error = null;
        this.result = null;
    }
}

// 创建全局实例
const mintService = new MintService();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MintService, mintService, MintStatus };
}
