"""ECHO 势体系 Merkle 树模块

生成Merkle树用于链上验证
"""

import hashlib
import json
from typing import List, Tuple, Dict, Any, Optional
from eth_abi import encode
from web3 import Web3


def keccak256(data: bytes) -> bytes:
    """计算 Keccak-256 哈希"""
    return hashlib.sha3_256(data).digest()


def hash_leaf(asset_id: str, region: int) -> bytes:
    """
    计算叶子节点哈希
    
    使用以太坊兼容的编码方式
    """
    # 将 asset_id 转换为 bytes，region 转换为 uint256
    asset_bytes = asset_id.encode('utf-8')
    
    # 使用 eth_abi 编码
    encoded = encode(
        ['bytes32', 'uint256'],
        [Web3.keccak(text=asset_id), region]
    )
    
    return Web3.keccak(encoded)


def hash_pair(left: bytes, right: bytes) -> bytes:
    """哈希两个节点（排序后）"""
    # 确保顺序一致：小的在左
    if left > right:
        left, right = right, left
    return Web3.keccak(left + right)


def build_merkle_tree(asset_region_pairs: List[Tuple[str, int]]) -> Tuple[str, Dict[str, List[str]]]:
    """
    构建 Merkle 树
    
    Args:
        asset_region_pairs: [(asset_id, region), ...]
        
    Returns:
        (root_hash, proofs)
        proofs: {asset_id: [sibling_hash, ...]}
    """
    if not asset_region_pairs:
        return "0x" + "0" * 64, {}
    
    # 生成叶子节点哈希
    leaves = [(pair[0], hash_leaf(pair[0], pair[1])) for pair in asset_region_pairs]
    
    # 如果叶子数量为奇数，复制最后一个
    if len(leaves) % 2 == 1:
        leaves.append(leaves[-1])
    
    # 构建树
    tree_levels = [leaves]
    
    while len(tree_levels[-1]) > 1:
        current_level = tree_levels[-1]
        next_level = []
        
        for i in range(0, len(current_level), 2):
            left = current_level[i]
            right = current_level[i + 1] if i + 1 < len(current_level) else left
            
            parent_hash = hash_pair(left[1], right[1])
            # 存储 (combined_id, hash)
            parent_id = f"{left[0]}_{right[0]}"
            next_level.append((parent_id, parent_hash))
        
        tree_levels.append(next_level)
    
    # 根哈希
    root_hash = "0x" + tree_levels[-1][0][1].hex()
    
    # 生成证明
    proofs = {}
    
    for idx, (asset_id, leaf_hash) in enumerate(leaves):
        if asset_id in proofs:
            continue  # 跳过重复的（奇数情况）
        
        proof = []
        current_idx = idx
        
        for level in tree_levels[:-1]:  # 不包括根
            # 找到兄弟节点
            if current_idx % 2 == 0:
                sibling_idx = current_idx + 1
            else:
                sibling_idx = current_idx - 1
            
            if sibling_idx < len(level):
                sibling_hash = level[sibling_idx][1]
                proof.append("0x" + sibling_hash.hex())
            
            current_idx = current_idx // 2
        
        proofs[asset_id] = proof
    
    return root_hash, proofs


def verify_proof(root: str, asset_id: str, region: int, proof: List[str]) -> bool:
    """
    验证 Merkle 证明
    
    Args:
        root: 根哈希 (0x...)
        asset_id: 资产ID
        region: 区域编号
        proof: 证明路径
        
    Returns:
        是否验证通过
    """
    # 计算叶子哈希
    current_hash = hash_leaf(asset_id, region)
    
    # 逐级验证
    for sibling_hex in proof:
        sibling = bytes.fromhex(sibling_hex.replace("0x", ""))
        current_hash = hash_pair(current_hash, sibling)
    
    computed_root = "0x" + current_hash.hex()
    return computed_root.lower() == root.lower()


def format_asset_region_pairs(assets: List[Dict]) -> List[Tuple[str, int]]:
    """
    从资产数据格式化 (asset_id, region) 对
    
    Args:
        assets: 资产列表（需要包含 region 字段）
        
    Returns:
        [(asset_id, region), ...]
    """
    pairs = []
    for asset in assets:
        asset_id = asset.get("id", asset.get("asset_id", ""))
        region = asset.get("region", 1)
        pairs.append((asset_id, region))
    return pairs


class MerkleTree:
    """Merkle 树类"""
    
    def __init__(self, asset_region_pairs: List[Tuple[str, int]]):
        self.pairs = asset_region_pairs
        self.root, self.proofs = build_merkle_tree(asset_region_pairs)
    
    def get_root(self) -> str:
        """获取根哈希"""
        return self.root
    
    def get_proof(self, asset_id: str) -> Optional[List[str]]:
        """获取指定资产的证明"""
        return self.proofs.get(asset_id)
    
    def verify(self, asset_id: str, region: int) -> bool:
        """验证资产"""
        proof = self.get_proof(asset_id)
        if not proof:
            return False
        return verify_proof(self.root, asset_id, region, proof)


if __name__ == "__main__":
    # 测试 Merkle 树
    print("=" * 60)
    print("Merkle 树测试")
    print("=" * 60)
    
    # 测试数据
    test_pairs = [
        ("asset_001", 1),
        ("asset_002", 2),
        ("asset_003", 3),
        ("asset_004", 4),
    ]
    
    tree = MerkleTree(test_pairs)
    
    print(f"\n根哈希: {tree.get_root()}")
    print(f"\n证明数量: {len(tree.proofs)}")
    
    # 验证每个资产
    for asset_id, region in test_pairs:
        proof = tree.get_proof(asset_id)
        is_valid = tree.verify(asset_id, region)
        print(f"\n资产 {asset_id} (区域 {region}):")
        print(f"  证明: {proof}")
        print(f"  验证结果: {is_valid}")
