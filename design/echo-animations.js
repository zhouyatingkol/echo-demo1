/**
 * ECHO 动效系统 - 东方美学动效库
 * 
 * 核心理念：「生长」—— 如水墨晕染，如植物生长，如呼吸起伏
 * @version 1.0.0
 */

// ============================================
// 1. 动画配置常量
// ============================================

const ECHO_ANIMATION = {
  // 时长 (秒)
  duration: {
    instant: 0.15,
    fast: 0.3,
    normal: 0.6,
    slow: 1.2,
    ambient: 8
  },
  
  // 缓动曲线 - 东方美学命名
  ease: {
    ink: 'power2.inOut',      // 墨晕 - 起始含蓄，收尾悠长
    water: 'power2.out',      // 水波 - 流畅自然
    bamboo: 'elastic.out(1, 0.5)', // 竹弹 - 弹性回弹
    breath: 'sine.inOut',     // 呼吸 - 舒缓起伏
    leaf: 'power3.out',       // 叶落 - 轻盈飘逸
    stone: 'power2.in'        // 沉稳 - 坚定有力
  },
  
  // 延迟间隔
  stagger: {
    tight: 0.05,
    normal: 0.1,
    relaxed: 0.15
  }
};

// ============================================
// 2. 入场动画系统
// ============================================

const EchoEntrance = {
  /**
   * 淡入上移 - 最常用入场
   * @param {Element|NodeList} elements - 目标元素
   * @param {Object} options - 配置选项
   */
  fadeInUp(elements, options = {}) {
    const config = {
      y: 30,
      opacity: 0,
      duration: ECHO_ANIMATION.duration.normal,
      ease: ECHO_ANIMATION.ease.leaf,
      stagger: 0,
      delay: 0,
      ...options
    };
    
    return gsap.fromTo(elements,
      { y: config.y, opacity: config.opacity },
      {
        y: 0,
        opacity: 1,
        duration: config.duration,
        ease: config.ease,
        stagger: config.stagger,
        delay: config.delay
      }
    );
  },
  
  /**
   * 呼吸式入场 - 轻微放大后回弹
   */
  breatheIn(elements, options = {}) {
    const config = {
      duration: ECHO_ANIMATION.duration.normal,
      delay: 0,
      ...options
    };
    
    const tl = gsap.timeline({ delay: config.delay });
    
    tl.fromTo(elements,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1.02, duration: config.duration * 0.6, ease: 'power2.out' }
    )
    .to(elements, {
      scale: 1,
      duration: config.duration * 0.4,
      ease: 'power2.inOut'
    });
    
    return tl;
  },
  
  /**
   * 墨晕显现 - 如墨滴在水中晕开
   */
  inkReveal(elements, options = {}) {
    const config = {
      duration: ECHO_ANIMATION.duration.slow,
      stagger: ECHO_ANIMATION.stagger.normal,
      delay: 0,
      ...options
    };
    
    return gsap.fromTo(elements,
      { 
        opacity: 0, 
        filter: 'blur(10px)',
        scale: 0.95
      },
      {
        opacity: 1,
        filter: 'blur(0px)',
        scale: 1,
        duration: config.duration,
        stagger: config.stagger,
        delay: config.delay,
        ease: ECHO_ANIMATION.ease.ink
      }
    );
  },
  
  /**
   * 列表涟漪 - 如水面涟漪扩散
   */
  rippleList(elements, options = {}) {
    const config = {
      duration: 0.8,
      stagger: 0.1,
      from: 'start',
      ...options
    };
    
    return gsap.fromTo(elements,
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: config.duration,
        stagger: {
          each: config.stagger,
          from: config.from
        },
        ease: ECHO_ANIMATION.ease.water
      }
    );
  },
  
  /**
   * 网格绽放 - 从中心向外
   */
  gridBloom(elements, options = {}) {
    const config = {
      duration: 0.6,
      amount: 0.8,
      ...options
    };
    
    return gsap.fromTo(elements,
      { opacity: 0, y: 40, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: config.duration,
        stagger: {
          amount: config.amount,
          grid: 'auto',
          from: 'center'
        },
        ease: 'back.out(1.2)'
      }
    );
  }
};

// ============================================
// 3. Hero 区动画
// ============================================

