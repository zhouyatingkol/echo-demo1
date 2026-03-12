/**
 * Music Recommendation Engine
 * 
 * 基于音乐元数据的相似度推荐算法
 * 支持风格、BPM、情绪、调性等多维度匹配
 */

class RecommendationEngine {
  constructor() {
    // 权重配置
    this.weights = {
      genre: 40,    // 风格匹配权重
      bpm: 30,      // BPM 接近度权重
      mood: 20,     // 情绪匹配权重
      key: 10       // 调性匹配权重
    };
  }

  /**
   * 计算两个音乐的相似度 (0-100)
   * @param {Object} musicA - 第一首音乐
   * @param {Object} musicB - 第二首音乐
   * @returns {number} 相似度分数 (0-100)
   */
  calculateSimilarity(musicA, musicB) {
    // 如果是同一首，相似度 0 (不推荐自己)
    if (musicA.tokenId === musicB.tokenId) return 0;
    
    let score = 0;
    let weights = 0;
    
    // 1. 风格匹配 (权重 40%)
    if (musicA.genre && musicB.genre) {
      if (musicA.genre === musicB.genre) {
        score += this.weights.genre;
      }
      weights += this.weights.genre;
    }
    
    // 2. BPM 接近度 (权重 30%)
    if (musicA.bpm && musicB.bpm) {
      const bpmDiff = Math.abs(musicA.bpm - musicB.bpm);
      // BPM 差值越小得分越高，最大差值 60
      const bpmScore = Math.max(0, this.weights.bpm - (bpmDiff / 2));
      score += bpmScore;
      weights += this.weights.bpm;
    }
    
    // 3. 情绪匹配 (权重 20%)
    if (musicA.mood && musicB.mood) {
      if (musicA.mood === musicB.mood) {
        score += this.weights.mood;
      }
      weights += this.weights.mood;
    }
    
    // 4. 调性匹配 (权重 10%)
    if (musicA.key && musicB.key) {
      if (musicA.key === musicB.key) {
        score += this.weights.key;
      }
      weights += this.weights.key;
    }
    
    // 归一化到 0-100
    return weights > 0 ? Math.round((score / weights) * 100) : 0;
  }

  /**
   * 为目标音乐找到最相似的 N 首
   * @param {Object} targetMusic - 目标音乐
   * @param {Array} allMusic - 所有音乐列表
   * @param {number} count - 返回数量 (默认 5)
   * @returns {Array} 相似音乐列表，包含 similarity 字段
   */
  findSimilar(targetMusic, allMusic, count = 5) {
    // 计算与所有音乐的相似度
    const similarities = allMusic.map(music => ({
      music: music,
      score: this.calculateSimilarity(targetMusic, music)
    }));
    
    // 按相似度排序
    similarities.sort((a, b) => b.score - a.score);
    
    // 返回前 N 个（相似度 > 0）
    return similarities
      .filter(item => item.score > 0)
      .slice(0, count)
      .map(item => ({ ...item.music, similarity: item.score }));
  }

  /**
   * 获取推荐 (用于音乐详情页)
   * @param {string|number} tokenId - 音乐 Token ID
   * @param {Array} allMusic - 所有音乐列表
   * @returns {Array} 推荐音乐列表
   */
  getRecommendationsForMusic(tokenId, allMusic) {
    const targetMusic = allMusic.find(m => m.tokenId === tokenId);
    if (!targetMusic) return [];
    
    return this.findSimilar(targetMusic, allMusic, 5);
  }

