"""ECHO 势体系计算模块

核心功能：
- 计算边界（75%分位数）
- 百分位转六爻
- 势能计算
- Z-score异常检测
"""

import numpy as np
from typing import List, Dict, Tuple, Any

# 六爻定义
YAO_NAMES = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"]
YAO_SYMBOLS = ["⚊", "⚋", "☳", "☵", "☲", "☶", "☱", "☰"]
YAO_TYPES = ["潜龙", "见龙", "惕龙", "跃龙", "飞龙", "亢龙"]


def calculate_boundaries(assets: List[Dict]) -> Dict[str, List[float]]:
    """
    计算75%分位数边界
    
    Args:
        assets: 资产列表
        
    Returns:
        各维度的分位数边界
    """
    if not assets:
        return {}
    
    # 提取各维度数据
    time_usages = [a.get("time_usage", 0) for a in assets]
    space_counts = [a.get("space_count", 0) for a in assets]
    relation_counts = [a.get("relation_count", 0) for a in assets]
    
    # 计算25%、50%、75%分位数作为边界
    boundaries = {
        "time": [
            float(np.percentile(time_usages, 25)),
            float(np.percentile(time_usages, 50)),
            float(np.percentile(time_usages, 75))
        ],
        "space": [
            float(np.percentile(space_counts, 25)),
            float(np.percentile(space_counts, 50)),
            float(np.percentile(space_counts, 75))
        ],
        "relation": [
            float(np.percentile(relation_counts, 25)),
            float(np.percentile(relation_counts, 50)),
            float(np.percentile(relation_counts, 75))
        ]
    }
    
    return boundaries


def calculate_percentile(value: float, all_values: List[float]) -> float:
    """计算值在所有值中的百分位"""
    if not all_values:
        return 0.0
    sorted_values = sorted(all_values)
    count = len(sorted_values)
    
    # 找到比当前值小的元素数量
    below_count = sum(1 for v in sorted_values if v < value)
    equal_count = sum(1 for v in sorted_values if v == value)
    
    # 使用线性插值计算百分位
    percentile = (below_count + 0.5 * equal_count) / count * 100
    return percentile


def calculate_yao(percentile: float) -> Dict[str, Any]:
    """
    百分位转六爻
    
    0-16.67%  -> 初爻 (潜龙)
    16.67-33.33% -> 二爻 (见龙)
    33.33-50% -> 三爻 (惕龙)
    50-66.67% -> 四爻 (跃龙)
    66.67-83.33% -> 五爻 (飞龙)
    83.33-100% -> 上爻 (亢龙)
    """
    yao_index = min(int(percentile / 16.67), 5)
    
    # 阳爻(⚊)还是阴爻(⚋) - 基于百分位奇偶
    is_yang = int(percentile) % 2 == 1
    yao_line = "⚊" if is_yang else "⚋"
    
    return {
        "index": yao_index,
        "name": YAO_NAMES[yao_index],
        "type": YAO_TYPES[yao_index],
        "line": yao_line,
        "is_yang": is_yang,
        "percentile": percentile
    }


def calculate_shi_energy(asset: Dict, boundaries: Dict[str, List[float]]) -> Dict[str, Any]:
    """
    计算资产的势能
    
    势 = √(time² + space² + relation²) - 综合考虑三个维度
    
    Args:
        asset: 单个资产数据
        boundaries: 边界配置
        
    Returns:
        势能计算结果
    """
    time_usage = asset.get("time_usage", 0)
    space_count = asset.get("space_count", 0)
    relation_count = asset.get("relation_count", 0)
    
    # 计算原始势值（欧几里得距离）
    raw_energy = np.sqrt(time_usage**2 + space_count**2 + relation_count**2)
    
    # 计算各维度的百分位
    # 注意：实际使用时需要提供所有资产的数据来计算百分位
    # 这里先使用基于边界的相对位置估算
    time_pct = calculate_dimension_percentile(time_usage, boundaries.get("time", [0, 0, 0]))
    space_pct = calculate_dimension_percentile(space_count, boundaries.get("space", [0, 0, 0]))
    relation_pct = calculate_dimension_percentile(relation_count, boundaries.get("relation", [0, 0, 0]))
    
    # 平均百分位
    avg_percentile = (time_pct + space_pct + relation_pct) / 3
    
    # 计算六爻
    yao = calculate_yao(avg_percentile)
    
    # 计算归一化势能 (0-100)
    # 使用对数压缩处理长尾分布
    normalized_energy = min(100, np.log1p(raw_energy) * 10)
    
    # 势等级
    if normalized_energy < 20:
        level = "微势"
    elif normalized_energy < 40:
        level = "弱势"
    elif normalized_energy < 60:
        level = "中势"
    elif normalized_energy < 80:
        level = "强势"
    else:
        level = "极势"
    
    return {
        "raw_energy": float(raw_energy),
        "normalized_energy": float(normalized_energy),
        "level": level,
        "yao": yao,
        "dimensions": {
            "time": {
                "value": time_usage,
                "percentile": time_pct,
                "yao": calculate_yao(time_pct)
            },
            "space": {
                "value": space_count,
                "percentile": space_pct,
                "yao": calculate_yao(space_pct)
            },
            "relation": {
                "value": relation_count,
                "percentile": relation_pct,
                "yao": calculate_yao(relation_pct)
            }
        }
    }


