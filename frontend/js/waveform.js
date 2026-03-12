/**
 * WaveformGenerator - 音频波形生成器
 * 使用 Web Audio API 解码音频并提取波形数据
 */
class WaveformGenerator {
  constructor() {
    this.audioBuffer = null;
    this.channelData = null;
    this.sampleRate = 0;
    this.duration = 0;
    this.peakCache = new Map(); // 缓存不同精度的峰值数据
    this.audioContext = null; // 保存 AudioContext 引用
  }

  /**
   * 从音频文件URL生成波形数据
   * @param {string} audioUrl - 音频文件URL
   * @returns {Promise<void>}
   */
  async generateFromURL(audioUrl) {
    try {
      // 1. 获取音频文件为 ArrayBuffer
      const response = await fetch(audioUrl, {
        mode: 'cors',
        cache: 'force-cache'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      
      // 2. 使用 AudioContext 解码音频数据
      // 关闭之前的 AudioContext（如果存在）
      if (this.audioContext && this.audioContext.state !== 'closed') {
        await this.audioContext.close();
      }
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // 3. 提取音频元数据
      this.sampleRate = this.audioBuffer.sampleRate;
      this.duration = this.audioBuffer.duration;
      
      // 4. 合并所有声道的数据（取平均值）
      this.channelData = this._mergeChannels();
      
      // 5. 清除缓存
      this.peakCache.clear();
      
    } catch (error) {
      console.error('WaveformGenerator: Error generating waveform:', error);
      throw error;
    }
  }

  /**
   * 合并所有声道数据（取绝对值的平均值）
   * @returns {Float32Array} 合并后的音频数据
   * @private
   */
  _mergeChannels() {
    const numberOfChannels = this.audioBuffer.numberOfChannels;
    const length = this.audioBuffer.length;
    const mergedData = new Float32Array(length);

    for (let i = 0; i < length; i++) {
      let sum = 0;
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = this.audioBuffer.getChannelData(channel);
        sum += Math.abs(channelData[i]);
      }
      mergedData[i] = sum / numberOfChannels;
    }

    return mergedData;
  }

  /**
   * 提取指定范围内的峰值
   * @param {number} startSample - 起始采样点
   * @param {number} endSample - 结束采样点
   * @returns {number} 峰值（0-1范围）
   * @private
   */
  _extractPeak(startSample, endSample) {
    let peak = 0;
    const clampedEnd = Math.min(endSample, this.channelData.length);
    
    for (let i = startSample; i < clampedEnd; i++) {
      if (this.channelData[i] > peak) {
        peak = this.channelData[i];
      }
    }
    
    return peak;
  }

  /**
   * 计算指定柱状数量的峰值数据
   * @param {number} barCount - 柱状图数量
   * @returns {Array<number>} 峰值数组（0-1范围）
   * @private
   */
  _calculatePeaks(barCount) {
    // 检查缓存
    if (this.peakCache.has(barCount)) {
      return this.peakCache.get(barCount);
    }

    if (!this.channelData || this.channelData.length === 0) {
      return new Array(barCount).fill(0);
    }

    const peaks = [];
    const samplesPerBar = Math.floor(this.channelData.length / barCount);

    for (let i = 0; i < barCount; i++) {
      const startSample = i * samplesPerBar;
      const endSample = (i + 1) * samplesPerBar;
      const peak = this._extractPeak(startSample, endSample);
      peaks.push(peak);
    }

    // 缓存结果
    this.peakCache.set(barCount, peaks);
    return peaks;
  }

  /**
   * 归一化峰值数据到 0-100 范围
   * @param {Array<number>} peaks - 原始峰值数组
   * @returns {Array<number>} 归一化后的峰值数组（0-100范围）
   * @private
   */
  _normalizePeaks(peaks) {
    if (peaks.length === 0) return [];

    // 找出最大值用于归一化
    const maxPeak = Math.max(...peaks);
    
    if (maxPeak === 0) {
      return peaks.map(() => 0);
    }

    // 归一化到 0-100 范围
    return peaks.map(peak => {
      const normalized = (peak / maxPeak) * 100;
      return Math.round(normalized);
    });
  }

  /**
   * 获取波形柱状数据（用于显示）
   * @param {number} barCount - 柱状图数量（默认50）
   * @returns {Array<number>} 柱状图高度数组（0-100范围）
   */
  getBars(barCount = 50) {
    if (!this.channelData) {
      console.warn('WaveformGenerator: No audio data loaded. Call generateFromURL() first.');
      return new Array(barCount).fill(0);
    }

    const peaks = this._calculatePeaks(barCount);
    return this._normalizePeaks(peaks);
  }

  /**
   * 获取当前播放位置对应的柱状索引
   * @param {number} currentTime - 当前播放时间（秒）
   * @param {number} duration - 音频总时长（秒）
   * @param {number} barCount - 柱状图数量（默认50）
   * @returns {number} 柱状图索引（0 到 barCount-1）
   */
  getBarIndexAtTime(currentTime, duration, barCount = 50) {
    if (!duration || duration <= 0) {
      return 0;
    }

    // 确保时间在有效范围内
    const clampedTime = Math.max(0, Math.min(currentTime, duration));
    
    // 计算进度比例 (0 到 1)
    const progress = clampedTime / duration;
    
    // 映射到柱状图索引
    const index = Math.floor(progress * barCount);
    
    // 确保索引在有效范围内
    return Math.min(index, barCount - 1);
  }

  /**
   * 获取音频总时长
   * @returns {number} 音频时长（秒）
   */
  getDuration() {
    return this.duration || 0;
  }

  /**
   * 获取音频采样率
   * @returns {number} 采样率（Hz）
   */
  getSampleRate() {
    return this.sampleRate || 0;
  }

  /**
   * 获取音频已加载状态
   * @returns {boolean} 是否已加载音频
   */
  isLoaded() {
    return this.audioBuffer !== null;
  }

  /**
   * 清空数据，释放内存
   */
  dispose() {
    this.audioBuffer = null;
    this.channelData = null;
    this.peakCache.clear();
    this.sampleRate = 0;
    this.duration = 0;
  }
}

// 导出模块（支持 CommonJS 和 ES6 模块）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WaveformGenerator;
}

if (typeof window !== 'undefined') {
  window.WaveformGenerator = WaveformGenerator;
}
