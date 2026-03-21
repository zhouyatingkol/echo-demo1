"""ECHO 势体系数据生成模块

生成模拟资产数据，模拟4周的数据演化
"""

import random
import json
from typing import List, Dict
from datetime import datetime, timedelta


# 模拟资产名称库
ASSET_NAMES = [
    "DeFi-Protocol-Alpha", "NFT-Collection-Beta", "DAO-Gamma", "DEX-Delta",
    "Lending-Pool-Epsilon", "Yield-Farm-Zeta", "Bridge-Protocol-Eta", 
    "Oracle-Service-Theta", "Game-Asset-Iota", "Metaverse-Land-Kappa",
    "Identity-Layer-Lambda", "Privacy-Coin-Mu", "Stablecoin-Nu", 
    "Governance-Token-Xi", "Utility-Token-Omicron", "Security-Token-Pi",
    "Wrapped-BTC-Rho", "Liquid-Staking-Sigma", "Restaking-Tau",
    "Intent-Center-Upsilon", "Account-Abstraction-Phi", "L2-Rollup-Chi",
    "Data-Availability-Psi", "Shared-Sequencer-Omega", "MEV-Relay-A1",
    "Flash-Loan-B1", "Options-Protocol-C1", "Perpetual-DEX-D1",
    "RWA-Token-E1", "Insurance-Pool-F1", "Derivatives-G1", "Index-Fund-H1",
    "Prediction-Market-I1", "Social-Token-J1", "Creator-Coin-K1",
    "Reputation-Score-L1", "Attestation-M1", "Credential-N1",
    "Soulbound-Token-O1", "Dynamic-NFT-P1", "Fractional-Q1",
    "Vault-Strategy-R1", "Aggregator-S1", "Router-T1",
    "Multisig-U1", "Timelock-V1", "Proxy-W1", "Beacon-X1",
    "Factory-Y1", "Registry-Z1", "Controller-A2", "Manager-B2",
    "Strategy-C2", "Adapter-D2", "Connector-E2", "Module-F2",
    "Extension-G2", "Plugin-H2", "Hook-I2", "Callback-J2",
    "Event-Emitter-K2", "State-Channel-L2", "Payment-Splitter-M2",
    "Vesting-N2", "Airdrop-O2", "Staking-P2", "Farming-Q2",
    "Mining-R2", "Validation-S2", "Finality-Gadget-T2",
    "Fraud-Proof-U2", "Validity-Proof-V2", "Zero-Knowledge-W2",
    "Multi-Party-X2", "Threshold-Y2", "Distributed-Z2",
    "Consensus-A3", "Coordination-B3", "Synchronization-C3",
    "Propagation-D3", "Dissemination-E3", "Aggregation-F3",
    "Verification-G3", "Attestation-H3", "Confirmation-I3",
    "Finalization-J3", "Checkpoint-K3", "Epoch-L3", "Slot-M3",
    "Commitment-N3", "Revelation-O3", "Challenge-P3", "Response-Q3"
]


