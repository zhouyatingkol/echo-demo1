/**
 * ECHO Protocol - Error Handler
 * 统一错误处理中心，提供错误码定义、用户友好消息和错误上报
 * @version 3.0.0
 */

/**
 * 错误码枚举
 * 统一错误码格式：模块_操作_错误类型
 */
const ErrorCodes = {
    // 通用错误 (COMMON)
    COMMON_UNKNOWN: 'COMMON_UNKNOWN',
    COMMON_NETWORK: 'COMMON_NETWORK',
    COMMON_TIMEOUT: 'COMMON_TIMEOUT',
    COMMON_INVALID_PARAMS: 'COMMON_INVALID_PARAMS',
    COMMON_UNAUTHORIZED: 'COMMON_UNAUTHORIZED',
    COMMON_FORBIDDEN: 'COMMON_FORBIDDEN',
    COMMON_NOT_FOUND: 'COMMON_NOT_FOUND',
    COMMON_SERVER_ERROR: 'COMMON_SERVER_ERROR',
    COMMON_RATE_LIMIT: 'COMMON_RATE_LIMIT',

    // 钱包相关 (WALLET)
    WALLET_NOT_INSTALLED: 'WALLET_NOT_INSTALLED',
    WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
    WALLET_CONNECTION_FAILED: 'WALLET_CONNECTION_FAILED',
    WALLET_CHAIN_SWITCH_FAILED: 'WALLET_CHAIN_SWITCH_FAILED',
    WALLET_REJECTED: 'WALLET_REJECTED',
    WALLET_DISCONNECTED: 'WALLET_DISCONNECTED',
    WALLET_INVALID_ADDRESS: 'WALLET_INVALID_ADDRESS',
    WALLET_INSUFFICIENT_BALANCE: 'WALLET_INSUFFICIENT_BALANCE',
    WALLET_WRONG_NETWORK: 'WALLET_WRONG_NETWORK',

    // 合约相关 (CONTRACT)
    CONTRACT_NOT_INITIALIZED: 'CONTRACT_NOT_INITIALIZED',
    CONTRACT_CALL_FAILED: 'CONTRACT_CALL_FAILED',
    CONTRACT_TRANSACTION_FAILED: 'CONTRACT_TRANSACTION_FAILED',
    CONTRACT_REVERTED: 'CONTRACT_REVERTED',
    CONTRACT_GAS_ESTIMATION_FAILED: 'CONTRACT_GAS_ESTIMATION_FAILED',
    CONTRACT_INSUFFICIENT_GAS: 'CONTRACT_INSUFFICIENT_GAS',
    CONTRACT_NONCE_ERROR: 'CONTRACT_NONCE_ERROR',
    CONTRACT_REPLACEMENT_TRANSACTION: 'CONTRACT_REPLACEMENT_TRANSACTION',

    // 资产相关 (ASSET)
    ASSET_NOT_FOUND: 'ASSET_NOT_FOUND',
    ASSET_ALREADY_EXISTS: 'ASSET_ALREADY_EXISTS',
    ASSET_INVALID_METADATA: 'ASSET_INVALID_METADATA',
    ASSET_MINT_FAILED: 'ASSET_MINT_FAILED',
    ASSET_TRANSFER_FAILED: 'ASSET_TRANSFER_FAILED',
    ASSET_NOT_OWNER: 'ASSET_NOT_OWNER',
    ASSET_FROZEN: 'ASSET_FROZEN',

    // 许可证相关 (LICENSE)
    LICENSE_NOT_FOUND: 'LICENSE_NOT_FOUND',
    LICENSE_EXPIRED: 'LICENSE_EXPIRED',
    LICENSE_INVALID: 'LICENSE_INVALID',
    LICENSE_ALREADY_EXISTS: 'LICENSE_ALREADY_EXISTS',
    LICENSE_PURCHASE_FAILED: 'LICENSE_PURCHASE_FAILED',
    LICENSE_NOT_AUTHORIZED: 'LICENSE_NOT_AUTHORIZED',

    // 融合相关 (FUSION)
    FUSION_INVALID_PARENTS: 'FUSION_INVALID_PARENTS',
    FUSION_PERCENTAGE_ERROR: 'FUSION_PERCENTAGE_ERROR',
    FUSION_FAILED: 'FUSION_FAILED',
    FUSION_NOT_OWNER_OF_PARENT: 'FUSION_NOT_OWNER_OF_PARENT',

    // API 相关 (API)
    API_FETCH_FAILED: 'API_FETCH_FAILED',
    API_PARSE_ERROR: 'API_PARSE_ERROR',
    API_CACHE_ERROR: 'API_CACHE_ERROR',
    API_RATE_LIMITED: 'API_RATE_LIMITED',

    // IPFS/存储相关 (STORAGE)
    STORAGE_UPLOAD_FAILED: 'STORAGE_UPLOAD_FAILED',
    STORAGE_DOWNLOAD_FAILED: 'STORAGE_DOWNLOAD_FAILED',
    STORAGE_INVALID_HASH: 'STORAGE_INVALID_HASH',
    STORAGE_GATEWAY_ERROR: 'STORAGE_GATEWAY_ERROR',

    // 验证相关 (VALIDATION)
    VALIDATION_FAILED: 'VALIDATION_FAILED',
    VALIDATION_INVALID_SIGNATURE: 'VALIDATION_INVALID_SIGNATURE',
    VALIDATION_CONTENT_MISMATCH: 'VALIDATION_CONTENT_MISMATCH'
};

