/**
 * ECHO 资产编码系统 v2.2
 * 双层生命结构：先天基因 + 后天演化
 * 更新：128bit 基因码架构（v0.3 预备）
 * 
 * 基因码结构：
 * - 权力基因(12bit) + 唯一标识(116bit随机) = 128bit 总长度
 * - 权力基因：(用<<9) | (扩<<6) | (衍<<3) | 益
 * - 唯一标识：116bit 随机数 (防止碰撞)
 */

// ==================== 配置 ====================

// 四权力配置：3位 = 8档
const CONFIG = {
  yong: {
    0: { code: '000', name: '禁', desc: '封存' },
    1: { code: '001', name: '锁', desc: '私藏' },
    2: { code: '010', name: '借', desc: '期借' },
    3: { code: '011', name: '阅', desc: '只读' },
    4: { code: '100', name: '采', desc: '采样' },
    5: { code: '101', name: '用', desc: '按需' },
    6: { code: '110', name: '持', desc: '持有' },
    7: { code: '111', name: '归', desc: '归属' }
  },
  kuo: {
    0: { code: '000', name: '独', desc: '自闭' },
    1: { code: '001', name: '友', desc: '好友' },
    2: { code: '010', name: '圈', desc: '小圈' },
    3: { code: '011', name: '域', desc: '领域' },
    4: { code: '100', name: '网', desc: '网络' },
    5: { code: '101', name: '链', desc: '跨链' },
    6: { code: '110', name: '元', desc: '元界' },
    7: { code: '111', name: '道', desc: '无界' }
  },
  yan: {
    0: { code: '000', name: '止', desc: '禁止' },
    1: { code: '001', name: '赏', desc: '欣赏' },
    2: { code: '010', name: '评', desc: '评论' },
    3: { code: '011', name: '引', desc: '引用' },
    4: { code: '100', name: '混', desc: '混剪' },
    5: { code: '101', name: '融', desc: '融合' },
    6: { code: '110', name: '造', desc: '创造' },
    7: { code: '111', name: '生', desc: '化生' }
  },
  yi: {
    0: { code: '000', name: '藏', desc: '封存' },
    1: { code: '001', name: '孤', desc: '独一' },
    2: { code: '010', name: '稀', desc: '稀少' },
    3: { code: '011', name: '罕', desc: '罕见' },
    4: { code: '100', name: '流', desc: '流通' },
    5: { code: '101', name: '众', desc: '大众' },
    6: { code: '110', name: '源', desc: '开源' },
    7: { code: '111', name: '道', desc: '归道' }
  }
};

// 先天八卦（按传统数序：1乾、2兑、3离、4震、5巽、6坎、7艮、8坤）
// 编程索引：0坤、1艮、2坎、3巽、4震、5离、6兑、7乾
const TRIGRAMS = ['坤', '艮', '坎', '巽', '震', '离', '兑', '乾'];
const TRIGRAM_SYMBOLS = ['☷', '☶', '☵', '☴', '☳', '☲', '☱', '☰'];

// 先天八卦爻画（从下往上：初爻、二爻、三爻）
// 1=阳爻，0=阴爻
const TRIGRAM_LINES = {
  0: [0, 0, 0],  // 坤 ☷ 阴阴阴
  1: [1, 0, 0],  // 艮 ☶ 阳阴阴
  2: [0, 1, 0],  // 坎 ☵ 阴阳阴
  3: [1, 1, 0],  // 巽 ☴ 阳阳阴
  4: [0, 0, 1],  // 震 ☳ 阴阴阳
  5: [1, 0, 1],  // 离 ☲ 阳阴阳
  6: [0, 1, 1],  // 兑 ☱ 阴阳阳
  7: [1, 1, 1]   // 乾 ☰ 阳阳阳
};

// 从爻画反查卦索引
const LINES_TO_TRIGRAM = {
  '0,0,0': 0, '1,0,0': 1, '0,1,0': 2, '1,1,0': 3,
  '0,0,1': 4, '1,0,1': 5, '0,1,1': 6, '1,1,1': 7
};

