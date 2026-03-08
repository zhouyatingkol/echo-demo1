const fs = require('fs');

const file = '/root/.openclaw/workspace/echo-sandbox/echo-final-perfect.html';
let content = fs.readFileSync(file, 'utf8');

// 找到 buildValueNetwork 函数的开始和 createNetworkConnection 函数的开始
const startMark = 'function buildValueNetwork() {';
const endMark = 'function createNetworkConnection(fromId, toId, color) {';

const startIdx = content.indexOf(startMark);
const endIdx = content.indexOf(endMark);

if (startIdx === -1 || endIdx === -1) {
    console.log('Markers not found:', startIdx, endIdx);
    process.exit(1);
}

const newStage4 = `function buildValueNetwork() {
    // 清除所有旧对象
    while(valueScene.children.length > 0){ 
        valueScene.remove(valueScene.children[0]); 
    }
    valueNodes = [];
    valueConnections = [];
    valueParticles = [];
    
    // 重新添加灯光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    valueScene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffd700, 1, 200);
    pointLight.position.set(0, 50, 50);
    valueScene.add(pointLight);
    
    const mintedAssets = assets.filter(a => a.minted);
    const neuroBlok = assets.find(a => a.id === 'NeuroBlok');
    const hasFusion = neuroBlok && neuroBlok.minted;
    
    const totalRevenue = 100;
    
    // 1. 创建中心新药节点
    const rootNode = createValueNode({
        id: 'root',
        icon: '💊',
        label: '新药上市',
        value: totalRevenue,
        color: 0xffd700,
        position: [0, 0, 0],
        scale: 5,
        type: 'drug'
    });
    valueScene.add(rootNode);
    valueNodes.push({ mesh: rootNode, data: { id: 'root', asset: null } });
    
    // 2. 如果有融合，创建 NeuroBlok
    let neuroBlokNode = null;
    if (hasFusion) {
        neuroBlokNode = createValueNode({
            id: 'neuroblok',
            icon: '✨',
            label: 'NeuroBlok',
            name: neuroBlok.name,
            value: totalRevenue * 0.4,
            color: 0x00f0ff,
            position: [0, 0, -30],
            scale: 4,
            type: 'collaboration',
            asset: neuroBlok
        });
        valueScene.add(neuroBlokNode);
        valueNodes.push({ mesh: neuroBlokNode, data: { id: 'neuroblok', asset: neuroBlok } });
        
        // 连接新药 -> NeuroBlok
        createValueLine([0,0,0], [0,0,-30], 0x00f0ff);
    }
    
    // 3. 创建分子资产节点 - 环形分布
    const baseAssets = mintedAssets.filter(a => a.id !== 'NeuroBlok');
    const count = baseAssets.length;
    const radius = 50;
    
    baseAssets.forEach((asset, i) => {
        const angle = (i / Math.max(count, 1)) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        let revenue = (asset.value / 20) * totalRevenue * 0.6;
        if (hasFusion && neuroBlok.generatedFrom && neuroBlok.generatedFrom.includes(asset.id)) {
            const sources = neuroBlok.generatedFrom.split('+');
            revenue = (totalRevenue * 0.4 / sources.length) * 0.5;
        }
        
        const node = createValueNode({
            id: asset.id,
            icon: asset.icon,
            label: asset.id,
            name: asset.name,
            value: revenue,
            color: asset.colorHex,
            position: [x, 0, z],
            scale: 3,
            type: asset.type,
            asset: asset
        });
        
        valueScene.add(node);
        valueNodes.push({ mesh: node, data: { id: asset.id, asset: asset } });
        
        // 连线
        if (hasFusion && neuroBlok.generatedFrom && neuroBlok.generatedFrom.includes(asset.id)) {
            createValueLine([x,0,z], [0,0,-30], asset.colorHex);
        } else {
            createValueLine([x,0,z], [0,0,0], asset.colorHex);
        }
    });
    
    // 默认显示第一个详情
    if (valueNodes.length > 0) {
        showValueNodeDetail(valueNodes[0].mesh.userData);
    }
}

// 创建节点
function createValueNode(props) {
    const group = new THREE.Group();
    
    // 分子模型
    let molecule;
    if (props.type === 'drug') {
        molecule = createMolecule('drug', props.color, props.scale);
    } else if (props.type === 'collaboration') {
        molecule = createMolecule('collaboration', props.color, props.scale);
    } else {
        molecule = createMolecule(props.type || 'compound', props.color, props.scale);
    }
    group.add(molecule);
    
    // 光晕
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(props.scale * 3, 32, 32),
        new THREE.MeshBasicMaterial({
            color: props.color,
            transparent: true,
            opacity: 0.15
        })
    );
    group.add(glow);
    
    // 光源
    const light = new THREE.PointLight(props.color, 0.8, 40);
    group.add(light);
    
    // 位置
    group.position.set(...props.position);
    group.userData = props;
    
    return group;
}

// 创建连线
function createValueLine(start, end, color) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(...start),
        new THREE.Vector3(...end)
    ]);
    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.4
    });
    const line = new THREE.Line(geometry, material);
    valueScene.add(line);
    valueConnections.push(line);
    
    // 流动粒子
    for (let i = 0; i < 2; i++) {
        const p = new THREE.Mesh(
            new THREE.SphereGeometry(0.4, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        valueScene.add(p);
        valueParticles.push({
            mesh: p,
            from: new THREE.Vector3(...start),
            to: new THREE.Vector3(...end),
            t: i * 0.5,
            speed: 0.005
        });
    }
}

`;

content = content.substring(0, startIdx) + newStage4 + content.substring(endIdx);
fs.writeFileSync(file, content);
console.log('Rebuilt successfully');