/**
 * 错误码到用户友好消息的映射
 */
const ErrorMessages = {
    // 通用错误
    [ErrorCodes.COMMON_UNKNOWN]: {
        title: '发生错误',
        message: '操作失败，请稍后重试',
        action: '重试',
        severity: 'error'
    },
    [ErrorCodes.COMMON_NETWORK]: {
        title: '网络错误',
        message: '网络连接失败，请检查网络设置',
        action: '重试',
        severity: 'warning'
    },
    [ErrorCodes.COMMON_TIMEOUT]: {
        title: '请求超时',
        message: '服务器响应超时，请稍后重试',
        action: '重试',
        severity: 'warning'
    },
    [ErrorCodes.COMMON_INVALID_PARAMS]: {
        title: '参数错误',
        message: '输入的参数不正确，请检查后重试',
        action: '返回',
        severity: 'warning'
    },
    [ErrorCodes.COMMON_UNAUTHORIZED]: {
        title: '未授权',
        message: '请先登录或连接钱包',
        action: '连接钱包',
        severity: 'warning'
    },
    [ErrorCodes.COMMON_FORBIDDEN]: {
        title: '访问受限',
        message: '您没有权限执行此操作',
        action: '返回',
        severity: 'error'
    },
    [ErrorCodes.COMMON_NOT_FOUND]: {
        title: '未找到',
        message: '请求的内容不存在或已被删除',
        action: '返回首页',
        severity: 'info'
    },
    [ErrorCodes.COMMON_SERVER_ERROR]: {
        title: '服务器错误',
        message: '服务器暂时不可用，请稍后重试',
        action: '重试',
        severity: 'error'
    },
    [ErrorCodes.COMMON_RATE_LIMIT]: {
        title: '请求过于频繁',
        message: '操作太频繁，请稍后再试',
        action: '等待',
        severity: 'warning'
    },

    // 钱包错误
    [ErrorCodes.WALLET_NOT_INSTALLED]: {
        title: '未安装钱包',
        message: '请先安装 MetaMask 或其他 Web3 钱包',
        action: '安装钱包',
        link: 'https://metamask.io/download/',
        severity: 'warning'
    },
    [ErrorCodes.WALLET_NOT_CONNECTED]: {
        title: '钱包未连接',
        message: '请先连接您的钱包',
        action: '连接钱包',
        severity: 'info'
    },
    [ErrorCodes.WALLET_CONNECTION_FAILED]: {
        title: '连接失败',
        message: '无法连接到钱包，请检查后重试',
        action: '重试',
        severity: 'warning'
    },
    [ErrorCodes.WALLET_CHAIN_SWITCH_FAILED]: {
        title: '网络切换失败',
        message: '无法切换到目标网络，请手动切换',
        action: '手动切换',
        severity: 'warning'
    },
    [ErrorCodes.WALLET_REJECTED]: {
        title: '用户取消',
        message: '您已取消操作',
        action: '返回',
        severity: 'info'
    },
    [ErrorCodes.WALLET_DISCONNECTED]: {
        title: '钱包断开',
        message: '钱包连接已断开，请重新连接',
        action: '重新连接',
        severity: 'warning'
    },
    [ErrorCodes.WALLET_INVALID_ADDRESS]: {
        title: '地址无效',
        message: '输入的钱包地址格式不正确',
        action: '返回',
        severity: 'warning'
    },
    [ErrorCodes.WALLET_INSUFFICIENT_BALANCE]: {
        title: '余额不足',
        message: '您的 MEER 余额不足以完成此操作',
        action: '充值',
        severity: 'warning'
    },
    [ErrorCodes.WALLET_WRONG_NETWORK]: {
        title: '网络错误',
        message: '请切换到 Qitmeer 主网',
        action: '切换网络',
        severity: 'warning'
    },

    // 合约错误
    [ErrorCodes.CONTRACT_NOT_INITIALIZED]: {
        title: '合约未初始化',
        message: '智能合约尚未初始化，请刷新页面重试',
        action: '刷新',
        severity: 'error'
    },
    [ErrorCodes.CONTRACT_CALL_FAILED]: {
        title: '调用失败',
        message: '智能合约调用失败，请稍后重试',
        action: '重试',
        severity: 'error'
    },
    [ErrorCodes.CONTRACT_TRANSACTION_FAILED]: {
        title: '交易失败',
        message: '区块链交易未能完成',
        action: '查看详情',
        severity: 'error'
    },
    [ErrorCodes.CONTRACT_REVERTED]: {
        title: '交易被撤销',
        message: '交易被智能合约撤销，请检查参数后重试',
        action: '返回',
        severity: 'warning'
    },
    [ErrorCodes.CONTRACT_GAS_ESTIMATION_FAILED]: {
        title: 'Gas 估算失败',
        message: '无法估算 Gas 费用，交易可能被撤销',
        action: '重试',
        severity: 'warning'
    },
    [ErrorCodes.CONTRACT_INSUFFICIENT_GAS]: {
        title: 'Gas 不足',
        message: 'Gas 限额设置过低，请增加 Gas 限制',
        action: '调整 Gas',
        severity: 'warning'
    },
    [ErrorCodes.CONTRACT_NONCE_ERROR]: {
        title: '交易顺序错误',
        message: '交易顺序出现问题，请刷新后重试',
        action: '刷新',
        severity: 'warning'
    },
    [ErrorCodes.CONTRACT_REPLACEMENT_TRANSACTION]: {
        title: '交易被替换',
        message: '该交易已被另一笔交易替换',
        action: '查看',
        severity: 'info'
    },

    // 资产错误
    [ErrorCodes.ASSET_NOT_FOUND]: {
        title: '资产不存在',
        message: '该资产不存在或已被删除',
        action: '返回',
        severity: 'info'
    },
    [ErrorCodes.ASSET_ALREADY_EXISTS]: {
        title: '资产已存在',
        message: '该资产已经存在',
        action: '查看',
        severity: 'info'
    },
    [ErrorCodes.ASSET_INVALID_METADATA]: {
        title: '元数据无效',
        message: '资产元数据格式不正确',
        action: '返回',
        severity: 'warning'
    },
    [ErrorCodes.ASSET_MINT_FAILED]: {
        title: '生成失败',
        message: '资产生成未能完成',
        action: '重试',
        severity: 'error'
    },
    [ErrorCodes.ASSET_TRANSFER_FAILED]: {
        title: '转移失败',
        message: '资产转移未能完成',
        action: '重试',
        severity: 'error'
    },
    [ErrorCodes.ASSET_NOT_OWNER]: {
        title: '无权限',
        message: '您不是该资产的所有者',
        action: '返回',
        severity: 'warning'
    },
    [ErrorCodes.ASSET_FROZEN]: {
        title: '资产已冻结',
        message: '该资产已被冻结，暂时无法操作',
        action: '返回',
        severity: 'warning'
    },

    // 许可证错误
    [ErrorCodes.LICENSE_NOT_FOUND]: {
        title: '许可证不存在',
        message: '该许可证不存在或已过期',
        action: '返回',
        severity: 'info'
    },
    [ErrorCodes.LICENSE_EXPIRED]: {
        title: '许可证已过期',
        message: '该许可证已过期，请重新购买',
        action: '续期',
        severity: 'warning'
    },
    [ErrorCodes.LICENSE_INVALID]: {
        title: '许可证无效',
        message: '许可证验证失败',
        action: '返回',
        severity: 'warning'
    },
    [ErrorCodes.LICENSE_ALREADY_EXISTS]: {
        title: '许可证已存在',
        message: '您已经拥有该许可证',
        action: '查看',
        severity: 'info'
    },
    [ErrorCodes.LICENSE_PURCHASE_FAILED]: {
        title: '购买失败',
        message: '许可证购买未能完成',
        action: '重试',
        severity: 'error'
    },
    [ErrorCodes.LICENSE_NOT_AUTHORIZED]: {
        title: '未授权',
        message: '您没有使用该许可证的权限',
        action: '返回',
        severity: 'warning'
    },

    // 融合错误
    [ErrorCodes.FUSION_INVALID_PARENTS]: {
        title: '父资产无效',
        message: '选择的父资产不符合融合条件',
        action: '返回',
        severity: 'warning'
    },
    [ErrorCodes.FUSION_PERCENTAGE_ERROR]: {
        title: '比例错误',
        message: '融合比例总和必须等于 100%',
        action: '返回',
        severity: 'warning'
    },
    [ErrorCodes.FUSION_FAILED]: {
        title: '融合失败',
        message: '资产融合未能完成',
        action: '重试',
        severity: 'error'
    },
    [ErrorCodes.FUSION_NOT_OWNER_OF_PARENT]: {
        title: '无权限',
        message: '您必须拥有所有父资产才能进行融合',
        action: '返回',
        severity: 'warning'
    },

    // API 错误
    [ErrorCodes.API_FETCH_FAILED]: {
        title: '数据获取失败',
        message: '无法从服务器获取数据',
        action: '重试',
        severity: 'warning'
    },
    [ErrorCodes.API_PARSE_ERROR]: {
        title: '数据解析错误',
        message: '服务器返回的数据格式不正确',
        action: '刷新',
        severity: 'error'
    },
    [ErrorCodes.API_CACHE_ERROR]: {
        title: '缓存错误',
        message: '本地缓存操作失败',
        action: '清除缓存',
        severity: 'warning'
    },
    [ErrorCodes.API_RATE_LIMITED]: {
        title: '请求受限',
        message: '请求频率过高，请稍后再试',
        action: '等待',
        severity: 'warning'
    },

    // 存储错误
    [ErrorCodes.STORAGE_UPLOAD_FAILED]: {
        title: '上传失败',
        message: '文件上传未能完成',
        action: '重试',
        severity: 'error'
    },
    [ErrorCodes.STORAGE_DOWNLOAD_FAILED]: {
        title: '下载失败',
        message: '文件下载未能完成',
        action: '重试',
        severity: 'error'
    },
    [ErrorCodes.STORAGE_INVALID_HASH]: {
        title: '无效哈希',
        message: 'IPFS 哈希格式不正确',
        action: '返回',
        severity: 'warning'
    },
    [ErrorCodes.STORAGE_GATEWAY_ERROR]: {
        title: '网关错误',
        message: 'IPFS 网关暂时不可用',
        action: '切换网关',
        severity: 'warning'
    }
};

