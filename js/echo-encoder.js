/**
 * ECHO 资产编码系统 v2.1
 * 双层生命结构：先天基因 + 后天演化
 * 更新：12变势机制 + 诗意文案
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

// 八卦：乾(天)、兑(泽)、离(火)、震(雷)、巽(风)、坎(水)、艮(山)、坤(地)
const TRIGRAMS = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];
const TRIGRAM_SYMBOLS = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

// 64卦（先天八卦序：上卦为高位，下卦为低位）
// TRIGRAMS = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤']
// hexIndex = upper * 8 + lower，其中 upper/lower 为 0-7
const HEXAGRAMS = [
  // 上卦=乾(0)
  '乾为天', '天泽履', '天火同人', '天雷无妄', '天风姤', '天水讼', '天山遁', '天地否',
  // 上卦=兑(1)
  '泽天夬', '兑为泽', '泽火革', '泽雷随', '泽风大过', '泽水困', '泽山咸', '泽地萃',
  // 上卦=离(2)
  '火天大有', '火泽睽', '离为火', '火雷噬嗑', '火风鼎', '火水未济', '火山旅', '火地晋',
  // 上卦=震(3)
  '雷天大壮', '雷泽归妹', '雷火丰', '震为雷', '雷风恒', '雷水解', '雷山小过', '雷地豫',
  // 上卦=巽(4)
  '风天小畜', '风泽中孚', '风火家人', '风雷益', '巽为风', '风水涣', '风山渐', '风地观',
  // 上卦=坎(5)
  '水天需', '水泽节', '水火既济', '水雷屯', '水风井', '坎为水', '水山蹇', '水地比',
  // 上卦=艮(6)
  '山天大畜', '山泽损', '山火贲', '山雷颐', '山风蛊', '山水蒙', '艮为山', '山地剥',
  // 上卦=坤(7)
  '地天泰', '地泽临', '地火明夷', '地雷复', '地风升', '地水师', '地山谦', '坤为地'
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

// 12变势配置
const BIAN_SHI_CONFIG = {
  max: 12,           // 满12触发变爻
  decay: 3,          // 3天无活动减1
  threshold: 0.7     // 指标达标概率阈值
};

// ==================== 核心算法 ====================

/**
 * 编码：四权力 → 基因码 → 卦象
 * 
 * 卦象计算：
 * - 上卦 = (永 + 阔) mod 8  → 天道：创造与传播的合力
 * - 下卦 = (延 + 益) mod 8  → 地道：生长与回归的循环
 * - 卦序 = 上卦 × 8 + 下卦 + 1 (1-64)
 */
function encodeAsset(yong, kuo, yan, yi) {
  if (![yong, kuo, yan, yi].every(v => v >= 0 && v <= 7)) {
    throw new Error('参数必须在 0-7 之间');
  }

  const geneCode = (yong << 9) | (kuo << 6) | (yan << 3) | yi;
  
  // 卦象计算
  const upperIdx = (yong + kuo) % 8;
  const lowerIdx = (yan + yi) % 8;
  const hexIndex = upperIdx * 8 + lowerIdx;
  
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
    }
  };
}

/**
 * 气数计算：混沌但可重现
 * 使用黄金比例产生伪随机但确定的结果
 */
function calculateQi(geneCode, timestamp) {
  const PHI = 1.618033988749;
  const seed = geneCode * timestamp * PHI;
  return Math.abs(Math.sin(seed));
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
 * 12变势系统
 * 
 * 机制：
 * - 指标达标 → 积累变势 (+1)
 * - 满12点 → 触发变爻 → 清空重置
 * - 3天无活动 → 变势衰减 (-1)
 */
class BianShiSystem {
  constructor() {
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
    
    // 检查是否满12触发
    const shouldTrigger = this.bianShi >= BIAN_SHI_CONFIG.max;
    if (shouldTrigger) {
      this.changingLines = triggered.map(t => t.line);
      this.bianShi = 0;  // 清空重置
    }
    
    return {
      bianShi: this.bianShi,
      max: BIAN_SHI_CONFIG.max,
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
}

/**
 * 计算之卦（变卦）
 * 
 * 变爻规则：阳变阴，阴变阳
 * 简化实现：根据变爻数量和强度计算偏移
 */
function calculateChangedHexagram(mainHexIndex, changingLines) {
  if (!changingLines || changingLines.length === 0) {
    return {
      original: mainHexIndex,
      changed: mainHexIndex,
      transition: '定静'
    };
  }
  
  // 根据变爻计算偏移（简化算法）
  const changePower = changingLines.length;
  const offset = changePower * 7 % 64;  // 偏移量
  const changedIndex = (mainHexIndex - 1 + offset) % 64;
  
  return {
    original: mainHexIndex,
    changed: changedIndex + 1,
    changedHexagram: HEXAGRAMS[changedIndex],
    changingLines: changingLines.length,
    transition: changingLines.length >= 3 ? '亟变' : changingLines.length >= 1 ? '渐变' : '定静'
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
    encodeAsset,
    calculateQi,
    getQiDescription,
    BianShiSystem,
    calculateChangedHexagram,
    generatePoeticView,
    CONFIG,
    TRIGRAMS,
    TRIGRAM_SYMBOLS,
    HEXAGRAMS,
    POETRY,
    BIAN_SHI_CONFIG
  };
}

if (typeof window !== 'undefined') {
  window.EchoEncoder = {
    encodeAsset,
    calculateQi,
    getQiDescription,
    BianShiSystem,
    calculateChangedHexagram,
    generatePoeticView,
    CONFIG,
    TRIGRAMS,
    TRIGRAM_SYMBOLS,
    HEXAGRAMS,
    POETRY,
    BIAN_SHI_CONFIG
  };
}

// ES Module 导出
export {
  encodeAsset,
  calculateQi,
  getQiDescription,
  BianShiSystem,
  calculateChangedHexagram,
  generatePoeticView,
  CONFIG,
  TRIGRAMS,
  TRIGRAM_SYMBOLS,
  HEXAGRAMS,
  POETRY,
  BIAN_SHI_CONFIG
};