// 64卦（先天八卦序：上卦为高位，下卦为低位）
// TRIGRAMS = ['坤', '艮', '坎', '巽', '震', '离', '兑', '乾']
// hexIndex = upper * 8 + lower，其中 upper/lower 为 0-7
const HEXAGRAMS = [
  // 上卦=坤(0)
  '坤为地', '地山谦', '地水师', '地风升', '地雷复', '地火明夷', '地泽临', '地天泰',
  // 上卦=艮(1)
  '山坤剥', '艮为山', '山水蒙', '山风蛊', '山雷颐', '山火贲', '山泽损', '山天大畜',
  // 上卦=坎(2)
  '水坤比', '水山蹇', '坎为水', '水风井', '水雷屯', '水火既济', '水泽节', '水天需',
  // 上卦=巽(3)
  '风坤观', '风山渐', '风水涣', '巽为风', '风雷益', '风火家人', '风泽中孚', '风天小畜',
  // 上卦=震(4)
  '雷坤豫', '雷山小过', '雷水解', '雷风恒', '震为雷', '雷火丰', '雷泽归妹', '雷天大壮',
  // 上卦=离(5)
  '火坤晋', '火山旅', '火水未济', '火风鼎', '火雷噬嗑', '离为火', '火泽睽', '火天大有',
  // 上卦=兑(6)
  '泽坤萃', '泽山咸', '泽水困', '泽风大过', '泽雷随', '泽火革', '兑为泽', '泽天夬',
  // 上卦=乾(7)
  '天坤否', '天山遁', '天水讼', '天风姤', '天雷无妄', '天火同人', '天泽履', '乾为天'
];

// 诗意文案（易经原文风格）
const POETRY = {
  qi: {
    high:   ['龙德而隐者', '乘云气而御飞龙', '与时偕行', '云行雨施'],
    medium: ['君子以厚德载物', '含章可贞', '直方大', '见龙在田'],
    low:    ['潜龙勿用', '履霜坚冰至', '括囊无咎', '屯如邅如'],
    dormant:['归藏', '蛰', '待时', '守一']
  },
  change: {
    fast:   '亟变',
    normal: '渐变',
    slow:   '定静'
  }
};

// 变势配置（可自定义：6/8/9/12/24）
const BIAN_SHI_CONFIG = {
  default: 9,        // 默认9变势（九爻）
  options: {
    6: { name: '快板', desc: 'Allegro - 短促敏锐' },
    8: { name: '中板', desc: 'Moderato - 平衡流动' },
    9: { name: '九爻', desc: '潜龙勿用 → 飞龙在天 → 用九' },
    12: { name: '慢板', desc: 'Adagio - 绵长深沉' },
    24: { name: '广板', desc: 'Largo - 缓慢庄重' }
  },
  decay: 3,          // 3天无活动减1
  threshold: 0.7     // 指标达标概率阈值
};

// ==================== 核心算法 ====================

/**
 * 编码：四权力 → 基因码 → 卦象
 * 
 * 梅花易数起卦法：
 * - 上卦 = 用 mod 8          (天道)
 * - 下卦 = 扩 mod 8          (地道)
 * - 动爻 = (衍 + 益) mod 6   (人道，哪一爻变，1-6)
 * - 卦序 = 上卦 × 8 + 下卦 + 1 (1-64)
 * - 变卦 = 根据动爻改变对应阴阳爻
 */
