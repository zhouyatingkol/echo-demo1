// 优雅的融合资产模型设计
// 筛选型 - 优雅的分子花
if (fusionType === 'screening' || fusionType.includes('Screening')) {
    // 中心核心
    const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.4 * bigScale, 32, 32),
        new THREE.MeshStandardMaterial({
            color: 0x4488ff,
            emissive: 0x2266cc,
            emissiveIntensity: 0.4,
            roughness: 0.2,
            metalness: 0.3
        })
    );
    fusionGroup.add(core);
    
    // 6个花瓣
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const petal = new THREE.Mesh(
            new THREE.SphereGeometry(0.25 * bigScale, 20, 20),
            new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.5,
                roughness: 0.3
            })
        );
        petal.position.set(
            Math.cos(angle) * 0.8 * bigScale,
            Math.sin(angle * 2) * 0.2 * bigScale,
            Math.sin(angle) * 0.8 * bigScale
        );
        fusionGroup.add(petal);
        
        // 连接线
        const line = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                petal.position
            ]),
            new THREE.LineBasicMaterial({
                color: color,
                opacity: 0.4,
                transparent: true
            })
        );
        fusionGroup.add(line);
    }
    
    // 外层光环
    const ring = new THREE.Mesh(
        new THREE.TorusGeometry(1.1 * bigScale, 0.03 * bigScale, 8, 64),
        new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
        })
    );
    ring.rotation.x = Math.PI / 2;
    fusionGroup.add(ring);
    
} else if (fusionType === 'optimization' || fusionType.includes('Optimization')) {
    // 优化型 - 精致的分子球
    // 核心
    const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.5 * bigScale, 32, 32),
        new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5,
            roughness: 0.2,
            metalness: 0.2
        })
    );
    fusionGroup.add(core);
    
    // 3层轨道球
    for (let layer = 0; layer < 3; layer++) {
        const radius = (0.7 + layer * 0.35) * bigScale;
        const count = 4 + layer * 2;
        
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + layer * 0.5;
            const orbitSphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.15 * bigScale, 16, 16),
                new THREE.MeshStandardMaterial({
                    color: layer === 0 ? 0xffd700 : (layer === 1 ? 0x00ff88 : 0x00f0ff),
                    emissive: layer === 0 ? 0xffaa00 : (layer === 1 ? 0x00cc66 : 0x0088cc),
                    emissiveIntensity: 0.5
                })
            );
            orbitSphere.position.set(
                Math.cos(angle) * radius,
                (Math.random() - 0.5) * 0.3 * bigScale,
                Math.sin(angle) * radius
            );
            fusionGroup.add(orbitSphere);
        }
    }
    
} else if (fusionType === 'candidate' || fusionType.includes('Candidate')) {
    // 候选型 - 优雅的胶囊星
    // 主体胶囊
    const capsuleGroup = new THREE.Group();
    
    // 上半 - 金色
    const top = new THREE.Mesh(
        new THREE.SphereGeometry(0.4 * bigScale, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
            color: 0xffd700,
            emissive: 0xffaa00,
            emissiveIntensity: 0.4,
            roughness: 0.2
        })
    );
    top.position.y = 0.2 * bigScale;
    capsuleGroup.add(top);
    
    // 下半 - 橙色
    const bottom = new THREE.Mesh(
        new THREE.SphereGeometry(0.4 * bigScale, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
        new THREE.MeshStandardMaterial({
            color: 0xff9500,
            emissive: 0xff7700,
            emissiveIntensity: 0.4,
            roughness: 0.2
        })
    );
    bottom.position.y = -0.2 * bigScale;
    capsuleGroup.add(bottom);
    
    fusionGroup.add(capsuleGroup);
    
    // 环绕的星星
    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const star = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.12 * bigScale, 0),
            new THREE.MeshStandardMaterial({
                color: 0xffffff,
                emissive: 0xffffff,
                emissiveIntensity: 0.6
            })
        );
        star.position.set(
            Math.cos(angle) * 0.9 * bigScale,
            Math.sin(angle * 2) * 0.3 * bigScale,
            Math.sin(angle) * 0.9 * bigScale
        );
        fusionGroup.add(star);
    }
}