/**
 * 错误严重性级别
 */
const ErrorSeverity = {
    INFO: 'info',
    WARNING: 'warning',
    ERROR: 'error',
    CRITICAL: 'critical'
};

/**
 * 错误处理器类
 */
class ErrorHandler {
    constructor(options = {}) {
        this.options = {
            reportErrors: true,
            reportEndpoint: null,
            reportApiKey: null,
            environment: 'production',
            userId: null,
            appVersion: '3.0.0',
            maxReportsPerSession: 50,
            ...options
        };

        this.reportCount = 0;
        this.reportQueue = [];
        this.errorCallbacks = [];

        // 全局错误监听
        this._setupGlobalHandlers();
    }

    /**
     * 处理错误
     * @param {Error|Object} error - 错误对象
     * @param {string} code - 错误码
     * @param {Object} context - 错误上下文
     * @returns {Object} 标准化的错误对象
     */
    handle(error, code = ErrorCodes.COMMON_UNKNOWN, context = {}) {
        // 解析错误
        const parsedError = this._parseError(error, code, context);

        // 获取用户友好消息
        const userMessage = this._getUserMessage(parsedError.code);

        // 构建标准化错误对象
        const standardizedError = {
            ...parsedError,
            ...userMessage,
            timestamp: Date.now(),
            requestId: this._generateRequestId()
        };

        // 控制台输出
        this._logError(standardizedError);

        // 上报错误
        if (this.options.reportErrors && this.reportCount < this.options.maxReportsPerSession) {
            this._reportError(standardizedError);
        }

        // 执行回调
        this._notifyCallbacks(standardizedError);

        return standardizedError;
    }