function encodeAsset(yong, kuo, yan, yi) {
  if (![yong, kuo, yan, yi].every(v => v >= 0 && v <= 7)) {
    throw new Error('参数必须在 0-7 之间');
  }

  const geneCode = (yong << 9) | (kuo << 6) | (yan << 3) | yi;
  
  // 梅花易数起卦
  const upperIdx = yong % 8;           // 上卦：天道 (用)
  const lowerIdx = kuo % 8;            // 下卦：地道 (扩)
  const changingLine = ((yan + yi) % 6) + 1;  // 动爻：人道 (衍+益)，1-6
  
  const hexIndex = upperIdx * 8 + lowerIdx;
  
  // 计算变卦
  const changedHexagram = calculateChangedHexagramMeihua(upperIdx, lowerIdx, changingLine);
  
  return {
    geneCode,
    geneCodeBinary: geneCode.toString(2).padStart(12, '0'),
    params: {
      yong: CONFIG.yong[yong],
      kuo: CONFIG.kuo[kuo],
      yan: CONFIG.yan[yan],
      yi: CONFIG.yi[yi]
    },
    trigrams: {
      upper: { name: TRIGRAMS[upperIdx], symbol: TRIGRAM_SYMBOLS[upperIdx], index: upperIdx },
      lower: { name: TRIGRAMS[lowerIdx], symbol: TRIGRAM_SYMBOLS[lowerIdx], index: lowerIdx }
    },
    hexagram: {
      name: HEXAGRAMS[hexIndex],
      index: hexIndex + 1,  // 1-64
      upperIdx,
      lowerIdx
    },
    changingLine: changingLine,  // 动爻 1-6
    changedHexagram: changedHexagram  // 变卦信息
  };
}

// ==================== 128bit 基因码架构 (v0.3) ====================

/**
 * 生成116bit随机唯一标识符
 * 使用加密安全的随机数生成（Node.js和浏览器环境兼容）
 * @returns {BigInt} 116bit随机数
 */
function generateUniqueId116() {
  // 116bit = 14.5字节，我们需要生成15字节然后取高116bit
  const bytes = new Uint8Array(15);
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    // 浏览器环境
    crypto.getRandomValues(bytes);
  } else if (typeof require !== 'undefined') {
    // Node.js环境
    const nodeCrypto = require('crypto');
    nodeCrypto.randomFillSync(bytes);
  } else {
    // 降级方案：使用Math.random（不推荐用于生产环境）
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  
  // 取高116bit（清空第一个字节的高4bit）
  bytes[0] = bytes[0] & 0x0F;
  
  // 转换为BigInt
  let result = BigInt(0);
  for (let i = 0; i < bytes.length; i++) {
    result = (result << BigInt(8)) | BigInt(bytes[i]);
  }
  
  return result;
}

/**
 * 编码：四权力 → 128bit完整基因码
 * 
 * 结构：
 * - 高12bit: 权力基因 (用<<9) | (扩<<6) | (衍<<3) | 益
 * - 低116bit: 随机唯一标识符
 * 
 * 总长度：128bit，碰撞概率极低（约2^-116）
 * 
 * @param {number} yong - 用 (0-7)
 * @param {number} kuo - 扩 (0-7)
 * @param {number} yan - 衍 (0-7)
 * @param {number} yi - 益 (0-7)
 * @param {BigInt|string} uniqueId - 可选的116bit唯一标识符（自动生成如果未提供）
 * @returns {Object} 包含128bit完整基因码和相关信息
 */