const EchoHero = {
  /**
   * 「动」字书写动画
   * @param {Element} element - 文字元素
   */
  characterReveal(element) {
    const tl = gsap.timeline();
    
    // 初始状态
    gsap.set(element, { 
      opacity: 0,
      scale: 0.8,
      filter: 'blur(20px)',
      textShadow: '0 0 0 rgba(102, 126, 234, 0)'
    });
    
    // 第一阶段：从虚空中凝聚
    tl.to(element, {
      opacity: 0.3,
      scale: 0.9,
      filter: 'blur(10px)',
      duration: 0.6,
      ease: 'power2.out'
    })
    // 第二阶段：笔触显现
    .to(element, {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      duration: 1,
      ease: 'power3.out'
    })
    // 第三阶段：发光呼吸
    .to(element, {
      textShadow: '0 0 60px rgba(102, 126, 234, 0.8)',
      duration: 0.8,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
    
    // 持续的环境呼吸
    gsap.to(element, {
      textShadow: '0 0 40px rgba(102, 126, 234, 0.6)',
      duration: 3,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 2.5
    });
    
    return tl;
  },
  
  /**
   * 逐字浮现
   */
  charByChar(element, options = {}) {
    const text = element.textContent;
    const config = {
      delay: 0.5,
      charDelay: 0.05,
      ...options
    };
    
    element.innerHTML = '';
    
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      element.appendChild(span);
      
      gsap.fromTo(span,
        { y: 20, rotateX: -90, filter: 'blur(4px)' },
        {
          y: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          opacity: 1,
          duration: 0.6,
          delay: config.delay + i * config.charDelay,
          ease: 'power3.out'
        }
      );
    });
  },
  
  /**
   * 逐词浮现 - 更优雅的阅读节奏
   */
  wordByWord(element, options = {}) {
    const text = element.textContent;
    const words = text.split(/(\s+)/);
    const config = {
      delay: 0.8,
      wordDelay: 0.12,
      ...options
    };
    
    element.innerHTML = '';
    
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.marginRight = '0.25em';
      element.appendChild(span);
      
      gsap.fromTo(span,
        { y: 15, filter: 'blur(2px)' },
        {
          y: 0,
          filter: 'blur(0px)',
          opacity: 1,
          duration: 0.8,
          delay: config.delay + i * config.wordDelay,
          ease: 'power2.out'
        }
      );
    });
  },
  
  /**
   * 背景光晕流动
   */
  ambientGlow(elements) {
    elements.forEach((glow, i) => {
      // 缓慢漂移
      gsap.to(glow, {
        x: `random(-100, 100)`,
        y: `random(-50, 50)`,
        rotation: `random(-30, 30)`,
        duration: 15 + i * 5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
      
      // 呼吸效果
      gsap.to(glow, {
        opacity: `random(0.1, 0.4)`,
        scale: `random(0.9, 1.1)`,
        duration: 6 + i * 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    });
    
    // 鼠标视差
    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      
      elements.forEach((glow, i) => {
        gsap.to(glow, {
          x: `+=${x * (i + 1) * 10}`,
          y: `+=${y * (i + 1) * 10}`,
          duration: 1,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });
  }
};

// ============================================
// 4. Hover 交互系统
// ============================================

const EchoHover = {
  /**
   * 磁吸效果
   */
  magnetic(element, strength = 0.3) {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
    
    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  },
  
  /**
   * 3D 倾斜
   */
  tilt3D(element) {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      
      gsap.to(element, {
        rotateY: x * 10,
        rotateX: -y * 10,
        duration: 0.3,
        ease: 'power2.out',
        transformPerspective: 1000
      });
    });
    
    element.addEventListener('mouseleave', () => {
      gsap.to(element, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: 'power2.out'
      });
    });
  },
  
  /**
   * 水波纹跟随
   */
  ripple(element, color = 'rgba(102, 126, 234, 0.3)') {
    const ripple = document.createElement('span');
    ripple.className = 'echo-ripple-overlay';
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, ${color} 0%, transparent 70%);
      pointer-events: none;
      transform: scale(0);
      opacity: 0.5;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    element.addEventListener('mouseenter', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      gsap.set(ripple, {
        left: x - 50,
        top: y - 50,
        width: 100,
        height: 100,
        scale: 0,
        opacity: 0.5
      });
      
      gsap.to(ripple, {
        scale: 3,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    });
  },
  
  /**
   * 发光边框
   */
  glowBorder(element, color = '#667eea') {
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: absolute;
      inset: -2px;
      background: linear-gradient(135deg, ${color}, transparent);
      border-radius: inherit;
      opacity: 0;
      filter: blur(10px);
      z-index: -1;
      transition: opacity 0.6s ease;
    `;
    
    element.style.position = 'relative';
    element.appendChild(glow);
    
    element.addEventListener('mouseenter', () => {
      gsap.to(glow, { opacity: 0.6, duration: 0.4 });
    });
    
    element.addEventListener('mouseleave', () => {
      gsap.to(glow, { opacity: 0, duration: 0.4 });
    });
  }
};

// ============================================
// 5. 点击反馈系统
// ============================================

const EchoClick = {
  /**
   * 弹性按压
   */
  elasticPress(element) {
    element.addEventListener('mousedown', () => {
      gsap.to(element, {
        scale: 0.95,
        duration: 0.1,
        ease: 'power2.out'
      });
    });
    
    element.addEventListener('mouseup', () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.4,
        ease: 'elastic.out(1, 0.5)'
      });
    });
  },
  
  /**
   * 涟漪扩散
   */
  ripple(element, color = 'rgba(255,255,255,0.4)') {
    element.addEventListener('click', (e) => {
      const ripple = document.createElement('span');
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      
      ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: 50%;
        pointer-events: none;
        left: ${e.clientX - rect.left - size/2}px;
        top: ${e.clientY - rect.top - size/2}px;
        transform: scale(0);
        z-index: 10;
      `;
      
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);
      
      gsap.to(ripple, {
        scale: 1,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    });
  },
  
  /**
   * 震动反馈（用于错误）
   */
  shake(element) {
    gsap.to(element, {
      x: [-5, 5, -5, 5, 0],
      duration: 0.4,
      ease: 'power2.inOut'
    });
  }
};

// ============================================
// 6. 加载动画
// ============================================

const EchoLoading = {
  /**
   * 水波涟漪
   */
  waterRipple(container) {
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.width = '60px';
    container.style.height = '60px';
    
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div');
      ring.style.cssText = `
        position: absolute;
        inset: 0;
        border: 2px solid rgba(102, 126, 234, 0.6);
        border-radius: 50%;
        transform: scale(0);
      `;
      container.appendChild(ring);
      
      gsap.to(ring, {
        scale: 2,
        opacity: 0,
        duration: 2,
        repeat: -1,
        delay: i * 0.6,
        ease: 'power2.out'
      });
    }
  },
  
  /**
   * 呼吸点
   */
  breatheDots(container) {
    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.gap = '8px';
    
    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('span');
      dot.style.cssText = `
        width: 12px;
        height: 12px;
        background: #667eea;
        border-radius: 50%;
        transform: scale(0.6);
        opacity: 0.4;
      `;
      container.appendChild(dot);
      
      gsap.to(dot, {
        scale: 1,
        opacity: 1,
        duration: 0.7,
        repeat: -1,
        yoyo: true,
        delay: i * 0.2,
        ease: 'sine.inOut'
      });
    }
  },
  
  /**
   * 墨滴扩散
   */
  inkSpread(container) {
    container.innerHTML = '';
    container.style.position = 'relative';
    container.style.width = '60px';
    container.style.height = '60px';
    
    const ink = document.createElement('div');
    ink.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 20px;
      height: 20px;
      margin: -10px 0 0 -10px;
      background: radial-gradient(circle, #667eea 0%, transparent 70%);
      border-radius: 50%;
    `;
    container.appendChild(ink);
    
    gsap.to(ink, {
      scale: 5,
      opacity: 0,
      duration: 1.5,
      repeat: -1,
      ease: 'power2.out'
    });
    
    gsap.to(ink, {
      rotation: 360,
      duration: 8,
      repeat: -1,
      ease: 'none'
    });
  }
};

// ============================================
// 7. 状态反馈
// ============================================

const EchoFeedback = {
  /**
   * 成功反馈 - 如墨在水中晕开
   */
  success(element) {
    const tl = gsap.timeline();
    
    // 墨晕背景
    const ink = document.createElement('div');
    ink.style.cssText = `
      position: absolute;
      inset: -50%;
      background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 60%);
      border-radius: 50%;
      transform: scale(0);
      z-index: -1;
    `;
    element.style.position = 'relative';
    element.appendChild(ink);
    
    tl.to(ink, {
      scale: 2,
      opacity: 0,
      duration: 1.2,
      ease: 'power2.out'
    })
    .fromTo(element, 
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
      0
    );
    
    // 粒子绽放
    setTimeout(() => {
      this.createParticles(element, 12, '#22c55e');
    }, 300);
    
    return tl;
  },
  
  /**
   * 错误反馈 - 克制但不冷漠
   */
  error(element) {
    const tl = gsap.timeline();
    
    // 轻微震动
    tl.to(element, {
      x: [-4, 4, -2, 2, 0],
      duration: 0.4,
      ease: 'power2.inOut'
    })
    // 红色光晕
    .to(element, {
      boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
      borderColor: 'rgba(239, 68, 68, 0.6)',
      duration: 0.3,
      ease: 'power2.out'
    }, 0)
    // 逐渐消退
    .to(element, {
      boxShadow: '0 0 0 rgba(239, 68, 68, 0)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      duration: 0.8,
      ease: 'power2.out'
    });
    
    return tl;
  },
  
  /**
   * 创建粒子效果
   */
  createParticles(element, count, color) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      const angle = (i / count) * Math.PI * 2;
      const distance = 50 + Math.random() * 30;
      
      particle.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: ${color};
        border-radius: 50%;
        left: ${centerX}px;
        top: ${centerY}px;
        pointer-events: none;
        z-index: 100;
      `;
      
      element.appendChild(particle);
      
      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        opacity: 0,
        scale: 0,
        duration: 0.8 + Math.random() * 0.4,
        ease: 'power2.out',
        onComplete: () => particle.remove()
      });
    }
  }
};

