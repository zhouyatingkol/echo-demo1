// ===== Stage 4: 3D 价值网络可视化 =====
let valueScene, valueCamera, valueRenderer;
let valueNodes = [], valueConnections = [], valueParticles = [];
let isDragging = false;
let mouseX = 0, mouseY = 0;
let targetRotationX = 0, targetRotationY = 0;

function initValue3D() {
    const canvas = document.getElementById('value3dCanvas');
    if (!canvas) return;
    
    valueScene = new THREE.Scene();
    valueScene.fog = new THREE.FogExp2(0x0a0a1a, 0.015);
    
    valueCamera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    valueCamera.position.set(0, 8, 35);
    valueCamera.lookAt(0, 0, 0);
    
    valueRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    valueRenderer.setSize(canvas.clientWidth, canvas.clientHeight);
    valueRenderer.setPixelRatio(window.devicePixelRatio);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    valueScene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffd700, 1.2, 100);
    pointLight.position.set(10, 20, 10);
    valueScene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0x00f0ff, 0.8, 100);
    pointLight2.position.set(-10, 10, -10);
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
    
    const nodesData = [];
    
    nodesData.push({
        id: 'root',
        icon: '🏥',
        label: '新药上市',
        value: totalRevenue,
        color: 0xffd700,
        position: new THREE.Vector3(0, 10, 0),
        asset: null,
        size: 3
    });
    
    if (hasFusion) {
        nodesData.push({
            id: 'neuroblok',
            icon: '✨',
            label: 'NeuroBlok',
            value: neuroBlokRevenue,
            color: 0x00f0ff,
            position: new THREE.Vector3(0, 2, 0),
            asset: neuroBlok,
            size: 2.5
        });
        
        const sources = neuroBlok.generatedFrom ? neuroBlok.generatedFrom.split('+') : [];
        const angleStep = (Math.PI * 2) / Math.max(sources.length, 1);
        
        sources.forEach((sourceId, i) => {
            const sourceAsset = assets.find(a => a.id === sourceId);
            if (sourceAsset) {
                const angle = angleStep * i;
                const radius = 8;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                const share = 1 / sources.length;
                const revenue = neuroBlokRevenue * share * 0.5;
                
                nodesData.push({
                    id: sourceId,
                    icon: sourceAsset.icon,
                    label: sourceId,
                    value: revenue,
                    color: sourceAsset.colorHex,
                    position: new THREE.Vector3(x, -6, z),
                    asset: sourceAsset,
                    size: 2
                });
            }
        });
    }
    
    const otherAssets = mintedAssets.filter(a => 
        a.id !== 'NeuroBlok' && !nodesData.find(n => n.id === a.id)
    );
    
    otherAssets.forEach((asset, i) => {
        const revenue = (asset.value / 20) * (totalRevenue - neuroBlokRevenue);
        const angle = (Math.PI * 2 * i / Math.max(otherAssets.length, 1)) + Math.PI;
        const radius = hasFusion ? 12 : 8;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        const y = hasFusion ? -6 : 0;
        
        nodesData.push({
            id: asset.id,
            icon: asset.icon,
            label: asset.id,
            value: revenue,
            color: asset.colorHex,
            position: new THREE.Vector3(x, y, z),
            asset: asset,
            size: 2
        });
    });
    
    nodesData.forEach(nodeData => {
        const geometry = new THREE.SphereGeometry(nodeData.size, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: nodeData.color,
            emissive: nodeData.color,
            emissiveIntensity: 0.3,
            shininess: 100,
            transparent: true,
            opacity: 0.95
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(nodeData.position);
        mesh.userData = nodeData;
        
        const glowGeometry = new THREE.SphereGeometry(nodeData.size * 1.4, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: nodeData.color,
            transparent: true,
            opacity: 0.15
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glowMesh);
        
        valueScene.add(mesh);
        valueNodes.push({ mesh: mesh, data: nodeData });
    });
    
    if (hasFusion) {
        createValueConnection('root', 'neuroblok', 0xffd700);
        
        const sources = neuroBlok.generatedFrom ? neuroBlok.generatedFrom.split('+') : [];
        sources.forEach(sourceId => {
            createValueConnection('neuroblok', sourceId, 0x00f0ff);
        });
    }
    
    otherAssets.forEach(asset => {
        createValueConnection('root', asset.id, asset.colorHex);
    });
    
    createValueParticles();
    
    if (nodesData.length > 0) {
        showValueNodeDetail(nodesData[0]);
    }
}

function createValueConnection(fromId, toId, color) {
    const fromNode = valueNodes.find(n => n.data.id === fromId);
    const toNode = valueNodes.find(n => n.data.id === toId);
    if (!fromNode || !toNode) return;
    
    const points = [fromNode.data.position, toNode.data.position];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.3
    });
    
    const line = new THREE.Line(geometry, material);
    valueScene.add(line);
    valueConnections.push({ line, from: fromNode, to: toNode });
}

