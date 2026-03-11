// ECHO Asset V2 合约交互脚本
const V2_CONTRACT_ADDRESS = '0x319148d9b9265D75858c508E445d65B649036f75';

const V2_ABI = [
    // 铸造
    "function mintECHO(string name, string description, string assetType, string uri, bytes32 contentHash, tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue) blueprint) returns (uint256)",
    // 查询
    "function getAssetInfo(uint256 tokenId) view returns (tuple(string name, string description, string assetType, string uri, bytes32 contentHash, uint256 createdAt, uint256 lastUpdated), tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue), address creator, uint256 version)",
    "function getVersionHistory(uint256 tokenId) view returns (tuple(uint256 version, bytes32 contentHash, string uri, uint256 timestamp, string updateReason)[])",
    "function currentVersion(uint256 tokenId) view returns (uint256)",
    "function originalCreator(uint256 tokenId) view returns (address)",
    "function contentHashToToken(bytes32) view returns (uint256)",
    // 版本控制
    "function updateContent(uint256 tokenId, string newUri, bytes32 newContentHash, string updateReason)",
    // 权利转让
    "function transferUsageRight(uint256 tokenId, address newOwner)",
    "function transferDerivativeRight(uint256 tokenId, address newOwner)",
    "function transferExtensionRight(uint256 tokenId, address newOwner)",
    "function transferRevenueRight(uint256 tokenId, address newOwner)",
    // 使用授权
    "function payForUsage(uint256 tokenId, uint256 durationDays) payable",
    "function hasUsageRight(uint256 tokenId, address user) view returns (bool)",
    // 衍生作品
    "function createDerivative(uint256 parentId, string name, string description, string assetType, string uri, bytes32 contentHash, tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue) blueprint) payable returns (uint256)",
    "function getDerivativeWorks(uint256 tokenId) view returns (uint256[])",
    "function parentAsset(uint256 tokenId) view returns (uint256)",
    // 事件
    "event AssetMinted(uint256 indexed tokenId, address indexed creator, bytes32 contentHash, string name)",
    "event ContentUpdated(uint256 indexed tokenId, uint256 version, bytes32 newContentHash, string updateReason)"
];

class ECHOAssetV2 {
    constructor(provider, signer) {
        this.contract = new ethers.Contract(V2_CONTRACT_ADDRESS, V2_ABI, signer);
        this.provider = provider;
    }

    // 铸造资产
    async mintAsset(name, description, assetType, uri, contentHash, blueprint) {
        const tx = await this.contract.mintECHO(name, description, assetType, uri, contentHash, blueprint);
        const receipt = await tx.wait();
        
        // 解析事件获取 tokenId
        const event = receipt.logs.find(log => {
            try {
                const parsed = this.contract.interface.parseLog(log);
                return parsed?.name === 'AssetMinted';
            } catch { return false; }
        });
        
        if (event) {
            const parsed = this.contract.interface.parseLog(event);
            return {
                tokenId: parsed.args.tokenId.toString(),
                creator: parsed.args.creator,
                contentHash: parsed.args.contentHash,
                name: parsed.args.name,
                txHash: receipt.hash
            };
        }
        return { txHash: receipt.hash };
    }

    // 获取资产信息
    async getAssetInfo(tokenId) {
        const [metadata, blueprint, creator, version] = await this.contract.getAssetInfo(tokenId);
        return {
            metadata: {
                name: metadata.name,
                description: metadata.description,
                assetType: metadata.assetType,
                uri: metadata.uri,
                contentHash: metadata.contentHash,
                createdAt: new Date(Number(metadata.createdAt) * 1000),
                lastUpdated: new Date(Number(metadata.lastUpdated) * 1000)
            },
            blueprint: {
                usage: {
                    owner: blueprint.usage.owner,
                    fee: ethers.formatEther(blueprint.usage.fee),
                    commercialUse: blueprint.usage.commercialUse,
                    modificationAllowed: blueprint.usage.modificationAllowed
                },
                derivative: {
                    owner: blueprint.derivative.owner,
                    fee: ethers.formatEther(blueprint.derivative.fee),
                    allowDerivatives: blueprint.derivative.allowDerivatives,
                    revenueShare: Number(blueprint.derivative.revenueShare) / 100
                },
                extension: {
                    owner: blueprint.extension.owner,
                    fee: ethers.formatEther(blueprint.extension.fee),
                    allowExtensions: blueprint.extension.allowExtensions
                },
                revenue: {
                    owner: blueprint.revenue.owner,
                    sharePercentage: Number(blueprint.revenue.sharePercentage) / 100,
                    autoDistribute: blueprint.revenue.autoDistribute
                }
            },
            creator,
            version: version.toString()
        };
    }

    // 获取版本历史
    async getVersionHistory(tokenId) {
        const history = await this.contract.getVersionHistory(tokenId);
        return history.map(h => ({
            version: h.version.toString(),
            contentHash: h.contentHash,
            uri: h.uri,
            timestamp: new Date(Number(h.timestamp) * 1000),
            updateReason: h.updateReason
        }));
    }

    // 更新内容（新版本）
    async updateContent(tokenId, newUri, newContentHash, updateReason) {
        const tx = await this.contract.updateContent(tokenId, newUri, newContentHash, updateReason);
        return await tx.wait();
    }

    // 创建衍生作品
    async createDerivative(parentId, name, description, assetType, uri, contentHash, blueprint) {
        // 先获取父资产的授权费
        const [, parentBlueprint] = await this.contract.getAssetInfo(parentId);
        const fee = parentBlueprint.derivative.fee;
        
        const tx = await this.contract.createDerivative(
            parentId, name, description, assetType, uri, contentHash, blueprint,
            { value: fee }
        );
        return await tx.wait();
    }

    // 获取衍生作品列表
    async getDerivativeWorks(tokenId) {
        const works = await this.contract.getDerivativeWorks(tokenId);
        return works.map(w => w.toString());
    }

    // 支付使用费
    async payForUsage(tokenId, durationDays) {
        const [, blueprint] = await this.contract.getAssetInfo(tokenId);
        const fee = blueprint.usage.fee * BigInt(durationDays);
        
        const tx = await this.contract.payForUsage(tokenId, durationDays, { value: fee });
        return await tx.wait();
    }

    // 检查是否有使用权
    async hasUsageRight(tokenId, userAddress) {
        return await this.contract.hasUsageRight(tokenId, userAddress);
    }

    // 转让权利
    async transferRight(tokenId, rightType, newOwner) {
        let tx;
        switch(rightType) {
            case 'usage':
                tx = await this.contract.transferUsageRight(tokenId, newOwner);
                break;
            case 'derivative':
                tx = await this.contract.transferDerivativeRight(tokenId, newOwner);
                break;
            case 'extension':
                tx = await this.contract.transferExtensionRight(tokenId, newOwner);
                break;
            case 'revenue':
                tx = await this.contract.transferRevenueRight(tokenId, newOwner);
                break;
            default:
                throw new Error('Unknown right type');
        }
        return await tx.wait();
    }

    // 计算文件哈希（keccak256）
    static async calculateFileHash(file) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const hash = ethers.keccak256(uint8Array);
        return hash;
    }
}

// 导出
if (typeof window !== 'undefined') {
    window.ECHOAssetV2 = ECHOAssetV2;
    window.V2_CONTRACT_ADDRESS = V2_CONTRACT_ADDRESS;
}