def calculate_dimension_percentile(value: float, boundaries: List[float]) -> float:
    """
    基于边界计算维度的百分位
    
    Args:
        value: 当前值
        boundaries: [25%, 50%, 75%] 边界值
        
    Returns:
        百分位 (0-100)
    """
    if not boundaries or len(boundaries) < 3:
        return 50.0
    
    p25, p50, p75 = boundaries
    
    if value <= p25:
        # 0-25%区间
        if p25 == 0:
            return 12.5
        return (value / p25) * 12.5
    elif value <= p50:
        # 25-50%区间
        if p50 == p25:
            return 25.0
        return 25 + ((value - p25) / (p50 - p25)) * 25
    elif value <= p75:
        # 50-75%区间
        if p75 == p50:
            return 50.0
        return 50 + ((value - p50) / (p75 - p50)) * 25
    else:
        # 75-100%区间
        if p75 == 0:
            return 87.5
        return 75 + min(25, (value - p75) / p75 * 25)


def detect_anomalies(assets: List[Dict], threshold: float = 2.5) -> List[Dict]:
    """
    Z-score异常检测
    
    识别在任一度量上偏离平均值超过阈值标准差的资产
    
    Args:
        assets: 资产列表
        threshold: Z-score阈值（默认2.5，约99%置信区间）
        
    Returns:
        异常资产列表，包含异常详情
    """
    if not assets or len(assets) < 3:
        return []
    
    # 提取各维度数据
    time_usages = np.array([a.get("time_usage", 0) for a in assets])
    space_counts = np.array([a.get("space_count", 0) for a in assets])
    relation_counts = np.array([a.get("relation_count", 0) for a in assets])
    
    # 计算均值和标准差
    time_mean, time_std = np.mean(time_usages), np.std(time_usages)
    space_mean, space_std = np.mean(space_counts), np.std(space_counts)
    relation_mean, relation_std = np.mean(relation_counts), np.std(relation_counts)
    
    anomalies = []
    
    for asset in assets:
        time_val = asset.get("time_usage", 0)
        space_val = asset.get("space_count", 0)
        relation_val = asset.get("relation_count", 0)
        
        # 计算Z-scores
        time_z = (time_val - time_mean) / time_std if time_std > 0 else 0
        space_z = (space_val - space_mean) / space_std if space_std > 0 else 0
        relation_z = (relation_val - relation_mean) / relation_std if relation_std > 0 else 0
        
        anomaly_details = []
        
        if abs(time_z) > threshold:
            anomaly_details.append({
                "dimension": "time",
                "value": time_val,
                "z_score": float(time_z),
                "type": "high" if time_z > 0 else "low"
            })
        
        if abs(space_z) > threshold:
            anomaly_details.append({
                "dimension": "space",
                "value": space_val,
                "z_score": float(space_z),
                "type": "high" if space_z > 0 else "low"
            })
        
        if abs(relation_z) > threshold:
            anomaly_details.append({
                "dimension": "relation",
                "value": relation_val,
                "z_score": float(relation_z),
                "type": "high" if relation_z > 0 else "low"
            })
        
        if anomaly_details:
            anomalies.append({
                "asset_id": asset.get("id"),
                "asset_name": asset.get("name"),
                "anomaly_count": len(anomaly_details),
                "max_z_score": max(abs(d["z_score"]) for d in anomaly_details),
                "details": anomaly_details
            })
    
    # 按异常程度排序
    anomalies.sort(key=lambda x: x["max_z_score"], reverse=True)
    
    return anomalies


def calculate_region_energies(assets: List[Dict], boundaries: Dict[str, List[float]]) -> List[Dict]:
    """
    计算所有资产的势能，并标注区域
    
    Returns:
        带势能信息的资产列表
    """
    results = []
    
    for asset in assets:
        shi_energy = calculate_shi_energy(asset, boundaries)
        
        # 根据百分位确定区域 (1-6)
        yao_index = shi_energy["yao"]["index"]
        region = yao_index + 1  # 区域编号 1-6
        
        results.append({
            **asset,
            "shi_energy": shi_energy,
            "region": region,
            "region_name": YAO_TYPES[yao_index]
        })
    
    return results
