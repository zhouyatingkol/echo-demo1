#!/usr/bin/env python3
"""
对比多周数据脚本

用法:
    python compare_weeks.py --weeks 1 2 3 4 --output data/comparison.json
"""

import argparse
import json
import sys
from pathlib import Path
from typing import Dict, List

# 添加父目录到路径
sys.path.insert(0, str(Path(__file__).parent.parent))

from oracle.data_generator import DataGenerator
from oracle.calculator import (
    calculate_boundaries,
    calculate_region_energies,
    detect_anomalies,
    calculate_shi_energy
)
from oracle.merkle import build_merkle_tree


def load_week_data(week: int, data_dir: Path) -> Dict:
    """加载已有周数据"""
    week_file = data_dir / f"week_{week}.json"
    if week_file.exists():
        with open(week_file, 'r') as f:
            return json.load(f)
    return None


def generate_week_summary(week: int, data: Dict) -> Dict:
    """生成周数据摘要"""
    assets = data.get("assets", [])
    
    # 计算统计数据
    energies = [a["shi_energy"]["normalized_energy"] for a in assets]
    regions = [a["region"] for a in assets]
    
    region_dist = {}
    for r in regions:
        region_dist[r] = region_dist.get(r, 0) + 1
    
    # 计算平均各维度值
    time_avg = sum(a["time_usage"] for a in assets) / len(assets)
    space_avg = sum(a["space_count"] for a in assets) / len(assets)
    relation_avg = sum(a["relation_count"] for a in assets) / len(assets)
    
    return {
        "week": week,
        "asset_count": len(assets),
        "avg_energy": sum(energies) / len(energies) if energies else 0,
        "max_energy": max(energies) if energies else 0,
        "min_energy": min(energies) if energies else 0,
        "region_distribution": region_dist,
        "avg_time_usage": time_avg,
        "avg_space_count": space_avg,
        "avg_relation_count": relation_avg,
        "merkle_root": data.get("merkle_root"),
        "anomaly_count": data.get("statistics", {}).get("anomaly_count", 0)
    }


def compare_weeks(weeks_data: Dict[int, Dict]) -> Dict:
    """
    对比多周数据变化
    
    Returns:
        对比分析结果
    """
    comparisons = []
    week_numbers = sorted(weeks_data.keys())
    
    for i in range(1, len(week_numbers)):
        prev_week = week_numbers[i - 1]
        curr_week = week_numbers[i]
        
        prev_data = weeks_data[prev_week]
        curr_data = weeks_data[curr_week]
        
        # 计算变化
        energy_change = curr_data["avg_energy"] - prev_data["avg_energy"]
        energy_change_pct = (energy_change / prev_data["avg_energy"] * 100) if prev_data["avg_energy"] else 0
        
        time_change = curr_data["avg_time_usage"] - prev_data["avg_time_usage"]
        space_change = curr_data["avg_space_count"] - prev_data["avg_space_count"]
        relation_change = curr_data["avg_relation_count"] - prev_data["avg_relation_count"]
        
        comparisons.append({
            "from_week": prev_week,
            "to_week": curr_week,
            "energy_change": {
                "absolute": round(energy_change, 2),
                "percentage": round(energy_change_pct, 2)
            },
            "dimension_changes": {
                "time": round(time_change, 2),
                "space": round(space_change, 2),
                "relation": round(relation_change, 2)
            },
            "anomaly_change": curr_data["anomaly_count"] - prev_data["anomaly_count"]
        })
    
    return comparisons


def identify_trends(weeks_data: Dict[int, Dict]) -> Dict:
    """识别趋势"""
    week_numbers = sorted(weeks_data.keys())
    
    energies = [weeks_data[w]["avg_energy"] for w in week_numbers]
    anomalies = [weeks_data[w]["anomaly_count"] for w in week_numbers]
    
    # 能量趋势
    energy_trend = "stable"
    if energies[-1] > energies[0] * 1.2:
        energy_trend = "rising"
    elif energies[-1] < energies[0] * 0.8:
        energy_trend = "falling"
    
    # 异常趋势
    anomaly_trend = "stable"
    if anomalies[-1] > anomalies[0]:
        anomaly_trend = "increasing"
    elif anomalies[-1] < anomalies[0]:
        anomaly_trend = "decreasing"
    
    return {
        "energy_trend": energy_trend,
        "anomaly_trend": anomaly_trend,
        "overall_health": "healthy" if energy_trend == "rising" and anomaly_trend != "increasing" else "attention"
    }


