/**
 * Echo Follow System
 * 基于 localStorage 的用户关注系统
 */
class FollowSystem {
  /**
   * @param {string} userAddress - 当前用户的钱包地址
   */
  constructor(userAddress) {
    this.userAddress = userAddress;
    this.storageKey = `echo_follows_${userAddress}`;
    this.data = this.loadData();
  }

  /**
   * 从 localStorage 加载关注数据
   * @returns {Object} 关注数据对象
   */
  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : { following: [], followers: [] };
    } catch (error) {
      console.error('[FollowSystem] 加载数据失败:', error);
      return { following: [], followers: [] };
    }
  }

  /**
   * 保存关注数据到 localStorage
   */
  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (error) {
      console.error('[FollowSystem] 保存数据失败:', error);
    }
  }

  /**
   * 关注创作者
   * @param {string} creatorAddress - 创作者地址
   * @returns {Promise<boolean>} 是否成功关注
   */
  async follow(creatorAddress) {
    if (!creatorAddress || creatorAddress === this.userAddress) {
      console.warn('[FollowSystem] 无效的关注目标');
      return false;
    }

    if (this.data.following.includes(creatorAddress)) {
      return false;
    }

    this.data.following.push(creatorAddress);
    this.saveData();

    // 更新对方的粉丝列表
    this.updateFollowerList(creatorAddress, this.userAddress, true);

    return true;
  }

  /**
   * 取消关注创作者
   * @param {string} creatorAddress - 创作者地址
   * @returns {Promise<boolean>} 是否成功取消关注
   */
  async unfollow(creatorAddress) {
    if (!creatorAddress) {
      return false;
    }

    const index = this.data.following.indexOf(creatorAddress);
    if (index === -1) {
      return false;
    }

    this.data.following.splice(index, 1);
    this.saveData();

    // 更新对方的粉丝列表
    this.updateFollowerList(creatorAddress, this.userAddress, false);

    return true;
  }

  /**
   * 检查是否已关注某个创作者
   * @param {string} creatorAddress - 创作者地址
   * @returns {boolean} 是否已关注
   */
  isFollowing(creatorAddress) {
    return this.data.following.includes(creatorAddress);
  }

  /**
   * 获取我的关注列表
   * @returns {string[]} 关注列表
   */
  getFollowingList() {
    return [...this.data.following];
  }

  /**
   * 获取我的粉丝列表
   * @returns {string[]} 粉丝列表
   */
  getFollowersList() {
    return [...this.data.followers];
  }

  /**
   * 获取关注数量
   * @returns {number} 关注数
   */
  getFollowingCount() {
    return this.data.following.length;
  }

  /**
   * 获取粉丝数量
   * @returns {number} 粉丝数
   */
  getFollowersCount() {
    return this.data.followers.length;
  }

  /**
   * 更新目标用户的粉丝列表（内部方法）
   * @param {string} creatorAddress - 创作者地址
   * @param {string} followerAddress - 关注者地址
   * @param {boolean} isAdding - 是添加还是移除
   * @private
   */
  updateFollowerList(creatorAddress, followerAddress, isAdding) {
    try {
      const key = `echo_follows_${creatorAddress}`;
      const data = JSON.parse(localStorage.getItem(key) || '{"following":[],"followers":[]}');

      if (isAdding) {
        if (!data.followers.includes(followerAddress)) {
          data.followers.push(followerAddress);
        }
      } else {
        const index = data.followers.indexOf(followerAddress);
        if (index > -1) {
          data.followers.splice(index, 1);
        }
      }

      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('[FollowSystem] 更新粉丝列表失败:', error);
    }
  }
}

// 导出到全局作用域
window.FollowSystem = FollowSystem;