class DataGenerator:
    """数据生成器"""
    
    def __init__(self, seed: int = 42):
        """
        初始化生成器
        
        Args:
            seed: 随机种子，确保可重复性
        """
        random.seed(seed)
        self.base_time_usage = {}
        self.base_space_count = {}
        self.base_relation_count = {}
    
    def generate_asset(self, asset_id: int, week: int) -> Dict:
        """
        生成单个资产的数据
        
        Args:
            asset_id: 资产ID
            week: 第几周 (1-4)
            
        Returns:
            资产数据字典
        """
        # 基础属性（首次生成时确定）
        if asset_id not in self.base_time_usage:
            # 根据资产类型设置不同的基础参数
            asset_type = asset_id % 5
            
            if asset_type == 0:  # 高频使用型
                self.base_time_usage[asset_id] = random.randint(50, 100)
                self.base_space_count[asset_id] = random.randint(2, 5)
                self.base_relation_count[asset_id] = random.randint(10, 30)
            elif asset_type == 1:  # 空间分布型
                self.base_time_usage[asset_id] = random.randint(10, 30)
                self.base_space_count[asset_id] = random.randint(8, 15)
                self.base_relation_count[asset_id] = random.randint(20, 50)
            elif asset_type == 2:  # 关系密集型
                self.base_time_usage[asset_id] = random.randint(20, 50)
                self.base_space_count[asset_id] = random.randint(3, 8)
                self.base_relation_count[asset_id] = random.randint(50, 100)
            elif asset_type == 3:  # 均衡发展型
                self.base_time_usage[asset_id] = random.randint(30, 60)
                self.base_space_count[asset_id] = random.randint(5, 10)
                self.base_relation_count[asset_id] = random.randint(30, 60)
            else:  # 新兴资产型
                self.base_time_usage[asset_id] = random.randint(5, 20)
                self.base_space_count[asset_id] = random.randint(1, 3)
                self.base_relation_count[asset_id] = random.randint(5, 15)
        
        # 根据周数演化数据
        growth_factor = 1 + (week - 1) * 0.15  # 每周增长15%
        
        # 添加随机波动
        time_usage = int(self.base_time_usage[asset_id] * growth_factor * random.uniform(0.9, 1.2))
        space_count = int(self.base_space_count[asset_id] * growth_factor * random.uniform(0.95, 1.1))
        relation_count = int(self.base_relation_count[asset_id] * growth_factor * random.uniform(0.9, 1.15))
        
        # 特殊事件模拟（某些周有异常波动）
        if week == 2 and asset_id % 10 == 0:  # 第2周某些资产爆发
            time_usage = int(time_usage * 2.5)
            relation_count = int(relation_count * 1.8)
        elif week == 3 and asset_id % 15 == 0:  # 第3周另一些资产爆发
            space_count = int(space_count * 2.0)
        elif week == 4 and asset_id % 20 == 0:  # 第4周少量资产剧烈波动
            time_usage = int(time_usage * 3.0)
            space_count = int(space_count * 2.5)
            relation_count = int(relation_count * 2.2)
        
        return {
            "id": f"asset_{asset_id:03d}",
            "name": ASSET_NAMES[asset_id % len(ASSET_NAMES)],
            "type": ["高频使用", "空间分布", "关系密集", "均衡发展", "新兴资产"][asset_id % 5],
            "week": week,
            "time_usage": time_usage,
            "space_count": space_count,
            "relation_count": relation_count,
            "created_at": (datetime(2024, 1, 1) + timedelta(weeks=week-1)).isoformat()
        }
    
    def generate_week_data(self, week: int, num_assets: int = 100) -> List[Dict]:
        """
        生成一周的数据
        
        Args:
            week: 第几周
            num_assets: 资产数量（默认100）
            
        Returns:
            资产列表
        """
        assets = []
        for i in range(num_assets):
            asset = self.generate_asset(i, week)
            assets.append(asset)
        return assets
    
    def generate_all_weeks(self, num_weeks: int = 4, num_assets: int = 100) -> Dict[int, List[Dict]]:
        """
        生成多周数据
        
        Args:
            num_weeks: 周数
            num_assets: 每周资产数
            
        Returns:
            按周索引的数据字典
        """
        all_data = {}
        for week in range(1, num_weeks + 1):
            all_data[week] = self.generate_week_data(week, num_assets)
        return all_data


def generate_week(week: int, num_assets: int = 100) -> List[Dict]:
    """便捷函数：生成单周数据"""
    generator = DataGenerator(seed=42 + week)  # 每周不同种子但可重复
    return generator.generate_week_data(week, num_assets)


def print_asset_stats(assets: List[Dict]):
    """打印资产统计信息"""
    time_vals = [a["time_usage"] for a in assets]
    space_vals = [a["space_count"] for a in assets]
    relation_vals = [a["relation_count"] for a in assets]
    
    print(f"资产数量: {len(assets)}")
    print(f"Time Usage - 均值: {sum(time_vals)/len(time_vals):.1f}, "
          f"范围: [{min(time_vals)}, {max(time_vals)}]")
    print(f"Space Count - 均值: {sum(space_vals)/len(space_vals):.1f}, "
          f"范围: [{min(space_vals)}, {max(space_vals)}]")
    print(f"Relation Count - 均值: {sum(relation_vals)/len(relation_vals):.1f}, "
          f"范围: [{min(relation_vals)}, {max(relation_vals)}]")


if __name__ == "__main__":
    # 测试数据生成
    print("=" * 60)
    print("ECHO 数据生成器测试")
    print("=" * 60)
    
    for week in range(1, 5):
        print(f"\n--- 第 {week} 周 ---")
        assets = generate_week(week)
        print_asset_stats(assets)
        print(f"示例资产: {assets[0]}")
