// ===== Stage 4: 价值分配网络 - 修复版 =====
let valueScene, valueCamera, valueRenderer;
let valueNodes = [], valueConnections = [], valueParticles = [];
let isDragging = false;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;

function initValue3D() {
    const canvas = document.getElementById('value3dCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    valueScene = new THREE.Scene();
    valueScene.fog = new THREE.FogExp2(0x0a0a1a, 0.01);
    
    valueCamera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    valueCamera.position.set(0, 35, 85);
    
    valueRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    valueRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    
    // 灯光
    valueScene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl = new THREE.PointLight(0xffd700, 1.5, 200);
    pl.position.set(0, 50, 50);
    valueScene.add(pl);
    
    buildValueNetwork();
    
    canvas.addEventListener('mousedown', onValueMouseDown);
    canvas.addEventListener('mousemove', onValueMouseMove);
    canvas.addEventListener('mouseup', onValueMouseUp);
    canvas.addEventListener('wheel', onValueWheel);
    
    animateValue3D();
}

function buildValueNetwork() {
    // 清除
    valueNodes.forEach(n => valueScene.remove(n.mesh));
    valueConnections.forEach(c => valueScene.remove(c.line));
    valueParticles.forEach(p => valueScene.remove(p.mesh));
    valueNodes = [];
    valueConnections = [];
    valueParticles = [];
    
    // 获取已铸造资产 - 直接使用全局 assets 数组
    const mintedAssets = typeof assets !== 'undefined' ? assets.filter(a => a.minted) : [];
    const neuroBlok = typeof assets !== 'undefined' ? assets.find(a => a.id === 'NeuroBlok') : null;
    const hasFusion = neuroBlok && neuroBlok.minted;
    
    console.log('Stage 4 - Minted count:', mintedAssets.length);
    console.log('Stage 4 - Assets:', mintedAssets.map(a => a.id));
    
    // 如果没有铸造资产，显示提示
    if (mintedAssets.length === 0) {
        console.warn('No minted assets found!');
        // 创建提示文本
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, 512, 128);
        ctx.font = 'bold 32px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.textAlign = 'center';
        ctx.fillText('请先铸造资产', 256, 70);
        
        const tex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: tex });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(0, 0, 0);
        sprite.scale.set(20, 5, 1);
        valueScene.add(sprite);
        return;
    }
    
    const totalRevenue = 100;
    
    // 中心新药
    createValueNode('root', '💊', '新药上市', totalRevenue, 0xffd700, 0, 0, 0, 5, 'drug', null);
    
    // NeuroBlok
    if (hasFusion) {
        createValueNode('neuroblok', '✨', 'NeuroBlok', totalRevenue * 0.4, 0x00f0ff, 0, 0, -20, 3.5, 'collaboration', neuroBlok);
        createValueConnection(0, 0, 0, 0, 0, -20, 0x00f0ff);
    }
    
    // 分子资产 - 环形分布
    const baseAssets = mintedAssets.filter(a => a.id !== 'NeuroBlok');
    const radius = 40;
    
    baseAssets.forEach((asset, i) => {
        const angle = (i / Math.max(baseAssets.length, 1)) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        let revenue = (asset.value / 20) * totalRevenue * 0.6;
        if (hasFusion && neuroBlok.generatedFrom && neuroBlok.generatedFrom.includes(asset.id)) {
            const sources = neuroBlok.generatedFrom.split('+');
            revenue = (totalRevenue * 0.4 / sources.length) * 0.5;
        }
        
        createValueNode(asset.id, asset.icon, asset.name, revenue, asset.colorHex, x, 0, z, 2.5, asset.type, asset);
        
        // 连线
        if (hasFusion && neuroBlok.generatedFrom && neuroBlok.generatedFrom.includes(asset.id)) {
            createValueConnection(x, 0, z, 0, 0, -20, asset.colorHex);
        } else {
            createValueConnection(x, 0, z, 0, 0, 0, asset.colorHex);
        }
    });
    
    // 显示第一个详情
    if (valueNodes.length > 0) {
        showValueNodeDetail(valueNodes[0].mesh.userData);
    }
}

function createValueNode(id, icon, name, value, color, x, y, z, scale, type, asset) {
    const group = new THREE.Group();
    
    // 分子模型
    let molecule;
    try {
        if (type === 'drug') {
            molecule = createMolecule('drug', color, scale);
        } else if (type === 'collaboration') {
            molecule = createMolecule('collaboration', color, scale);
        } else {
            molecule = createMolecule(type || 'compound', color, scale);
        }
    } catch (e) {
        console.error('Error creating molecule:', e);
        // 备用：简单球体
        molecule = new THREE.Mesh(
            new THREE.SphereGeometry(scale, 32, 32),
            new THREE.MeshPhongMaterial({ color: color, emissive: color, emissiveIntensity: 0.3 })
        );
    }
    group.add(molecule);
    
    // 光晕
    const glow = new THREE.Mesh(
        new THREE.SphereGeometry(scale * 3, 32, 32),
        new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.12 })
    );
    group.add(glow);
    
    // 光源
    const light = new THREE.PointLight(color, 0.6, 30);
    group.add(light);
    
    group.position.set(x, y, z);
    group.userData = { id, icon, name, value, color, asset };
    
    valueScene.add(group);
    valueNodes.push({ mesh: group, data: { id, asset } });
    console.log('Created node:', id, 'at', x, y, z);
}

function createValueConnection(x1, y1, z1, x2, y2, z2, color) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(x1, y1, z1),
        new THREE.Vector3(x2, y2, z2)
    ]);
    const material = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.4 });
    const line = new THREE.Line(geometry, material);
    valueScene.add(line);
    valueConnections.push(line);
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
    console.log('renderValueNetwork called');
    if (!valueScene) {
        initValue3D();
    } else {
        buildValueNetwork();
    }
}