    /**
     * 解析错误
     * @private
     */
    _parseError(error, defaultCode, context) {
        let code = defaultCode;
        let message = '';
        let originalError = error;
        let details = {};

        if (error instanceof Error) {
            message = error.message;
            details.stack = error.stack;
        } else if (typeof error === 'string') {
            message = error;
        } else if (error && typeof error === 'object') {
            message = error.message || error.error || JSON.stringify(error);
            details = { ...error };
        }

        // 根据错误消息推断错误码
        code = this._inferErrorCode(error, message, defaultCode);

        // 提取合约错误信息
        if (message.includes('user rejected') || message.includes('User denied')) {
            code = ErrorCodes.WALLET_REJECTED;
        } else if (message.includes('insufficient funds')) {
            code = ErrorCodes.WALLET_INSUFFICIENT_BALANCE;
        } else if (message.includes('nonce too low')) {
            code = ErrorCodes.CONTRACT_NONCE_ERROR;
        } else if (message.includes('execution reverted')) {
            code = ErrorCodes.CONTRACT_REVERTED;
            // 尝试提取 revert 原因
            const match = message.match(/reason=\"([^\"]+)\"/);
            if (match) {
                details.revertReason = match[1];
            }
        }

        return {
            code,
            message,
            originalError,
            details,
            context
        };
    }

    /**
     * 推断错误码
     * @private
     */
    _inferErrorCode(error, message, defaultCode) {
        // 网络错误
        if (message.includes('network') || message.includes('fetch') || 
            message.includes('ECONNREFUSED') || message.includes('ETIMEDOUT')) {
            return ErrorCodes.COMMON_NETWORK;
        }

        // 超时错误
        if (message.includes('timeout') || message.includes('exceeded')) {
            return ErrorCodes.COMMON_TIMEOUT;
        }

        // 钱包相关
        if (message.includes('wallet') || message.includes('MetaMask') || 
            message.includes('ethereum')) {
            if (message.includes('not installed')) {
                return ErrorCodes.WALLET_NOT_INSTALLED;
            }
            if (message.includes('not connected')) {
                return ErrorCodes.WALLET_NOT_CONNECTED;
            }
        }

        // 合约相关
        if (message.includes('contract') || message.includes('transaction')) {
            if (message.includes('revert')) {
                return ErrorCodes.CONTRACT_REVERTED;
            }
            if (message.includes('gas')) {
                return ErrorCodes.CONTRACT_GAS_ESTIMATION_FAILED;
            }
        }

        return defaultCode;
    }

    /**
     * 获取用户友好消息
     * @private
     */
    _getUserMessage(code) {
        return ErrorMessages[code] || ErrorMessages[ErrorCodes.COMMON_UNKNOWN];
    }

    /**
     * 记录错误到控制台
     * @private
     */
    _logError(error) {
        const { code, message, context, details } = error;
        
        console.group(`[ECHO Error] ${code}`);
        console.error('Message:', message);
        console.error('Context:', context);
        if (details.stack) {
            console.error('Stack:', details.stack);
        }
        console.groupEnd();
    }

    /**
     * 上报错误
     * @private
     */
    _reportError(error) {
        this.reportCount++;
        
        const report = {
            ...error,
            environment: this.options.environment,
            appVersion: this.options.appVersion,
            userId: this.options.userId,
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // 如果有上报端点，发送到服务器
        if (this.options.reportEndpoint) {
            this._sendReport(report);
        }

        // 同时存储到本地（用于离线时）
        this._storeReport(report);
    }

    /**
     * 发送错误报告
     * @private
     */
    async _sendReport(report) {
        try {
            const response = await fetch(this.options.reportEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.options.reportApiKey ? { 'X-API-Key': this.options.reportApiKey } : {})
                },
                body: JSON.stringify(report)
            });

            if (!response.ok) {
                throw new Error(`Report failed: ${response.status}`);
            }

            // 成功上报后，清除本地存储的已上报错误
            this._clearStoredReports();
        } catch (e) {
            // 上报失败，保留在本地存储
            console.warn('Error report failed:', e);
        }
    }

    /**
     * 存储错误报告到本地
     * @private
     */
    _storeReport(report) {
        try {
            const stored = JSON.parse(localStorage.getItem('echo_error_reports') || '[]');
            stored.push(report);
            
            // 只保留最近 50 条
            if (stored.length > 50) {
                stored.shift();
            }
            
            localStorage.setItem('echo_error_reports', JSON.stringify(stored));
        } catch (e) {
            // 忽略存储错误
        }
    }

    /**
     * 清除本地存储的报告
     * @private
     */
    _clearStoredReports() {
        try {
            localStorage.removeItem('echo_error_reports');
        } catch (e) {
            // 忽略
        }
    }

    /**
     * 生成请求ID
     * @private
     */
    _generateRequestId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 设置全局错误处理
     * @private
     */
    _setupGlobalHandlers() {
        if (typeof window !== 'undefined') {
            // 未捕获的 Promise 错误
            window.addEventListener('unhandledrejection', (event) => {
                this.handle(event.reason, ErrorCodes.COMMON_UNKNOWN, {
                    type: 'unhandledrejection'
                });
            });

            // 全局错误
            window.addEventListener('error', (event) => {
                this.handle(event.error || event.message, ErrorCodes.COMMON_UNKNOWN, {
                    type: 'error',
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                });
            });
        }
    }

    /**
     * 添加错误回调
     * @param {Function} callback - 回调函数
     */
    onError(callback) {
        this.errorCallbacks.push(callback);
    }

    /**
     * 移除错误回调
     * @param {Function} callback - 回调函数
     */
    offError(callback) {
        this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    }

    /**
     * 通知所有回调
     * @private
     */
    _notifyCallbacks(error) {
        this.errorCallbacks.forEach(callback => {
            try {
                callback(error);
            } catch (e) {
                console.error('Error callback failed:', e);
            }
        });
    }

    /**
     * 创建错误边界（用于 React/Vue 等框架）
     * @returns {Object} 错误边界对象
     */
    createErrorBoundary() {
        return {
            onError: (error, info) => {
                this.handle(error, ErrorCodes.COMMON_UNKNOWN, {
                    type: 'component_error',
                    componentStack: info?.componentStack
                });
            }
        };
    }

    /**
     * 获取所有错误码
     * @returns {Object} 错误码枚举
     */
    getErrorCodes() {
        return ErrorCodes;
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            reportCount: this.reportCount,
            maxReports: this.options.maxReportsPerSession,
            queueLength: this.reportQueue.length
        };
    }
}