// ============================================
// 8. 页面切换
// ============================================

const EchoPageTransition = {
  /**
   * 页面退出
   */
  exit(element) {
    return gsap.to(element, {
      opacity: 0,
      scale: 0.98,
      x: -20,
      filter: 'blur(4px)',
      duration: 0.6,
      ease: 'power2.inOut'
    });
  },
  
  /**
   * 页面进入
   */
  enter(element) {
    return gsap.fromTo(element, 
      { 
        opacity: 0, 
        scale: 1.02, 
        x: 20,
        filter: 'blur(4px)'
      },
      { 
        opacity: 1, 
        scale: 1, 
        x: 0,
        filter: 'blur(0px)',
        duration: 1.2, 
        ease: 'power2.out'
      }
    );
  }
};

// ============================================
// 9. 初始化工具
// ============================================

const EchoInit = {
  /**
   * 初始化所有带有 data-echo 属性的元素
   */
  auto() {
    // 入场动画
    document.querySelectorAll('[data-echo="fade-in-up"]').forEach(el => {
      EchoEntrance.fadeInUp(el, {
        delay: parseFloat(el.dataset.echoDelay) || 0,
        stagger: parseFloat(el.dataset.echoStagger) || 0
      });
    });
    
    // 磁吸效果
    document.querySelectorAll('[data-echo="magnetic"]').forEach(el => {
      EchoHover.magnetic(el, parseFloat(el.dataset.echoStrength) || 0.3);
    });
    
    // 3D倾斜
    document.querySelectorAll('[data-echo="tilt-3d"]').forEach(el => {
      EchoHover.tilt3D(el);
    });
    
    // 涟漪效果
    document.querySelectorAll('[data-echo="ripple"]').forEach(el => {
      EchoClick.ripple(el, el.dataset.echoColor);
    });
    
    // 弹性按压
    document.querySelectorAll('[data-echo="elastic"]').forEach(el => {
      EchoClick.elasticPress(el);
    });
  }
};

// ============================================
// 10. 导出
// ============================================

// ES Module 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ECHO_ANIMATION,
    EchoEntrance,
    EchoHero,
    EchoHover,
    EchoClick,
    EchoLoading,
    EchoFeedback,
    EchoPageTransition,
    EchoInit
  };
}

// 浏览器全局变量
if (typeof window !== 'undefined') {
  window.ECHO_ANIMATION = ECHO_ANIMATION;
  window.EchoEntrance = EchoEntrance;
  window.EchoHero = EchoHero;
  window.EchoHover = EchoHover;
  window.EchoClick = EchoClick;
  window.EchoLoading = EchoLoading;
  window.EchoFeedback = EchoFeedback;
  window.EchoPageTransition = EchoPageTransition;
  window.EchoInit = EchoInit;
}
