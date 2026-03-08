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
    
    // ===== 顶层：新药（最大，最亮） =====
    nodesData.push({
        id: 'root',
        icon: '💊',
        label: '新药上市',
        value: totalRevenue,
        color: 0xffd700,
        position: new THREE.Vector3(0, 40, 0),
        asset: null,
        scale: 4,
        layer: 0
    });
    
    // ===== 第二层：NeuroBlok（如果有） =====
    if (hasFusion) {
        nodesData.push({
            id: 'neuroblok',
            icon: '✨',
            label: 'NeuroBlok',
            name: neuroBlok.name,
            value: neuroBlokRevenue,
            color: 0x00f0ff,
            position: new THREE.Vector3(0, 15, 0),
            asset: neuroBlok,
            scale: 3,
            layer: 1
        });
    }
    
    // ===== 第三层：分子资产（最底层，大范围展开） =====
    const baseAssets = mintedAssets.filter(a => a.id !== 'NeuroBlok');
    const baseRadius = 60; // 超大气半径
    const baseY = -25; // 底层高度
    
    baseAssets.forEach((asset, i) => {
        const angle = (i / Math.max(baseAssets.length, 1)) * Math.PI * 2;
        // 随机半径变化，更自然
        const r = baseRadius + (Math.random() - 0.5) * 15;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        // 轻微高度变化
        const y = baseY + Math.sin(i * 1.5) * 8;
        
        // 计算收益
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
            scale: 2.2,
            layer: 2
        });
    });
    
    // 创建节点
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
        
        // 柔和辉光
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(nodeData.scale * 4, 32, 32),
            new THREE.MeshBasicMaterial({
                color: nodeData.color,
                transparent: true,
                opacity: nodeData.layer === 0 ? 0.15 : 0.1
            })
        );
        molecule.add(glow);
        
        // 光源
        const light = new THREE.PointLight(nodeData.color, nodeData.layer === 0 ? 2 : 1, 60);
        molecule.add(light);
        
        valueScene.add(molecule);
        valueNodes.push({ mesh: molecule, data: nodeData });
    });
    
    // 创建树状连线
    baseAssets.forEach(asset => {
        if (hasFusion && neuroBlok.generatedFrom && neuroBlok.generatedFrom.includes(asset.id)) {
            // 通过 NeuroBlok 连接
            createTreeConnection(asset.id, 'neuroblok', asset.colorHex);
            createTreeConnection('neuroblok', 'root', 0x00f0ff);
        } else {
            // 直接连接到根
            createTreeConnection(asset.id, 'root', asset.colorHex);
        }
    });
    
    // 环境
    createTreeAmbient();
    
    if (nodesData.length > 0) {
        showValueNodeDetail(nodesData[0]);
    }
}

// 树状连接线 - 垂直感
function createTreeConnection(fromId, toId, color) {
    const fromNode = valueNodes.find(n => n.data.id === fromId);
    const toNode = valueNodes.find(n => n.data.id === toId);
    if (!fromNode || !toNode) return;
    
    const start = fromNode.data.position;
    const end = toNode.data.position;
    
    // 垂直向上汇聚的曲线
    const midY = (start.y + end.y) / 2;
    const control = new THREE.Vector3(
        start.x * 0.3 + end.x * 0.7,
        midY,
        start.z * 0.3 + end.z * 0.7
    );
    
    const curve = new THREE.QuadraticBezierCurve3(start, control, end);
    const points = curve.getPoints(60);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.35
    });
    
    const line = new THREE.Line(geometry, material);
    valueScene.add(line);
    valueConnections.push({ line, from: fromNode, to: toNode });
    
    // 缓慢上升的光点
    for (let i = 0; i < 3; i++) {
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 })
        );
        valueScene.add(particle);
        
        valueParticles.push({
            mesh: particle,
            curve: curve,
            t: i / 3,
            speed: 0.0002 + i * 0.00005
        });
    }
}

// 环境
function createTreeAmbient() {
    // 背景星星
    const count = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    
    for (let i = 0; i < count; i++) {
        const r = 100 + Math.random() * 50;
        const theta = Math.random() * Math.PI * 2;
        const y = (Math.random() - 0.5) * 120;
        
        positions.push(
            r * Math.cos(theta),
            y,
            r * Math.sin(theta)
        );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.8,
        color: 0xffffff,
        transparent: true,
        opacity: 0.3
    });
    
    valueScene.add(new THREE.Points(geometry, material));
}`;

const startMark = 'function buildValueNetwork() {';
const endMark = 'function createElegantConnection(fromId, toId, color) {';

const startIdx = content.indexOf(startMark);
const endIdx = content.indexOf(endMark);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newStage4 + '\n\n' + content.substring(endIdx);
    fs.writeFileSync(file, content);
    console.log('Success');
} else {
    console.log('Markers not found');
}