/**
 * 创建标准化错误对象
 * @param {string} code - 错误码
 * @param {string} message - 错误消息
 * @param {Object} details - 详细信息
 * @returns {Object} 错误对象
 */
function createError(code, message = '', details = {}) {
    const userMessage = ErrorMessages[code] || ErrorMessages[ErrorCodes.COMMON_UNKNOWN];
    
    return {
        code,
        message: message || userMessage.message,
        ...userMessage,
        details,
        timestamp: Date.now()
    };
}

/**
 * 检查是否是特定类型的错误
 * @param {Object} error - 错误对象
 * @param {string} code - 错误码
 * @returns {boolean} 是否匹配
 */
function isErrorOfType(error, code) {
    return error?.code === code;
}

/**
 * 检查是否是钱包相关错误
 * @param {Object} error - 错误对象
 * @returns {boolean} 是否是钱包错误
 */
function isWalletError(error) {
    return error?.code?.startsWith('WALLET_');
}

/**
 * 检查是否是合约相关错误
 * @param {Object} error - 错误对象
 * @returns {boolean} 是否是合约错误
 */
function isContractError(error) {
    return error?.code?.startsWith('CONTRACT_');
}

/**
 * 检查是否是可重试错误
 * @param {Object} error - 错误对象
 * @returns {boolean} 是否可重试
 */
function isRetryableError(error) {
    const retryableCodes = [
        ErrorCodes.COMMON_NETWORK,
        ErrorCodes.COMMON_TIMEOUT,
        ErrorCodes.COMMON_SERVER_ERROR,
        ErrorCodes.CONTRACT_GAS_ESTIMATION_FAILED,
        ErrorCodes.CONTRACT_NONCE_ERROR,
        ErrorCodes.API_FETCH_FAILED
    ];
    
    return retryableCodes.includes(error?.code);
}

// 导出
export default ErrorHandler;
export {
    ErrorHandler,
    ErrorCodes,
    ErrorMessages,
    ErrorSeverity,
    createError,
    isErrorOfType,
    isWalletError,
    isContractError,
    isRetryableError
};

// 全局兼容
if (typeof window !== 'undefined') {
    window.ErrorHandler = ErrorHandler;
    window.ErrorCodes = ErrorCodes;
}