function encodeAssetFull(yong, kuo, yan, yi, uniqueId = null) {
  if (![yong, kuo, yan, yi].every(v => v >= 0 && v <= 7)) {
    throw new Error('参数必须在 0-7 之间');
  }

  // 生成12bit权力基因
  const powerGene = (yong << 9) | (kuo << 6) | (yan << 3) | yi;
  
  // 生成或验证116bit唯一标识符
  let uid;
  if (uniqueId === null) {
    uid = generateUniqueId116();
  } else {
    uid = BigInt.asUintN(116, BigInt(uniqueId));
  }
  
  // 组合128bit基因码：高12bit是权力基因，低116bit是唯一标识
  // 权力基因左移116位
  const fullGeneCode = (BigInt(powerGene) << BigInt(116)) | uid;
  
  // 卦象计算（仍使用12bit权力基因，确保向后兼容）
  const upperIdx = yong % 8;
  const lowerIdx = kuo % 8;
  const changingLine = ((yan + yi) % 6) + 1;
  const hexIndex = upperIdx * 8 + lowerIdx;
  const changedHexagram = calculateChangedHexagramMeihua(upperIdx, lowerIdx, changingLine);
  
  return {
    // 128bit完整基因码
    fullGeneCode,
    fullGeneCodeHex: '0x' + fullGeneCode.toString(16).padStart(32, '0'),
    fullGeneCodeBinary: fullGeneCode.toString(2).padStart(128, '0'),
    
    // 组成部分
    powerGene,
    powerGeneBinary: powerGene.toString(2).padStart(12, '0'),
    uniqueId: uid,
    uniqueIdHex: '0x' + uid.toString(16).padStart(29, '0'),
    uniqueIdBinary: uid.toString(2).padStart(116, '0'),
    
    // 四权力参数
    params: {
      yong: CONFIG.yong[yong],
      kuo: CONFIG.kuo[kuo],
      yan: CONFIG.yan[yan],
      yi: CONFIG.yi[yi]
    },
    
    // 卦象（基于12bit权力基因）
    trigrams: {
      upper: { name: TRIGRAMS[upperIdx], symbol: TRIGRAM_SYMBOLS[upperIdx], index: upperIdx },
      lower: { name: TRIGRAMS[lowerIdx], symbol: TRIGRAM_SYMBOLS[lowerIdx], index: lowerIdx }
    },
    hexagram: {
      name: HEXAGRAMS[hexIndex],
      index: hexIndex + 1,  // 1-64
      upperIdx,
      lowerIdx
    },
    changingLine: changingLine,
    changedHexagram: changedHexagram,
    
    // 元数据
    version: 'v0.3-128bit',
    bitLength: 128
  };
}

/**
 * 从128bit完整基因码解析
 * @param {BigInt|string} fullGeneCode - 128bit基因码
 * @returns {Object} 解析后的组成部分
 */
function parseFullGeneCode(fullGeneCode) {
  const fullCode = BigInt.asUintN(128, BigInt(fullGeneCode));
  
  // 提取高12bit权力基因
  const powerGene = Number(fullCode >> BigInt(116));
  
  // 提取低116bit唯一标识
  const uniqueIdMask = (BigInt(1) << BigInt(116)) - BigInt(1);
  const uniqueId = fullCode & uniqueIdMask;
  
  // 解析四权力
  const yong = (powerGene >> 9) & 0x7;
  const kuo = (powerGene >> 6) & 0x7;
  const yan = (powerGene >> 3) & 0x7;
  const yi = powerGene & 0x7;
  
  // 卦象计算
  const upperIdx = yong % 8;
  const lowerIdx = kuo % 8;
  const changingLine = ((yan + yi) % 6) + 1;
  const hexIndex = upperIdx * 8 + lowerIdx;
  const changedHexagram = calculateChangedHexagramMeihua(upperIdx, lowerIdx, changingLine);
  
  return {
    fullGeneCode: fullCode,
    powerGene,
    uniqueId,
    params: {
      yong: CONFIG.yong[yong],
      kuo: CONFIG.kuo[kuo],
      yan: CONFIG.yan[yan],
      yi: CONFIG.yi[yi]
    },
    trigrams: {
      upper: { name: TRIGRAMS[upperIdx], symbol: TRIGRAM_SYMBOLS[upperIdx], index: upperIdx },
      lower: { name: TRIGRAMS[lowerIdx], symbol: TRIGRAM_SYMBOLS[lowerIdx], index: lowerIdx }
    },
    hexagram: {
      name: HEXAGRAMS[hexIndex],
      index: hexIndex + 1,
      upperIdx,
      lowerIdx
    },
    changingLine: changingLine,
    changedHexagram: changedHexagram
  };
}

/**
 * 计算碰撞概率
 * @param {number} n - 资产数量
 * @param {number} bits - 基因码位数（默认116bit唯一标识部分）
 * @returns {Object} 碰撞概率信息
 */
