"""ECHO 势体系 Oracle 包

链下计算服务，提供：
- 数据生成
- 势场计算
- Merkle 树生成
"""

from .calculator import (
    calculate_boundaries,
    calculate_yao,
    calculate_shi_energy,
    detect_anomalies,
    calculate_region_energies,
    YAO_NAMES,
    YAO_TYPES
)

from .data_generator import (
    DataGenerator,
    generate_week,
    generate_all_weeks
)

from .merkle import (
    MerkleTree,
    build_merkle_tree,
    verify_proof,
    format_asset_region_pairs
)

__version__ = "0.1.0"

__all__ = [
    # Calculator
    "calculate_boundaries",
    "calculate_yao",
    "calculate_shi_energy",
    "detect_anomalies",
    "calculate_region_energies",
    "YAO_NAMES",
    "YAO_TYPES",
    # Data Generator
    "DataGenerator",
    "generate_week",
    "generate_all_weeks",
    # Merkle
    "MerkleTree",
    "build_merkle_tree",
    "verify_proof",
    "format_asset_region_pairs",
]
