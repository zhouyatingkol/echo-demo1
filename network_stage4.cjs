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
    
    // 中心核心 - 新药（网络中心）
    nodesData.push({
        id: 'root',
        icon: '💊',
        label: '新药上市',
        value: totalRevenue,
        color: 0xffd700,
        position: new THREE.Vector3(0, 0, 0),
        asset: null,
        scale: 4,
        layer: 'center'
    });
    
    // 如果有融合，NeuroBlok 放在内环
    if (hasFusion) {
        nodesData.push({
            id: 'neuroblok',
            icon: '✨',
            label: 'NeuroBlok',
            name: neuroBlok.name,
            value: neuroBlokRevenue,
            color: 0x00f0ff,
            position: new THREE.Vector3(0, 0, -20),
            asset: neuroBlok,
            scale: 3,
            layer: 'inner'
        });
    }
    
    // 分子资产 - 外环网络分布
    const baseAssets = mintedAssets.filter(a => a.id !== 'NeuroBlok');
    const outerRadius = 55;
    const innerRadius = 28;
    
    baseAssets.forEach((asset, i) => {
        const angle = (i / Math.max(baseAssets.length, 1)) * Math.PI * 2;
        
        // 如果是 NeuroBlok 的来源，放内环；其他放外环
        const isSource = hasFusion && neuroBlok.generatedFrom && neuroBlok.generatedFrom.includes(asset.id);
        const r = isSource ? innerRadius : outerRadius;
        const y = isSource ? (Math.random() - 0.5) * 15 : (Math.random() - 0.5) * 25;
        
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        
        let revenue;
        if (isSource) {
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
            scale: isSource ? 2.2 : 2.5,
            layer: isSource ? 'inner' : 'outer',
            isSource: isSource
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
        
        // 光晕大小根据层级
        const glowSize = nodeData.layer === 'center' ? 6 : (nodeData.layer === 'inner' ? 4 : 5);
        const glow = new THREE.Mesh(
            new THREE.SphereGeometry(glowSize, 32, 32),
            new THREE.MeshBasicMaterial({
                color: nodeData.color,
                transparent: true,
                opacity: nodeData.layer === 'center' ? 0.2 : 0.1
            })
        );
        molecule.add(glow);
        
        // 光源
        const light = new THREE.PointLight(nodeData.color, nodeData.layer === 'center' ? 2 : 0.8, 60);
        molecule.add(light);
        
        valueScene.add(molecule);
        valueNodes.push({ mesh: molecule, data: nodeData });
    });
    
    // 网络连线 - 根据关系连接
    baseAssets.forEach(asset => {
        const node = nodesData.find(n => n.id === asset.id);
        if (node.isSource && hasFusion) {
            // 来源资产 -> NeuroBlok
            createNetworkConnection(asset.id, 'neuroblok', asset.colorHex);
            // NeuroBlok -> 新药（避免重复，只连一次）
            if (!node.alreadyConnected) {
                createNetworkConnection('neuroblok', 'root', 0x00f0ff);
                node.alreadyConnected = true;
            }
        } else {
            // 直接连到新药
            createNetworkConnection(asset.id, 'root', asset.colorHex);
        }
    });
    
    createNetworkAmbient();
    
    if (nodesData.length > 0) {
        showValueNodeDetail(nodesData[0]);
    }
}

// 网络连线 - 直线，科技感
function createNetworkConnection(fromId, toId, color) {
    const fromNode = valueNodes.find(n => n.data.id === fromId);
    const toNode = valueNodes.find(n => n.data.id === toId);
    if (!fromNode || !toNode) return;
    
    const start = fromNode.data.position;
    const end = toNode.data.position;
    
    // 直线连接
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        linewidth: 3
    });
    
    const line = new THREE.Line(geometry, material);
    valueScene.add(line);
    valueConnections.push({ line, from: fromNode, to: toNode });
    
    // 流动光点
    for (let i = 0; i < 3; i++) {
        const p = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
        );
        valueScene.add(p);
        valueParticles.push({
            mesh: p,
            from: start,
            to: end,
            t: i / 3,
            speed: 0.0005
        });
    }
}

function createNetworkAmbient() {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    for (let i = 0; i < 100; i++) {
        const r = 80 + Math.random() * 40;
        const theta = Math.random() * Math.PI * 2;
        const phi = (Math.random() - 0.5) * Math.PI;
        positions.push(
            r * Math.cos(theta) * Math.cos(phi),
            r * Math.sin(phi),
            r * Math.sin(theta) * Math.cos(phi)
        );
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    valueScene.add(new THREE.Points(geometry, new THREE.PointsMaterial({
        size: 0.6, color: 0xffffff, transparent: true, opacity: 0.2
    })));
}`;

const startMark = 'function buildValueNetwork() {';
const endMark = 'function createFanConnection(fromId, toId, color) {';

const startIdx = content.indexOf(startMark);
const endIdx = content.indexOf(endMark);

if (startIdx !== -1 && endIdx !== -1) {
    content = content.substring(0, startIdx) + newStage4 + '\n\n' + content.substring(endIdx);
    fs.writeFileSync(file, content);
    console.log('Success');
} else {
    console.log('Not found');
}