function calculateCollisionProbability(n, bits = 116) {
  // 使用近似公式：p ≈ n² / (2 * 2^bits)
  const space = BigInt(1) << BigInt(bits);
  const nBig = BigInt(n);
  const nSquared = nBig * nBig;
  const denominator = BigInt(2) * space;
  
  // 将概率转换为可读的浮点数
  const probability = Number(nSquared) / Number(denominator);
  const percentage = probability * 100;
  
  return {
    assetCount: n,
    bitLength: bits,
    totalSpace: space.toString(),
    probability,
    percentage,
    safeFor: probability < 0.001 ? '安全使用' : 
             probability < 0.01 ? '可接受' : 
             probability < 0.5 ? '需谨慎' : '高风险'
  };
}
function calculateQi(geneCode, timestamp) {
  // 混沌参数：3.99 接近混沌临界值 4.0
  const r = 3.99;

  // 初始值：由基因码决定（0-1之间），确保不同资产有不同的混沌起点
  let x = (geneCode % 9973) / 9973; // 使用质数增加分布均匀性
  if (x === 0) x = 0.618; // 避免0点（不动点），用黄金比例作为备用

  // 迭代次数：基于时间戳变化，使气数随时间自然流转
  // 每天不同时间，同一资产的气数也不同
  const iterations = 50 + (timestamp % 50);

  // 混沌迭代：微小的初始差异会导致巨大的结果差异（蝴蝶效应）
  for (let i = 0; i < iterations; i++) {
    x = r * x * (1 - x);
  }

  return x; // 0-1 之间
}

/**
 * 获取气数诗意描述
 */
function getQiDescription(qi) {
  if (qi > 0.8) return { level: 'high', word: randomPick(POETRY.qi.high), color: '#c45c48' };
  if (qi > 0.5) return { level: 'medium', word: randomPick(POETRY.qi.medium), color: '#7d8a6e' };
  if (qi > 0.2) return { level: 'low', word: randomPick(POETRY.qi.low), color: '#8b7355' };
  return { level: 'dormant', word: randomPick(POETRY.qi.dormant), color: '#5a5a5a' };
}

function randomPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * 变势系统（可配置节拍）
 * 
 * 机制：
 * - 指标达标 → 积累变势 (+1)
 * - 满max点 → 触发变爻 → 清空重置
 * - 3天无活动 → 变势衰减 (-1)
 * 
 * 节拍选择：
 * - 6 = 快板 (Allegro) - 适合热点内容
 * - 8 = 中板 (Moderato) - 默认，平衡流动
 * - 12 = 慢板 (Adagio) - 适合艺术作品
 * - 24 = 广板 (Largo) - 适合传世资产
 */
class BianShiSystem {
  constructor(max = BIAN_SHI_CONFIG.default) {
    this.max = max;        // 变势上限（可自定义）
    this.bianShi = 0;      // 当前变势
    this.lastActivity = Date.now();
    this.changingLines = []; // 已触发的变爻
  }

  /**
   * 检查指标并积累变势
   * @param {Object} indicators - 六指标数据
   * @param {number} qi - 气数
   * @returns {Object} 变爻状态
   */
  checkIndicators(indicators, qi) {
    const now = Date.now();
    const daysSinceLast = (now - this.lastActivity) / (1000 * 60 * 60 * 24);
    
    // 衰减检查
    if (daysSinceLast > BIAN_SHI_CONFIG.decay) {
      this.bianShi = Math.max(0, this.bianShi - Math.floor(daysSinceLast / BIAN_SHI_CONFIG.decay));
    }
    
    // 检查各指标
    const triggered = [];
    const indicatorsList = [
      { name: '使用频次', value: indicators.usageCount || 0, threshold: 100 },
      { name: '连接广度', value: indicators.platformCount || 0, threshold: 5 },
      { name: '衍生数量', value: indicators.derivativeCount || 0, threshold: 10 },
      { name: '交易活跃度', value: indicators.tradeVolume || 0, threshold: 1000 },
      { name: '社区参与', value: indicators.communityScore || 0, threshold: 50 },
      { name: '创作者活跃', value: indicators.creatorActivity || 0, threshold: 20 }
    ];
    
    indicatorsList.forEach((ind, idx) => {
      const probability = (ind.value / ind.threshold) * qi;
      if (probability > BIAN_SHI_CONFIG.threshold && !this.changingLines.includes(6 - idx)) {
        this.bianShi++;
        triggered.push({
          line: 6 - idx,  // 从初爻到上爻：1-6
          name: ind.name,
          intensity: probability
        });
      }
    });
    
    this.lastActivity = now;
    
    // 检查是否满触发
    const shouldTrigger = this.bianShi >= this.max;
    if (shouldTrigger) {
      this.changingLines = triggered.map(t => t.line);
      this.bianShi = 0;  // 清空重置
    }
    
    return {
      bianShi: this.bianShi,
      max: this.max,
      tempo: BIAN_SHI_CONFIG.options[this.max],
      triggered: shouldTrigger,
      changingLines: shouldTrigger ? this.changingLines : [],
      pendingLines: triggered,
      changeSpeed: this.changingLines.length > 2 ? 'fast' : this.changingLines.length > 0 ? 'normal' : 'slow'
    };
  }