  /**
   * 分析用户偏好的风格
   * @param {Array} userHistory - 用户历史听歌记录
   * @returns {Array} 偏好风格列表
   */
  analyzeGenres(userHistory) {
    if (!userHistory || userHistory.length === 0) return [];
    
    const genreCount = {};
    userHistory.forEach(music => {
      if (music.genre) {
        genreCount[music.genre] = (genreCount[music.genre] || 0) + 1;
      }
    });
    
    // 返回出现次数最多的风格
    return Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);
  }

  /**
   * 分析用户的平均 BPM 偏好
   * @param {Array} userHistory - 用户历史听歌记录
   * @returns {number} 平均 BPM
   */
  analyzeBPM(userHistory) {
    if (!userHistory || userHistory.length === 0) return 0;
    
    const bpms = userHistory
      .filter(m => m.bpm)
      .map(m => m.bpm);
    
    if (bpms.length === 0) return 0;
    
    return Math.round(bpms.reduce((a, b) => a + b, 0) / bpms.length);
  }

  /**
   * 基于用户历史推荐
   * @param {Array} userHistory - 用户历史听歌记录
   * @param {Array} allMusic - 所有音乐列表
   * @param {number} count - 返回数量
   * @returns {Array} 推荐音乐列表
   */
  getRecommendationsForUser(userHistory, allMusic, count = 5) {
    if (!userHistory || userHistory.length === 0) {
      // 如果没有历史记录，随机返回一些音乐
      return this.getRandomRecommendations(allMusic, count);
    }
    
    // 分析用户偏好
    const preferredGenres = this.analyzeGenres(userHistory);
    const avgBPM = this.analyzeBPM(userHistory);
    const userTokenIds = new Set(userHistory.map(m => m.tokenId));
    
    // 计算每首音乐的匹配分数
    const scored = allMusic
      .filter(m => !userTokenIds.has(m.tokenId)) // 排除已听过的
      .map(music => {
        let score = 0;
        
        // 风格匹配
        if (music.genre && preferredGenres.includes(music.genre)) {
          score += 40;
        }
        
        // BPM 接近度
        if (music.bpm && avgBPM > 0) {
          const bpmDiff = Math.abs(music.bpm - avgBPM);
          score += Math.max(0, 30 - bpmDiff);
        }
        
        return { music, score };
      });
    
    // 按分数排序并返回
    scored.sort((a, b) => b.score - a.score);
    
    return scored
      .slice(0, count)
      .map(item => ({ ...item.music, matchScore: item.score }));
  }

  /**
   * 获取随机推荐
   * @param {Array} allMusic - 所有音乐列表
   * @param {number} count - 返回数量
   * @returns {Array} 随机音乐列表
   */
  getRandomRecommendations(allMusic, count = 5) {
    const shuffled = [...allMusic].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * 获取相似度解释（用于 UI 展示）
   * @param {Object} targetMusic - 目标音乐
   * @param {Object} similarMusic - 相似音乐
   * @returns {Object} 相似度分解
   */
  getSimilarityBreakdown(targetMusic, similarMusic) {
    const breakdown = {
      genre: { match: false, score: 0 },
      bpm: { match: false, score: 0, diff: null },
      mood: { match: false, score: 0 },
      key: { match: false, score: 0 }
    };

    // 风格
    if (targetMusic.genre && similarMusic.genre) {
      breakdown.genre.match = targetMusic.genre === similarMusic.genre;
      breakdown.genre.score = breakdown.genre.match ? this.weights.genre : 0;
    }

    // BPM
    if (targetMusic.bpm && similarMusic.bpm) {
      const bpmDiff = Math.abs(targetMusic.bpm - similarMusic.bpm);
      breakdown.bpm.match = bpmDiff < 20;
      breakdown.bpm.score = Math.max(0, this.weights.bpm - (bpmDiff / 2));
      breakdown.bpm.diff = bpmDiff;
    }

    // 情绪
    if (targetMusic.mood && similarMusic.mood) {
      breakdown.mood.match = targetMusic.mood === similarMusic.mood;
      breakdown.mood.score = breakdown.mood.match ? this.weights.mood : 0;
    }

    // 调性
    if (targetMusic.key && similarMusic.key) {
      breakdown.key.match = targetMusic.key === similarMusic.key;
      breakdown.key.score = breakdown.key.match ? this.weights.key : 0;
    }

    return breakdown;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RecommendationEngine;
} else {
  window.RecommendationEngine = RecommendationEngine;
}
