const fs = require('fs');

const file = '/root/.openclaw/workspace/echo-sandbox/echo-final-perfect.html';
let content = fs.readFileSync(file, 'utf8');

// 新的 Stage 4 实现 - 大气、简洁、无闪烁
const newStage4 = `function buildValueNetwork() {
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
    
    // 中心 - 新药上市（超大，像恒星）
    nodesData.push({
        id: 'root',
        icon: '💊',
        label: '新药上市',
        value: totalRevenue,
        color: 0xffd700,
        position: new THREE.Vector3(0, 20, 0),
        asset: null,
        scale: 2.5
    });
    
    // 所有资产在同一层环形分布，超大半径
    const allAssets = mintedAssets.filter(a => a.id !== 'NeuroBlok');
    const orbitRadius = 50; // 超大半径
    
    allAssets.forEach((asset, i) => {
        const angle = (i / Math.max(allAssets.length, 1)) * Math.PI * 2;
        const x = Math.cos(angle) * orbitRadius;
        const z = Math.sin(angle) * orbitRadius;
        
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
            position: new THREE.Vector3(x, 0, z),
            asset: asset,
            scale: 1.5
        });
    });
    
    // NeuroBlok 放在内圈
    if (hasFusion) {
        nodesData.push({
            id: 'neuroblok',
            icon: '✨',
            label: 'NeuroBlok',
            name: neuroBlok.name,
            value: neuroBlokRevenue,
            color: 0x00f0ff,
            position: new THREE.Vector3(0, 10, -25),
            asset: neuroBlok,
            scale: 2.0
        });
    }
    
    // 创建节点
    nodesData.forEach(nodeData => {
        let molecule;
        if (nodeData.id === 'root') {
            molecule = createMolecule('drug', nodeData.color, nodeData.scale);
        } else if (nodeData.id === 'neuroblok') {
            molecule = createMolecule('collaboration', nodeData.color, nodeData.scale);
        } else if (nodeData.asset) {
            molecule = createMolecule(nodeData.asset.type, nodeData.color, nodeData.scale);
        } else {
            molecule = createMolecule('compound', nodeData.color, nodeData.scale);
        }
        
        molecule.position.copy(nodeData.position);
        molecule.userData = nodeData;
        
        // 柔和的环境光晕
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(nodeData.scale * 3, 32, 32),
            new THREE.MeshBasicMaterial({
                color: nodeData.color,
                transparent: true,
                opacity: 0.08
            })
        );
        molecule.add(glow);
        
        // 静态光源
        const light = new THREE.PointLight(nodeData.color, 0.8, 40);
        molecule.add(light);
        
        valueScene.add(molecule);
        valueNodes.push({ mesh: molecule, data: nodeData });
    });
    
    // 创建优雅的连接线
    allAssets.forEach(asset => {
        createElegantConnection('root', asset.id, asset.colorHex);
    });
    
    if (hasFusion) {
        createElegantConnection('root', 'neuroblok', 0xffd700);
        const sources = neuroBlok.generatedFrom ? neuroBlok.generatedFrom.split('+') : [];
        sources.forEach(sourceId => {
            createElegantConnection('neuroblok', sourceId, 0x00f0ff);
        });
    }
    
    // 静态环境粒子
    createStaticAmbient();
    
    if (nodesData.length > 0) {
        showValueNodeDetail(nodesData[0]);
    }
}

// 优雅的连接线 - 无闪烁
function createElegantConnection(fromId, toId, color) {
    const fromNode = valueNodes.find(n => n.data.id === fromId);
    const toNode = valueNodes.find(n => n.data.id === toId);
    if (!fromNode || !toNode) return;
    
    const start = fromNode.data.position;
    const end = toNode.data.position;
    
    // 贝塞尔曲线，优雅的弧线
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    midPoint.y += 8; // 向上拱起
    
    const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    // 主线条
    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4,
        linewidth: 2
    });
    
    const line = new THREE.Line(geometry, material);
    valueScene.add(line);
    valueConnections.push({ line, from: fromNode, to: toNode });
    
    // 静态光点沿着线
    const particleCount = 5;
    for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount;
        const pos = curve.getPoint(t);
        
        const particle = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.9
            })
        );
        particle.position.copy(pos);
        valueScene.add(particle);
        
        valueParticles.push({
            mesh: particle,
            curve: curve,
            t: t,
            speed: 0.0003
        });
    }
}

// 静态环境
function createStaticAmbient() {
    // 远处静态星星
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    
    for (let i = 0; i < particleCount; i++) {
        const r = 80 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions.push(
            r * Math.sin(phi) * Math.cos(theta),
            r * Math.sin(phi) * Math.sin(theta) * 0.5,
            r * Math.cos(phi)
        );
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.6,
        color: 0xffffff,
        transparent: true,
        opacity: 0.4
    });
    
    const particles = new THREE.Points(geometry, material);
    valueScene.add(particles);
}`;

// 替换函数
const startMark = 'function buildValueNetwork() {';
const endMark = 'function createValueBeam(fromId, toId, color) {';

const startIdx = content.indexOf(startMark);
const endIdx = content.indexOf(endMark);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newStage4 + '\n\n' + content.substring(endIdx);
    fs.writeFileSync(file, content);
    console.log('Done!');
} else {
    console.log('Not found');
}