def main():
    parser = argparse.ArgumentParser(description="对比 ECHO 势体系多周数据")
    parser.add_argument("--weeks", type=int, nargs="+", default=[1, 2, 3, 4],
                        help="要对比的周数列表")
    parser.add_argument("--output", type=str, default="data/comparison.json",
                        help="输出文件路径")
    parser.add_argument("--data-dir", type=str, default="data",
                        help="数据目录")
    
    args = parser.parse_args()
    
    data_dir = Path(args.data_dir)
    
    print(f"=" * 60)
    print(f"ECHO 多周数据对比分析")
    print(f"=" * 60)
    print(f"\n分析周数: {args.weeks}")
    
    # 收集各周数据
    weeks_data = {}
    week_summaries = []
    
    for week in args.weeks:
        print(f"\n加载第 {week} 周数据...")
        
        # 尝试加载已有数据，否则生成
        data = load_week_data(week, data_dir)
        
        if data:
            print(f"  ✓ 从文件加载")
        else:
            print(f"  - 生成新数据")
            # 生成数据
            from oracle.data_generator import generate_week
            from oracle.calculator import calculate_region_energies, detect_anomalies
            from oracle.merkle import build_merkle_tree
            
            assets = generate_week(week, 100)
            boundaries = calculate_boundaries(assets)
            assets_with_energy = calculate_region_energies(assets, boundaries)
            anomalies = detect_anomalies(assets)
            
            asset_region_pairs = [(a["id"], a["region"]) for a in assets_with_energy]
            merkle_root, merkle_proofs = build_merkle_tree(asset_region_pairs)
            
            data = {
                "week": week,
                "boundaries": boundaries,
                "merkle_root": merkle_root,
                "assets": assets_with_energy,
                "statistics": {"anomaly_count": len(anomalies)}
            }
            
            # 保存
            week_file = data_dir / f"week_{week}.json"
            week_file.parent.mkdir(parents=True, exist_ok=True)
            with open(week_file, 'w') as f:
                json.dump(data, f, indent=2)
            print(f"  ✓ 已保存到 {week_file}")
        
        # 生成摘要
        summary = generate_week_summary(week, data)
        weeks_data[week] = summary
        week_summaries.append(summary)
    
    # 对比分析
    print(f"\n{'=' * 60}")
    print(f"对比分析")
    print(f"{'=' * 60}")
    
    comparisons = compare_weeks(weeks_data)
    
    print(f"\n逐周对比:")
    for comp in comparisons:
        print(f"\n  第 {comp['from_week']} 周 → 第 {comp['to_week']} 周:")
        print(f"    能量变化: {comp['energy_change']['absolute']:+.2f} "
              f"({comp['energy_change']['percentage']:+.1f}%)")
        print(f"    Time: {comp['dimension_changes']['time']:+.1f}, "
              f"Space: {comp['dimension_changes']['space']:+.1f}, "
              f"Relation: {comp['dimension_changes']['relation']:+.1f}")
        print(f"    异常变化: {comp['anomaly_change']:+d}")
    
    # 趋势分析
    trends = identify_trends(weeks_data)
    print(f"\n趋势分析:")
    print(f"  能量趋势: {trends['energy_trend']}")
    print(f"  异常趋势: {trends['anomaly_trend']}")
    print(f"  整体健康度: {trends['overall_health']}")
    
    # 输出详细数据
    comparison_result = {
        "analysis_date": json.dumps(None),
        "weeks_analyzed": args.weeks,
        "week_summaries": week_summaries,
        "comparisons": comparisons,
        "trends": trends
    }
    
    # 保存结果
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(comparison_result, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'=' * 60}")
    print(f"✓ 对比结果已保存到: {output_path.absolute()}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