function createValueParticles() {
    valueConnections.forEach(conn => {
        for (let i = 0; i < 4; i++) {
            const geometry = new THREE.SphereGeometry(0.12, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 0.9
            });
            const particle = new THREE.Mesh(geometry, material);
            valueScene.add(particle);
            
            valueParticles.push({
                mesh: particle,
                from: conn.from.data.position,
                to: conn.to.data.position,
                progress: i / 4,
                speed: 0.008 + Math.random() * 0.004
            });
        }
    });
}

function animateValue3D() {
    requestAnimationFrame(animateValue3D);
    
    if (!valueRenderer || !valueScene || !valueCamera) return;
    
    if (!isDragging) {
        valueScene.rotation.y += 0.0008;
    }
    
    valueScene.rotation.x += (targetRotationX - valueScene.rotation.x) * 0.05;
    valueScene.rotation.y += (targetRotationY - valueScene.rotation.y) * 0.05;
    
    valueParticles.forEach(p => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;
        
        const pos = new THREE.Vector3().lerpVectors(p.from, p.to, p.progress);
        p.mesh.position.copy(pos);
    });
    
    valueNodes.forEach((node, i) => {
        const scale = 1 + Math.sin(Date.now() * 0.002 + i * 0.5) * 0.08;
        node.mesh.scale.setScalar(scale);
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
    
    const meshes = valueNodes.map(n => n.mesh);
    const intersects = raycaster.intersectObjects(meshes);
    
    if (intersects.length > 0) {
        showValueNodeDetail(intersects[0].object.userData);
    }
}

function onValueMouseMove(event) {
    if (!isDragging) {
        const rect = valueRenderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, valueCamera);
        
        const meshes = valueNodes.map(n => n.mesh);
        const intersects = raycaster.intersectObjects(meshes);
        
        const canvas = document.getElementById('value3dCanvas');
        canvas.style.cursor = intersects.length > 0 ? 'pointer' : 'grab';
        return;
    }
    
    const deltaX = event.clientX - mouseX;
    const deltaY = event.clientY - mouseY;
    
    targetRotationY += deltaX * 0.008;
    targetRotationX += deltaY * 0.008;
    targetRotationX = Math.max(-0.5, Math.min(0.5, targetRotationX));
    
    mouseX = event.clientX;
    mouseY = event.clientY;
}

function onValueMouseUp() {
    isDragging = false;
}

function onValueWheel(event) {
    event.preventDefault();
    valueCamera.position.z += event.deltaY * 0.05;
    valueCamera.position.z = Math.max(15, Math.min(60, valueCamera.position.z));
}

function showValueNodeDetail(nodeData) {
    const icon = document.getElementById('detail3dIcon');
    const title = document.getElementById('detail3dTitle');
    const content = document.getElementById('detail3dContent');
    
    if (!icon || !title || !content) return;
    
    const colorHex = '#' + nodeData.color.toString(16).padStart(6, '0');
    
    icon.textContent = nodeData.icon;
    icon.style.color = colorHex;
    title.textContent = nodeData.label;
    title.style.color = colorHex;
    
    if (nodeData.asset && nodeData.asset.contributors) {
        const contributorsHtml = nodeData.asset.contributors.map((c, i) => {
            const share = parseInt(c.share);
            const amount = (nodeData.value * share / 100);
            const colors = ['#ffd700', '#00f0ff', '#00ff88', '#ff69b4'];
            
            return `
                <div class="contributor-3d-row" style="border-color: ${colors[i % colors.length]};">
                    <div class="contributor-3d-avatar" style="border-color: ${colors[i % colors.length]}60; color: ${colors[i % colors.length]};">
                        ${c.name.charAt(0)}
                    </div>
                    <div class="contributor-3d-info">
                        <div class="contributor-3d-name">${c.name}</div>
                        <div class="contributor-3d-share">权益 ${c.share}</div>
                    </div>
                    <div class="contributor-3d-amount">$${amount.toFixed(2)}M</div>
                </div>
            `;
        }).join('');
        
        content.innerHTML = `
            <div style="margin-bottom: 15px; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 12px;">
                <div style="font-size: 12px; color: rgba(150,170,200,0.7); margin-bottom: 5px;">资产名称</div>
                <div style="font-size: 16px; color: ${colorHex};">${nodeData.asset.name}</div>
            </div>
            <div style="font-size: 11px; color: rgba(150,170,200,0.8); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
                贡献者收益分配
            </div>
            ${contributorsHtml}
            <div class="detail-3d-total">
                <span class="detail-3d-total-label">该资产总收益</span>
                <span class="detail-3d-total-value">$${nodeData.value.toFixed(2)}M</span>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 60px; margin-bottom: 20px; color: ${colorHex};">${nodeData.icon}</div>
                <div style="font-size: 22px; color: ${colorHex}; margin-bottom: 15px;">${nodeData.label}</div>
                <div style="font-size: 32px; color: #ffd700; font-family: Orbitron; margin-bottom: 20px;">$${nodeData.value.toFixed(1)}M</div>
                <div style="font-size: 13px; color: rgba(150,170,200,0.7); line-height: 1.6;">
                    新药成功上市带来的总收益<br>
                    价值沿分子链条向下流动<br>
                    精准分配至每个贡献者
                </div>
            </div>
        `;
    }
}

function renderValueNetwork() {
    if (!valueScene) {
        initValue3D();
    } else {
        buildValueNetwork();
    }
}