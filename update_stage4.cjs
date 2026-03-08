const fs = require('fs');

const file = '/root/.openclaw/workspace/echo-sandbox/echo-final-perfect.html';
let content = fs.readFileSync(file, 'utf8');

// 新的buildValueNetwork函数
const newBuildFunction = `function buildValueNetwork() {
    // 清除旧节点
    valueNodes.forEach(n => valueScene.remove(n.mesh));
    valueConnections.forEach(c => valueScene.remove(c.line));
    valueParticles.forEach(p => valueScene.remove(p.mesh));
    valueNodes = [];
    valueConnections = [];
    valueParticles = [];
    
    const mintedAssets = assets.filter(a => a.minted);
    const neuroBlok = assets.find(a => a.id === 'NeuroBlok');
    const hasFusion = neuroBlok && neuroBlok.minted;
    
    const totalRevenue = 100;
    const neuroBlokRevenue = hasFusion ? totalRevenue * 0.4 : 0;
    
    const nodesData = [];
    
    // 中心 - 新药上市（像太阳一样在高处）
    nodesData.push({
        id: 'root',
        icon: '💊',
        label: '新药上市',
        value: totalRevenue,
        color: 0xffd700,
        position: new THREE.Vector3(0, 15, 0),
        asset: null,
        size: 5
    });
    
    // 第一层轨道 - 主要资产（半径25，高度变化形成层次感）
    const layer1Assets = mintedAssets.filter(a => a.id !== 'NeuroBlok');
    const layer1Radius = 28;
    
    layer1Assets.forEach((asset, i) => {
        const angle = (i / Math.max(layer1Assets.length, 1)) * Math.PI * 2;
        const heightOffset = Math.sin(i * 0.8) * 5;
        const x = Math.cos(angle) * layer1Radius;
        const z = Math.sin(angle) * layer1Radius;
        const y = -5 + heightOffset;
        
        let revenue;
        if (hasFusion && neuroBlok.generatedFrom && neuroBlok.generatedFrom.includes(asset.id)) {
            const sources = neuroBlok.generatedFrom.split('+');
            revenue = (neuroBlokRevenue / sources.length) * 0.5;
        } else {
            revenue = (asset.value / 20) * (totalRevenue - neuroBlokRevenue);
        }
        
        nodesData.push({
            id: asset.id,
            icon: asset.icon,
            label: asset.id,
            name: asset.name,
            value: revenue,
            color: asset.colorHex,
            position: new THREE.Vector3(x, y, z),
            asset: asset,
            size: 2.8
        });
    });
    
    // NeuroBlok在内外层之间
    if (hasFusion) {
        nodesData.push({
            id: 'neuroblok',
            icon: '✨',
            label: 'NeuroBlok',
            name: neuroBlok.name,
            value: neuroBlokRevenue,
            color: 0x00f0ff,
            position: new THREE.Vector3(0, 5, -12),
            asset: neuroBlok,
            size: 4
        });
    }
    
    // 创建3D节点 - 高级材质
    nodesData.forEach((nodeData, index) => {
        const group = new THREE.Group();
        
        // 核心球体 - 使用物理材质
        const coreGeometry = new THREE.SphereGeometry(nodeData.size, 64, 64);
        const coreMaterial = new THREE.MeshPhysicalMaterial({
            color: nodeData.color,
            emissive: nodeData.color,
            emissiveIntensity: nodeData.id === 'root' ? 1.0 : 0.5,
            metalness: 0.8,
            roughness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);
        
        // 内层辉光
        const innerGlow = new THREE.Mesh(
            new THREE.SphereGeometry(nodeData.size * 1.5, 32, 32),
            new THREE.MeshBasicMaterial({
                color: nodeData.color,
                transparent: true,
                opacity: 0.4,
                blending: THREE.AdditiveBlending
            })
        );
        group.add(innerGlow);
        
        // 外层大气辉光
        const outerGlow = new THREE.Mesh(
            new THREE.SphereGeometry(nodeData.size * 2.5, 32, 32),
            new THREE.MeshBasicMaterial({
                color: nodeData.color,
                transparent: true,
                opacity: 0.15,
                blending: THREE.AdditiveBlending
            })
        );
        group.add(outerGlow);
        
        // 根节点特殊光晕
        if (nodeData.id === 'root') {
            const halo = new THREE.Mesh(
                new THREE.SphereGeometry(nodeData.size * 5, 32, 32),
                new THREE.MeshBasicMaterial({
                    color: 0xffaa00,
                    transparent: true,
                    opacity: 0.06,
                    blending: THREE.AdditiveBlending
                })
            );
            group.add(halo);
        }
        
        // 强光源
        const light = new THREE.PointLight(nodeData.color, nodeData.id === 'root' ? 3 : 1.5, 80);
        light.position.set(0, 0, 0);
        group.add(light);
        
        group.position.copy(nodeData.position);
        group.userData = nodeData;
        
        valueScene.add(group);
        valueNodes.push({ mesh: group, data: nodeData });
    });
    
    // 创建价值流动光束
    layer1Assets.forEach(asset => {
        createValueBeam('root', asset.id, asset.colorHex);
    });
    
    if (hasFusion) {
        createValueBeam('root', 'neuroblok', 0xffd700);
        const sources = neuroBlok.generatedFrom ? neuroBlok.generatedFrom.split('+') : [];
        sources.forEach(sourceId => {
            createValueBeam('neuroblok', sourceId, 0x00f0ff);
        });
    }
    
    createAmbientParticles();
    
    if (nodesData.length > 0) {
        showValueNodeDetail(nodesData[0]);
    }
}

// 创建价值流动光束
function createValueBeam(fromId, toId, color) {
    const fromNode = valueNodes.find(n => n.data.id === fromId);
    const toNode = valueNodes.find(n => n.data.id === toId);
    if (!fromNode || !toNode) return;
    
    const start = fromNode.data.position;
    const end = toNode.data.position;
    const distance = start.distanceTo(end);
    
    const direction = new THREE.Vector3().subVectors(end, start).normalize();
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    // 主光束
    const beamGeometry = new THREE.CylinderGeometry(0.12, 0.2, distance, 8, 1, true);
    const beamMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
    });
    
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.copy(midPoint);
    beam.lookAt(end);
    beam.rotateX(Math.PI / 2);
    
    valueScene.add(beam);
    valueConnections.push({ mesh: beam, from: fromNode, to: toNode });
    
    // 流动粒子
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.35, 16, 16);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            emissive: color,
            emissiveIntensity: 2
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        
        valueParticles.push({
            mesh: particle,
            from: start,
            to: end,
            progress: i / particleCount,
            speed: 0.002 + Math.random() * 0.002
        });
        
        valueScene.add(particle);
    }
}

// 环境粒子
function createAmbientParticles() {
    const particleCount = 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const r = 35 + Math.random() * 25;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
        positions[i * 3 + 2] = r * Math.cos(phi);
        
        const isGold = Math.random() > 0.5;
        colors[i * 3] = isGold ? 1 : 0;
        colors[i * 3 + 1] = isGold ? 0.85 : 0.9;
        colors[i * 3 + 2] = isGold ? 0.2 : 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.4,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
    });
    
    const particles = new THREE.Points(geometry, material);
    valueScene.add(particles);
}`;

// 找到并替换buildValueNetwork函数
const startMarker = 'function buildValueNetwork() {';
const endMarker = 'function createValueConnection(fromId, toId, color) {';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newBuildFunction + '\n\n' + content.substring(endIdx);
    fs.writeFileSync(file, content);
    console.log('Successfully replaced buildValueNetwork and related functions');
} else {
    console.log('Markers not found:', startIdx, endIdx);
}