  reset() {
    this.bianShi = 0;
    this.changingLines = [];
    this.lastActivity = Date.now();
  }

  /**
   * 重新设定节拍
   * @param {number} newMax - 新节拍 (6/8/12/24)
   * @returns {boolean} 是否设置成功
   */
  setTempo(newMax) {
    if (BIAN_SHI_CONFIG.options[newMax]) {
      this.max = newMax;
      this.bianShi = Math.min(this.bianShi, this.max);
      return true;
    }
    return false;
  }

  /**
   * 获取当前节拍信息
   */
  getTempoInfo() {
    return {
      current: this.max,
      ...BIAN_SHI_CONFIG.options[this.max]
    };
  }
}

/**
 * 梅花易数变卦计算
 * 
 * 动爻规则：
 * - 动爻 1-6 对应初爻到上爻
 * - 阳爻变阴，阴爻变阳
 * - 变卦代表事物发展的趋势
 * 
 * @param {number} upperIdx - 上卦索引 (0-7)
 * @param {number} lowerIdx - 下卦索引 (0-7)
 * @param {number} changingLine - 动爻 (1-6, 1为初爻，6为上爻)
 * @returns {Object} 变卦信息
 */
function calculateChangedHexagramMeihua(upperIdx, lowerIdx, changingLine) {
  // 获取上下卦的爻画
  const upperLines = [...TRIGRAM_LINES[upperIdx]];  // 四、五、上爻
  const lowerLines = [...TRIGRAM_LINES[lowerIdx]];  // 初、二、三爻
  
  // 确定哪一爻变（1=初爻，2=二爻，3=三爻，4=四爻，5=五爻，6=上爻）
  // 下卦：初(1)、二(2)、三(3)
  // 上卦：四(4)、五(5)、上(6)
  const linePosition = changingLine;
  
  // 变爻
  if (linePosition <= 3) {
    // 变下卦的爻 (初、二、三)
    const idx = linePosition - 1;  // 0-2
    lowerLines[idx] = lowerLines[idx] === 1 ? 0 : 1;
  } else {
    // 变上卦的爻 (四、五、六)
    const idx = linePosition - 4;  // 0-2
    upperLines[idx] = upperLines[idx] === 1 ? 0 : 1;
  }
  
  // 计算变卦后的卦索引
  const newUpperIdx = LINES_TO_TRIGRAM[upperLines.join(',')];
  const newLowerIdx = LINES_TO_TRIGRAM[lowerLines.join(',')];
  const changedHexIndex = newUpperIdx * 8 + newLowerIdx;
  
  // 获取爻名
  const lineNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];
  const changedLineName = lineNames[linePosition - 1];
  
  // 判断阴阳变化
  let originalYinYang, changedYinYang;
  if (linePosition <= 3) {
    originalYinYang = lowerLines[linePosition - 1] === 1 ? '阳' : '阴';
    changedYinYang = TRIGRAM_LINES[lowerIdx][linePosition - 1] === 1 ? '阳变阴' : '阴变阳';
  } else {
    originalYinYang = upperLines[linePosition - 4] === 1 ? '阳' : '阴';
    changedYinYang = TRIGRAM_LINES[upperIdx][linePosition - 4] === 1 ? '阳变阴' : '阴变阳';
  }
  
  return {
    changingLine: changingLine,        // 动爻 1-6
    changingLineName: changedLineName, // 爻位名称
    changeType: changedYinYang,        // 阴阳变化
    original: {
      upper: { name: TRIGRAMS[upperIdx], symbol: TRIGRAM_SYMBOLS[upperIdx], index: upperIdx },
      lower: { name: TRIGRAMS[lowerIdx], symbol: TRIGRAM_SYMBOLS[lowerIdx], index: lowerIdx },
      hexagram: HEXAGRAMS[upperIdx * 8 + lowerIdx]
    },
    changed: {
      upper: { name: TRIGRAMS[newUpperIdx], symbol: TRIGRAM_SYMBOLS[newUpperIdx], index: newUpperIdx },
      lower: { name: TRIGRAMS[newLowerIdx], symbol: TRIGRAM_SYMBOLS[newLowerIdx], index: newLowerIdx },
      hexagram: HEXAGRAMS[changedHexIndex],
      index: changedHexIndex + 1  // 1-64
    }
  };
}

