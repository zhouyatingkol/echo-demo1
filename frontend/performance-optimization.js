// 添加到 echo-v2.html 的 <script> 开头部分

// ===== 性能优化配置 =====
const PERF_CONFIG = {
    // 根据设备性能调整
    isLowEnd: navigator.hardwareConcurrency <= 4 || window.innerWidth < 768,
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    
    // 粒子数量
    particleCount: this?.isLowEnd ? 300 : 800,
    
    // 渲染精度
    pixelRatio: this?.isLowEnd ? 1 : Math.min(window.devicePixelRatio, 2),
    
    // 动画帧率限制
    maxFPS: this?.isLowEnd ? 30 : 60
};

// 帧率限制器
class FPSLimiter {
    constructor(maxFPS) {
        this.maxFPS = maxFPS;
        this.interval = 1000 / maxFPS;
        this.lastTime = 0;
    }
    
    shouldRender(currentTime) {
        const delta = currentTime - this.lastTime;
        if (delta >= this.interval) {
            this.lastTime = currentTime - (delta % this.interval);
            return true;
        }
        return false;
    }
}

const fpsLimiter = new FPSLimiter(PERF_CONFIG.maxFPS);

// 优化后的动画循环
function optimizedAnimate() {
    requestAnimationFrame(optimizedAnimate);
    
    if (!fpsLimiter.shouldRender(performance.now())) {
        return; // 跳过这一帧
    }
    
    // 执行原有动画逻辑
    if (typeof animate === 'function') {
        animate();
    }
}

// 检测标签页可见性，后台时暂停渲染
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面隐藏时降低性能消耗
        PERF_CONFIG.maxFPS = 5;
    } else {
        PERF_CONFIG.maxFPS = PERF_CONFIG.isLowEnd ? 30 : 60;
    }
});

// 懒加载非关键资源
function lazyLoadResources() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => imageObserver.observe(img));
}

// 内存清理unction cleanupMemory() {
    // 定期清理不再使用的 3D 对象
    if (window.scenes) {
        window.scenes.forEach(scene => {
            scene.traverse(object => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });
        });
    }
}

// 每 30 秒清理一次内存
setInterval(cleanupMemory, 30000);

console.log('[ECHO] 性能优化已启用', PERF_CONFIG);
