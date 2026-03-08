// 临时修复：直接在 Stage 4 添加测试代码
// 在浏览器控制台运行这段代码测试：

// 1. 先检查是否有铸造的资产
console.log('All assets:', assets);
console.log('Minted:', assets.filter(a => a.minted));

// 2. 检查 Stage 4 场景
console.log('Value scene:', valueScene);
console.log('Value nodes:', valueNodes);

// 3. 如果 nodes 为空，手动触发重建
if (valueNodes.length === 0) {
    renderValueNetwork();
}

// 4. 检查相机位置
console.log('Camera:', valueCamera ? valueCamera.position : 'no camera');

// 5. 如果还是看不到，尝试这个紧急修复
function emergencyFix() {
    if (!valueScene) return;
    
    // 清除
    while(valueScene.children.length > 0){ 
        valueScene.remove(valueScene.children[0]); 
    }
    
    // 添加灯光
    valueScene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pl = new THREE.PointLight(0xffd700, 1, 200);
    pl.position.set(0, 50, 50);
    valueScene.add(pl);
    
    // 测试：创建简单的球体网格
    const minted = assets.filter(a => a.minted);
    console.log('Creating', minted.length, 'nodes');
    
    minted.forEach((asset, i) => {
        const angle = (i / Math.max(minted.length, 1)) * Math.PI * 2;
        const r = 40;
        const x = Math.cos(angle) * r;
        const z = Math.sin(angle) * r;
        
        // 简单球体测试
        const geo = new THREE.SphereGeometry(3, 32, 32);
        const mat = new THREE.MeshPhongMaterial({ 
            color: asset.colorHex || 0x00f0ff,
            emissive: asset.colorHex || 0x00f0ff,
            emissiveIntensity: 0.3
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, 0, z);
        
        // 添加文字标签
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fillRect(0, 0, 256, 128);
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(asset.id, 128, 80);
        
        const tex = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: tex });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.position.set(x, 5, z);
        sprite.scale.set(10, 5, 1);
        
        valueScene.add(mesh);
        valueScene.add(sprite);
        
        // 连线到中心
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x, 0, z),
            new THREE.Vector3(0, 0, 0)
        ]);
        const lineMat = new THREE.LineBasicMaterial({ 
            color: asset.colorHex || 0x00f0ff,
            transparent: true,
            opacity: 0.3
        });
        valueScene.add(new THREE.Line(lineGeo, lineMat));
    });
    
    // 中心新药
    const rootGeo = new THREE.SphereGeometry(5, 32, 32);
    const rootMat = new THREE.MeshPhongMaterial({ 
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.5
    });
    const root = new THREE.Mesh(rootGeo, rootMat);
    valueScene.add(root);
    
    console.log('Emergency fix applied!');
}

// 运行紧急修复
// emergencyFix();
