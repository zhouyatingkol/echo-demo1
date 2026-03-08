const fs = require('fs');

const file = '/root/.openclaw/workspace/echo-sandbox/echo-final-perfect.html';
let content = fs.readFileSync(file, 'utf8');

const newStage4 = `function buildValueNetwork() {
    // 清除
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
    
    // 中心 - 新药（金色，主导）
    nodesData.push({
        id: 'root',
        icon: '💊',
        label: '新药上市',
        value: totalRevenue,
        color: 0xffd700,
        position: new THREE.Vector3(0, 18, 0),
        asset: null,
        scale: 3.5,
        layer: 0
    });
    
    // NeuroBlok（青色，次中心）
    if (hasFusion) {
        nodesData.push({
            id: 'neuroblok',
            icon: '✨',
            label: 'NeuroBlok',
            name: neuroBlok.name,
            value: neuroBlokRevenue,
            color: 0x00f0ff,
            position: new THREE.Vector3(0, 0, 0),
            asset: neuroBlok,
            scale: 2.8,
            layer: 1
        });
    }
    
    // 分子资产 - 扇形展开在底部
    const baseAssets = mintedAssets.filter(a => a.id !== 'NeuroBlok');
    const fanRadius = 45;
    const fanAngle = Math.PI * 0.8; // 144度扇形
    const startAngle = -fanAngle / 2;
    
    baseAssets.forEach((asset, i) => {
        const t = baseAssets.length > 1 ? i / (baseAssets.length - 1) : 0.5;
        const angle = startAngle + t * fanAngle;
        const r = fanRadius;
        const x = Math.sin(angle) * r;
        const z = Math.cos(angle) * r * 0.5; // 压扁一点，更有透视
        const y = -20;
        
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
            scale: 2.5,
            layer: 2
        });
    });
    
    // 创建节点 - 大模型，明显旋转
    nodesData.forEach(nodeData => {
        let molecule;
        if (nodeData.id === 'root') {
            molecule = createMolecule('drug', nodeData.color, nodeData.scale);
        } else if (nodeData.id === 'neuroblok') {
            molecule = createMolecule('collaboration', nodeData.color, nodeData.scale);
        } else if (nodeData.asset) {
            molecule = createMolecule(nodeData.asset.type, nodeData.color, nodeData.scale);
        }
        
        molecule.position.copy(nodeData.position);
        molecule.userData = nodeData;
        
        // 柔和光晕
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(nodeData.scale * 3.5, 32, 32),
            new THREE.MeshBasicMaterial({
                color: nodeData.color,
                transparent: true,
                opacity: 0.12
            })
        );
        molecule.add(glow);
        
        // 光源
        const light = new THREE.PointLight(nodeData.color, 0.6, 50);
        molecule.add(light);
        
        valueScene.add(molecule);
        valueNodes.push({ mesh: molecule, data: nodeData });
    });
    
    // 扇形连线
    baseAssets.forEach(asset => {
        if (hasFusion && neuroBlok.generatedFrom && neuroBlok.generatedFrom.includes(asset.id)) {
            createFanConnection(asset.id, 'neuroblok', asset.colorHex);
            createFanConnection('neuroblok', 'root', 0x00f0ff);
        } else {
            createFanConnection(asset.id, 'root', asset.colorHex);
        }
    });
    
    // 环境
    createFanAmbient();
    
    if (nodesData.length > 0) {
        showValueNodeDetail(nodesData[0]);
    }
}

// 扇形曲线连线
function createFanConnection(fromId, toId, color) {
    const fromNode = valueNodes.find(n => n.data.id === fromId);
    const toNode = valueNodes.find(n => n.data.id === toId);
    if (!fromNode || !toNode) return;
    
    const start = fromNode.data.position;
    const end = toNode.data.position;
    
    // 优雅的弧线
    const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    mid.y += 8;
    
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4
    });
    
    const line = new THREE.Line(geometry, material);
    valueScene.add(line);
    valueConnections.push({ line, from: fromNode, to: toNode });
    
    // 光点
    for (let i = 0; i < 4; i++) {
        const p = new THREE.Mesh(
            new THREE.SphereGeometry(0.6, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
        );
        valueScene.add(p);
        valueParticles.push({ mesh: p, curve: curve, t: i / 4, speed: 0.0003 });
    }
}

function createFanAmbient() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 80; i++) {
        positions.push(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 80
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    valueScene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
        size: 0.7, color: 0xffffff, transparent: true, opacity: 0.25
    })));
}`;

const startMark = 'function buildValueNetwork() {';
const endMark = 'function createTreeConnection(fromId, toId, color) {';

const startIdx = content.indexOf(startMark);
const endIdx = content.indexOf(endMark);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newStage4 + '\n\n' + content.substring(endIdx);
    fs.writeFileSync(file, content);
    console.log('Done');
} else {
    console.log('Not found:', startIdx, endIdx);
}
