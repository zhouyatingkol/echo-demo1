const fs = require('fs');

const file = '/root/.openclaw/workspace/echo-sandbox/echo-final-perfect.html';
let content = fs.readFileSync(file, 'utf8');

const cleanCode = `// ===== Stage 4: 价值分配网络 =====
let valueScene, valueCamera, valueRenderer;
let valueNodes = [], valueConnections = [], valueParticles = [];
let isDragging = false;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;

function initValue3D() {
    const canvas = document.getElementById('value3dCanvas');
    if (!canvas) return;
    
    valueScene = new THREE.Scene();
    valueScene.fog = new THREE.FogExp2(0x0a0a1a, 0.01);
    
    valueCamera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    valueCamera.position.set(0, 30, 80);
    
    valueRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    valueRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    valueRenderer.setPixelRatio(window.devicePixelRatio);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    valueScene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffd700, 1.5, 200);
    pointLight.position.set(0, 50, 50);
    valueScene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0x00f0ff, 1, 200);
    pointLight2.position.set(-50, 30, -50);
    valueScene.add(pointLight2);
    
    buildValueNetwork();
    
    canvas.addEventListener('mousedown', onValueMouseDown);
    canvas.addEventListener('mousemove', onValueMouseMove);
    canvas.addEventListener('mouseup', onValueMouseUp);
    canvas.addEventListener('wheel', onValueWheel);
    
    animateValue3D();
}

function buildValueNetwork() {
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
    
    // 中心 - 新药
    createValueNode({
        id: 'root',
        icon: '💊',
        label: '新药上市',
        value: totalRevenue,
        color: 0xffd700,
        x: 0, y: 0, z: 0,
        scale: 4,
        type: 'drug'
    });
    
    // NeuroBlok
    if (hasFusion) {
        createValueNode({
            id: 'neuroblok',
            icon: '✨',
            label: 'NeuroBlok',
            name: neuroBlok.name,
            value: neuroBlokRevenue,
            color: 0x00f0ff,
            x: 0, y: 0, z: -25,
            scale: 3,
            type: 'collaboration',
            asset: neuroBlok
        });
        createValueConnection([0,0,0], [0,0,-25], 0x00f0ff);
    }
    
    // 分子资产 - 环形分布
    const baseAssets = mintedAssets.filter(a => a.id !== 'NeuroBlok');
    const radius = 45;
    
    baseAssets.forEach((asset, i) => {
        const angle = (i / Math.max(baseAssets.length, 1)) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        let revenue = (asset.value / 20) * (totalRevenue - neuroBlokRevenue);
        if (hasFusion && neuroBlok.generatedFrom && neuroBlok.generatedFrom.includes(asset.id)) {
            const sources = neuroBlok.generatedFrom.split('+');
            revenue = (neuroBlokRevenue / sources.length) * 0.5;
        }
        
        createValueNode({
            id: asset.id,
            icon: asset.icon,
            label: asset.id,
            name: asset.name,
            value: revenue,
            color: asset.colorHex,
            x: x, y: 0, z: z,
            scale: 2.5,
            type: asset.type,
            asset: asset
        });
        
        if (hasFusion && neuroBlok.generatedFrom && neuroBlok.generatedFrom.includes(asset.id)) {
            createValueConnection([x,0,z], [0,0,-25], asset.colorHex);
        } else {
            createValueConnection([x,0,z], [0,0,0], asset.colorHex);
        }
    });
    
    if (valueNodes.length > 0) {
        showValueNodeDetail(valueNodes[0].mesh.userData);
    }
}

function createValueNode(props) {
    const group = new THREE.Group();
    
    let molecule;
    if (props.type === 'drug') {
        molecule = createMolecule('drug', props.color, props.scale);
    } else if (props.type === 'collaboration') {
        molecule = createMolecule('collaboration', props.color, props.scale);
    } else {
        molecule = createMolecule(props.type, props.color, props.scale);
    }
    group.add(molecule);
    
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(props.scale * 2.5, 32, 32),
        new THREE.MeshBasicMaterial({
            color: props.color,
            transparent: true,
            opacity: 0.15
        })
    );
    group.add(glow);
    
    const light = new THREE.PointLight(props.color, 0.6, 30);
    group.add(light);
    
    group.position.set(props.x, props.y, props.z);
    group.userData = props;
    
    valueScene.add(group);
    valueNodes.push({ mesh: group, data: { id: props.id, asset: props.asset } });
}

function createValueConnection(start, end, color) {
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
    
    for (let i = 0; i < 3; i++) {
        const p = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        valueScene.add(p);
        valueParticles.push({
            mesh: p,
            from: new THREE.Vector3(...start),
            to: new THREE.Vector3(...end),
            t: i / 3,
            speed: 0.003
        });
    }
}

function animateValue3D() {
    requestAnimationFrame(animateValue3D);
    if (!valueRenderer || !valueScene || !valueCamera) return;
    
    if (!isDragging) {
        valueScene.rotation.y += 0.0005;
    }
    
    valueScene.rotation.x += (targetRotationX - valueScene.rotation.x) * 0.05;
    valueScene.rotation.y += (targetRotationY - valueScene.rotation.y) * 0.05;
    
    valueParticles.forEach(p => {
        p.t += p.speed;
        if (p.t > 1) p.t = 0;
        p.mesh.position.lerpVectors(p.from, p.to, p.t);
    });
    
    valueNodes.forEach(node => {
        node.mesh.rotation.y += 0.005;
    });
    
    valueRenderer.render(valueScene, valueCamera);
}

function onValueMouseDown(event) {
    isDragging = true;
    mouseX = event.clientX;
    mouseY = event.clientY;
    
    const rect = valueRenderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, valueCamera);
    
    const intersects = raycaster.intersectObjects(valueScene.children, true);
    
    if (intersects.length > 0) {
        let target = intersects[0].object;
        while (target.parent && target.parent.type !== 'Scene') {
            if (target.userData && target.userData.id) break;
            target = target.parent;
        }
        if (target.userData && target.userData.id) {
            showValueNodeDetail(target.userData);
        }
    }
}

function onValueMouseMove(event) {
    if (!isDragging) return;
    targetRotationY += (event.clientX - mouseX) * 0.01;
    targetRotationX += (event.clientY - mouseY) * 0.01;
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onValueMouseUp() {
    isDragging = false;
}

function onValueWheel(event) {
    event.preventDefault();
    valueCamera.position.z += event.deltaY * 0.1;
    valueCamera.position.z = Math.max(30, Math.min(150, valueCamera.position.z));
}

function renderValueNetwork() {
    if (!valueScene) {
        initValue3D();
    } else {
        buildValueNetwork();
    }
}`;

// 找到 Stage 4 代码块替换
const startMark = '// ===== Stage 4:';
const endMark = '// 初始化';

const startIdx = content.indexOf(startMark);
const endIdx = content.indexOf(endMark);

if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    content = content.substring(0, startIdx) + cleanCode + '\n\n        ' + content.substring(endIdx);
    fs.writeFileSync(file, content);
    console.log('Replaced successfully');
} else {
    console.log('Markers not found:', startIdx, endIdx);
}