/**
 * 生成诗意层文案
 */
function generatePoeticView(assetData, qiData, bianShiData) {
  const hexName = assetData.hexagram.name.slice(0, 2);
  const upper = assetData.trigrams.upper.name;
  const lower = assetData.trigrams.lower.name;
  
  // 生成关系词
  const relationWords = {
    '乾乾': '健', '坤坤': '顺', '坎离': '济', '离坎': '交',
    '震艮': '止', '巽兑': '悦', '巽离': '明', '离巽': '柔',
    '乾坤': '交', '坤乾': '泰'
  };
  const relation = relationWords[upper + lower] || '育';
  
  // 生成描述
  const p = assetData.params;
  const templates = {
    high: `此器${p.yong.name}而${p.kuo.name}，${p.yan.name}化${p.yi.name}，${qiData.word}。`,
    medium: `此器${p.yong.name}于${p.kuo.name}，${p.yan.name}以${p.yi.name}，${qiData.word}。`,
    low: `此器${p.yong.name}若${p.kuo.name}，${p.yan.name}待${p.yi.name}，${qiData.word}。`,
    dormant: `此器${p.yong.name}归${p.kuo.name}，${p.yan.name}藏${p.yi.name}，${qiData.word}。`
  };
  
  return {
    title: hexName,
    subtitle: `${upper}${lower}${relation}之象`,
    qiPhrase: qiData.word,
    changePhrase: bianShiData.transition,
    bianShiStatus: `变势 ${bianShiData.bianShi}/${bianShiData.max}`,
    description: templates[qiData.level],
    color: qiData.color
  };
}

// ==================== 导出 ====================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // 向后兼容：12bit编码（v2.x）
    encodeAsset,
    // 128bit完整编码（v0.3）
    encodeAssetFull,
    parseFullGeneCode,
    generateUniqueId116,
    calculateCollisionProbability,
    // 其他功能
    calculateQi,
    getQiDescription,
    BianShiSystem,
    calculateChangedHexagramMeihua,
    generatePoeticView,
    CONFIG,
    TRIGRAMS,
    TRIGRAM_SYMBOLS,
    TRIGRAM_LINES,
    LINES_TO_TRIGRAM,
    HEXAGRAMS,
    POETRY,
    BIAN_SHI_CONFIG
  };
}

if (typeof window !== 'undefined') {
  window.EchoEncoder = {
    // 向后兼容：12bit编码（v2.x）
    encodeAsset,
    // 128bit完整编码（v0.3）
    encodeAssetFull,
    parseFullGeneCode,
    generateUniqueId116,
    calculateCollisionProbability,
    // 其他功能
    calculateQi,
    getQiDescription,
    BianShiSystem,
    calculateChangedHexagramMeihua,
    generatePoeticView,
    CONFIG,
    TRIGRAMS,
    TRIGRAM_SYMBOLS,
    TRIGRAM_LINES,
    LINES_TO_TRIGRAM,
    HEXAGRAMS,
    POETRY,
    BIAN_SHI_CONFIG
  };
}

