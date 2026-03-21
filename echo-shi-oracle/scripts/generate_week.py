#!/usr/bin/env python3
"""
生成单周数据脚本

用法:
    python generate_week.py --week 1 --output data/week_1.json
"""

import argparse
import json
import sys
from pathlib import Path

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from oracle.data_generator import generate_week
from oracle.calculator import (
    calculate_boundaries,
    calculate_region_energies,
    detect_anomalies
)
from oracle.merkle import build_merkle_tree


def main():
    parser = argparse.ArgumentParser(description="生成 ECHO 势体系单周数据")
    parser.add_argument("--week", type=int, required=True, help="第几周 (1-4)")
    parser.add_argument("--output", type=str, required=True, help="输出文件路径")
    parser.add_argument("--num-assets", type=int, default=100, help="资产数量")
    
    args = parser.parse_args()
    
    # 验证参数
    if args.week < 1 or args.week > 4:
        print(f"错误: week 必须在 1-4 之间，当前: {args.week}")
        sys.exit(1)
    
    print(f"=" * 60)
    print(f"生成第 {args.week} 周数据")
    print(f"=" * 60)
    
    # 1. 生成原始资产数据
    print(f"\n[1/5] 生成 {args.num_assets} 个资产...")
    assets = generate_week(args.week, args.num_assets)
    print(f"      ✓ 生成完成")
    
    # 2. 计算边界
    print(f"\n[2/5] 计算分位数边界...")
    boundaries = calculate_boundaries(assets)
    print(f"      Time 边界: {boundaries['time']}")
    print(f"      Space 边界: {boundaries['space']}")
    print(f"      Relation 边界: {boundaries['relation']}")
    
    # 3. 计算势能
    print(f"\n[3/5] 计算势能...")
    assets_with_energy = calculate_region_energies(assets, boundaries)
    
    # 统计各区域资产数
    region_counts = {}
    for asset in assets_with_energy:
        region = asset["region"]
        region_counts[region] = region_counts.get(region, 0) + 1
    
    print(f"      区域分布: {region_counts}")
    
    # 4. 异常检测
    print(f"\n[4/5] 执行异常检测...")
    anomalies = detect_anomalies(assets, threshold=2.5)
    print(f"      发现 {len(anomalies)} 个异常资产")
    
    if anomalies:
        print(f"      异常资产详情:")
        for i, anomaly in enumerate(anomalies[:3], 1):
            print(f"        {i}. {anomaly['asset_name']} (Z-score: {anomaly['max_z_score']:.2f})")
            for detail in anomaly['details']:
                print(f"           - {detail['dimension']}: {detail['type']} ({detail['z_score']:.2f})")
    
    # 5. 生成 Merkle 树
    print(f"\n[5/5] 生成 Merkle 树...")
    asset_region_pairs = [(a["id"], a["region"]) for a in assets_with_energy]
    merkle_root, merkle_proofs = build_merkle_tree(asset_region_pairs)
    print(f"      Merkle Root: {merkle_root}")
    print(f"      证明数量: {len(merkle_proofs)}")
    
    # 组装输出数据
    output_data = {
        "week": args.week,
        "generated_at": json.dumps(None),  # 时间戳
        "statistics": {
            "total_assets": len(assets),
            "region_distribution": region_counts,
            "anomaly_count": len(anomalies)
        },
        "boundaries": boundaries,
        "merkle_root": merkle_root,
        "merkle_proofs": merkle_proofs,
        "anomalies": anomalies,
        "assets": assets_with_energy
    }
    
    # 确保输出目录存在
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # 写入文件
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'=' * 60}")
    print(f"✓ 数据已保存到: {output_path.absolute()}")
    print(f"{'=' * 60}")
    
    # 返回摘要
    return {
        "week": args.week,
        "assets_count": len(assets),
        "boundaries": boundaries,
        "merkle_root": merkle_root,
        "anomaly_count": len(anomalies)
    }


if __name__ == "__main__":
    result = main()
    print(f"\n生成摘要:")
    print(f"  周数: {result['week']}")
    print(f"  资产数: {result['assets_count']}")
    print(f"  异常数: {result['anomaly_count']}")
    print(f"  Merkle Root: {result['merkle_root']}")
