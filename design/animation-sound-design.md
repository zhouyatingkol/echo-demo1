# ECHO 动效与声音设计规范

> **核心理念**: 「生长」—— 如植物破土生芽，如水墨在纸上晕染，如音符在空气中回荡。
> 
> **设计哲学**: 动效不是装饰，而是空间的呼吸、时间的诗学。

---

## 1. 全局动效规范

### 1.1 动画时序系统

```css
:root {
  /* 基础时长 */
  --duration-instant: 0.15s;    /* 微交互反馈 */
  --duration-fast: 0.3s;        /* 悬停、聚焦 */
  --duration-normal: 0.6s;      /* 元素过渡 */
  --duration-slow: 1.2s;        /* 页面切换 */
  --duration-ambient: 8s;       /* 环境动画 */
  
  /* 缓动曲线 - 东方美学 */
  --ease-ink: cubic-bezier(0.25, 0.1, 0.25, 1);        /* 墨晕 - 起始含蓄，收尾悠长 */
  --ease-water: cubic-bezier(0.4, 0, 0.2, 1);          /* 水波 - 流畅自然 */
  --ease-bamboo: cubic-bezier(0.34, 1.56, 0.64, 1);    /* 竹弹 - 弹性回弹 */
  --ease-breath: cubic-bezier(0.45, 0, 0.55, 1);       /* 呼吸 - 舒缓起伏 */
  --ease-leaf: cubic-bezier(0.22, 1, 0.36, 1);         /* 叶落 - 轻盈飘逸 */
  --ease-stone: cubic-bezier(0.4, 0, 1, 1);            /* 沉稳 - 坚定有力 */
}
```

### 1.2 页面切换动效

**像翻书般从容**

| 属性 | 值 | 说明 |
|------|-----|------|
| 时长 | 1.2s | 给人从容感，不仓促 |
| 缓动 | ease-ink | 如翻书页般优雅 |
| 质感 | opacity + scale + blur | 淡出时轻微模糊，如视线转移 |

```css
/* CSS Keyframes */
@keyframes pageExit {
  0% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
  100% {
    opacity: 0;
    transform: scale(0.98) translateX(-20px);
    filter: blur(4px);
  }
}

@keyframes pageEnter {
  0% {
    opacity: 0;
    transform: scale(1.02) translateX(20px);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: scale(1);
    filter: blur(0);
  }
}
```

```javascript
// GSAP 页面切换
const pageTransition = {
  exit: (element) => {
    return gsap.to(element, {
      opacity: 0,
      scale: 0.98,
      x: -20,
      filter: 'blur(4px)',
      duration: 0.6,
      ease: 'power2.inOut'
    });
  },
  
  enter: (element) => {
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
```

### 1.3 元素出现动效

**Stagger 延迟与呼吸节奏**

```css
/* 基础入场动画 */
@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes inkReveal {
  0% {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
  }
  100% {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}
```

```javascript
// GSAP Stagger 动画系统
const entranceAnimation = {
  // 列表项依次出现 - 如涟漪扩散
  staggerList: (elements, delay = 0) => {
    return gsap.fromTo(elements,
      { 
        opacity: 0, 
        y: 30,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: {
          each: 0.1,
          from: 'start',
          ease: 'power2.out'
        },
        delay,
        ease: 'power3.out'
      }
    );
  },
  
  // 网格错开 - 如花朵绽放
  staggerGrid: (elements) => {
    return gsap.fromTo(elements,
      { 
        opacity: 0, 
        y: 40,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: {
          amount: 0.8,
          grid: 'auto',
          from: 'center'
        },
        ease: 'back.out(1.2)'
      }
    );
  },
  
  // 呼吸节奏入场
  breatheIn: (element) => {
    const tl = gsap.timeline();
    
    tl.fromTo(element,
      { opacity: 0, scale: 0.9 },
      { 
        opacity: 1, 
        scale: 1.02, 
        duration: 0.6, 
        ease: 'power2.out' 
      }
    )
    .to(element, {
      scale: 1,
      duration: 0.4,
      ease: 'power2.inOut'
    });
    
    return tl;
  }
};
```

### 1.4 Hover 效果系统

**像水面泛起涟漪**

#### 水波纹效果
```css
/* 水波纹扩散 */
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.ripple-effect {
  position: relative;
  overflow: hidden;
}

.ripple-effect::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  pointer-events: none;
}

.ripple-effect:hover::after {
  animation: ripple 0.8s var(--ease-water) forwards;
}
```

#### 墨晕效果
```css
/* 墨晕扩散 - 如墨滴入水 */
@keyframes inkSpread {
  0% {
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0);
  }
  50% {
    box-shadow: 0 0 30px 10px rgba(102, 126, 234, 0.3);
  }
  100% {
    box-shadow: 0 0 60px 20px rgba(102, 126, 234, 0);
  }
}

.ink-glow:hover {
  animation: inkSpread 0.8s var(--ease-ink) forwards;
}
```

#### 纸张翻动效果
```css
/* 卡片悬停 - 如纸角微翘 */
@keyframes paperLift {
  0% {
    transform: perspective(1000px) rotateX(0) rotateY(0) translateZ(0);
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  100% {
    transform: perspective(1000px) rotateX(-2deg) rotateY(2deg) translateZ(10px);
    box-shadow: 
      -5px 5px 20px rgba(0,0,0,0.15),
      0 10px 40px rgba(102, 126, 234, 0.1);
  }
}

.card-paper {
  transition: transform 0.8s var(--ease-ink), box-shadow 0.8s var(--ease-ink);
  transform-style: preserve-3d;
}

.card-paper:hover {
  transform: perspective(1000px) rotateX(-2deg) rotateY(2deg) translateZ(10px);
  box-shadow: 
    -5px 5px 20px rgba(0,0,0,0.15),
    0 10px 40px rgba(102, 126, 234, 0.1);
}
```

```javascript
// GSAP Hover 系统
const hoverEffects = {
  // 水波纹跟随鼠标
  magneticRipple: (element) => {
    const ripple = document.createElement('span');
    ripple.className = 'ripple-overlay';
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.3) 0%, transparent 70%);
      pointer-events: none;
      transform: scale(0);
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
  
  // 磁吸效果
  magnetic: (element, strength = 0.3) => {
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
  
  // 3D 倾斜
  tilt3D: (element) => {
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
  }
};
```

---

## 2. Hero 区动效

### 2.1 「动」字出现动画

**如书法运笔，一气呵成**

```css
/* 笔画书写动画 */
@keyframes strokeDraw {
  0% {
    stroke-dashoffset: 1000;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

/* 墨晕填充 */
@keyframes inkFill {
  0% {
    fill-opacity: 0;
    filter: blur(10px);
  }
  50% {
    fill-opacity: 0.5;
    filter: blur(5px);
  }
  100% {
    fill-opacity: 1;
    filter: blur(0);
  }
}

/* 呼吸发光 */
@keyframes characterBreath {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.3));
  }
  50% {
    filter: drop-shadow(0 0 40px rgba(102, 126, 234, 0.6));
  }
}

.hero-character {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: 
    strokeDraw 1.5s var(--ease-ink) forwards,
    inkFill 1s 1.2s var(--ease-water) forwards,
    characterBreath 4s 2s ease-in-out infinite;
}
```

```javascript
// GSAP 「动」字动画
const heroCharacterAnimation = (element) => {
  const tl = gsap.timeline();
  
  // 准备阶段 - 隐藏
  gsap.set(element, { 
    opacity: 0,
    scale: 0.8,
    filter: 'blur(20px)'
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
  // 第三阶段：呼吸发光
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
    delay: 2
  });
  
  return tl;
};

// 文字逐笔画效果（使用 SVG path）
const strokeByStrokeAnimation = (paths) => {
  const tl = gsap.timeline();
  
  paths.forEach((path, index) => {
    const length = path.getTotalLength();
    
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      fillOpacity: 0
    });
    
    tl.to(path, {
      strokeDashoffset: 0,
      duration: 0.8,
      ease: 'power2.inOut'
    }, index * 0.3)
    .to(path, {
      fillOpacity: 1,
      duration: 0.4,
      ease: 'power2.out'
    }, index * 0.3 + 0.6);
  });
  
  return tl;
};
```

### 2.2 副标题逐字/逐词浮现

**如雨滴落水面，层层涟漪**

```css
/* 逐字浮现 */
@keyframes charReveal {
  0% {
    opacity: 0;
    transform: translateY(20px) rotateX(-90deg);
    filter: blur(4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) rotateX(0);
    filter: blur(0);
  }
}

/* 逐词浮现 */
@keyframes wordReveal {
  0% {
    opacity: 0;
    transform: translateY(15px);
    filter: blur(2px);
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

.subtitle-char {
  display: inline-block;
  opacity: 0;
  animation: charReveal 0.6s var(--ease-leaf) forwards;
}

.subtitle-word {
  display: inline-block;
  opacity: 0;
  animation: wordReveal 0.8s var(--ease-ink) forwards;
}
```

```javascript
// GSAP 副标题动画
const subtitleAnimation = {
  // 逐字浮现
  byCharacter: (element) => {
    const text = element.textContent;
    element.innerHTML = '';
    
    text.split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      element.appendChild(span);
      
      gsap.to(span, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        filter: 'blur(0px)',
        duration: 0.6,
        delay: 0.5 + i * 0.05,
        ease: 'power3.out'
      });
    });
    
    gsap.set(element.children, {
      y: 20,
      rotateX: -90,
      filter: 'blur(4px)'
    });
  },
  
  // 逐词浮现（更优雅的阅读节奏）
  byWord: (element) => {
    const text = element.textContent;
    const words = text.split(/(\s+)/);
    element.innerHTML = '';
    
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word;
      span.style.display = 'inline-block';
      span.style.opacity = '0';
      span.style.marginRight = '0.25em';
      element.appendChild(span);
      
      gsap.fromTo(span,
        { 
          opacity: 0, 
          y: 15,
          filter: 'blur(2px)'
        },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          delay: 0.8 + i * 0.12,
          ease: 'power2.out'
        }
      );
    });
  },
  
  // 打字机效果
  typewriter: (element) => {
    const text = element.textContent;
    element.textContent = '';
    element.style.borderRight = '2px solid var(--color-primary)';
    
    let i = 0;
    const type = () => {
      if (i < text.length) {
        element.textContent += text.charAt(i);
        i++;
        setTimeout(type, 80);
      } else {
        gsap.to(element, {
          borderRightColor: 'transparent',
          duration: 0.5,
          repeat: 3,
          yoyo: true,
          onComplete: () => {
            element.style.borderRight = 'none';
          }
        });
      }
    };
    
    setTimeout(type, 1000);
  }
};
```

### 2.3 「进入」按钮 Hover 动效

**如风吹风铃，轻灵响应**

```css
/* 按钮基础样式 */
.enter-button {
  position: relative;
  padding: 16px 48px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 16px;
  letter-spacing: 0.2em;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.8s var(--ease-ink);
}

/* 边框流光 */
.enter-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(102, 126, 234, 0.4),
    transparent
  );
  transition: left 0.8s var(--ease-water);
}

.enter-button:hover::before {
  left: 100%;
}

/* 背景填充 */
.enter-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: height 0.6s var(--ease-ink);
  z-index: -1;
}

.enter-button:hover::after {
  height: 100%;
}

.enter-button:hover {
  border-color: transparent;
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

/* 点击涟漪 */
@keyframes buttonRipple {
  0% {
    transform: scale(0);
    opacity: 0.5;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
}

.enter-button:active {
  transform: scale(0.98);
}
```

```javascript
// GSAP 按钮高级动效
const enterButtonAnimation = (button) => {
  // 悬停光晕
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, #667eea, #764ba2, #00d4ff);
    border-radius: inherit;
    opacity: 0;
    filter: blur(10px);
    z-index: -2;
    transition: opacity 0.6s ease;
  `;
  button.style.position = 'relative';
  button.appendChild(glow);
  
  button.addEventListener('mouseenter', () => {
    gsap.to(glow, { opacity: 0.6, duration: 0.4 });
    gsap.to(button, {
      scale: 1.02,
      letterSpacing: '0.3em',
      duration: 0.4,
      ease: 'power2.out'
    });
  });
  
  button.addEventListener('mouseleave', () => {
    gsap.to(glow, { opacity: 0, duration: 0.4 });
    gsap.to(button, {
      scale: 1,
      letterSpacing: '0.2em',
      duration: 0.4,
      ease: 'power2.out'
    });
  });
  
  // 点击涟漪
  button.addEventListener('click', (e) => {
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      left: ${e.clientX - rect.left - size/2}px;
      top: ${e.clientY - rect.top - size/2}px;
    `;
    
    button.appendChild(ripple);
    
    gsap.fromTo(ripple,
      { scale: 0, opacity: 1 },
      { 
        scale: 2, 
        opacity: 0, 
        duration: 0.6,
        ease: 'power2.out',
        onComplete: () => ripple.remove()
      }
    );
  });
};
```

### 2.4 背景 Subtle 光晕流动

**如晨曦透过薄雾，温柔流动**

```css
/* 多层光晕 */
@keyframes auroraFlow {
  0%, 100% {
    transform: translateX(-50%) translateY(-50%) rotate(0deg);
    opacity: 0.3;
  }
  33% {
    transform: translateX(-30%) translateY(-40%) rotate(120deg);
    opacity: 0.5;
  }
  66% {
    transform: translateX(-70%) translateY(-60%) rotate(240deg);
    opacity: 0.4;
  }
}

@keyframes gentlePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.3;
  }
}

.hero-bg-glow {
  position: absolute;
  width: 150vw;
  height: 150vh;
  background: radial-gradient(
    ellipse at center,
    rgba(102, 126, 234, 0.15) 0%,
    rgba(118, 75, 162, 0.1) 30%,
    transparent 70%
  );
  animation: auroraFlow 20s ease-in-out infinite;
  pointer-events: none;
}

.hero-bg-glow-2 {
  position: absolute;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(
    circle at 30% 70%,
    rgba(0, 212, 255, 0.1) 0%,
    transparent 50%
  );
  animation: gentlePulse 8s ease-in-out infinite;
  pointer-events: none;
}
```

```javascript
// GSAP 背景光晕 - 使用 Canvas 或 WebGL 更佳
const backgroundGlowAnimation = () => {
  // 多层渐变光晕
  const glows = document.querySelectorAll('.hero-bg-glow');
  
  glows.forEach((glow, i) => {
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
    
    glows.forEach((glow, i) => {
      gsap.to(glow, {
        x: `+=${x * (i + 1) * 10}`,
        y: `+=${y * (i + 1) * 10}`,
        duration: 1,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    });
  });
};
```

---

## 3. 微交互系统

### 3.1 按钮点击反馈

**如瓷器轻碰，清脆有力**

```css
/* 点击缩放 */
@keyframes buttonPress {
  0% { transform: scale(1); }
  40% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

.btn-click:active {
  animation: buttonPress 0.2s var(--ease-stone);
}

/* 涟漪扩散 */
@keyframes clickRipple {
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}
```

```javascript
// GSAP 点击反馈系统
const clickFeedback = {
  // 弹性按压
  elasticPress: (element) => {
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
  
  // 波纹涟漪
  ripple: (element, color = 'rgba(255,255,255,0.4)') => {
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
  
  // 震动反馈（错误）
  shake: (element) => {
    gsap.to(element, {
      x: [-5, 5, -5, 5, 0],
      duration: 0.4,
      ease: 'power2.inOut'
    });
  }
};
```

### 3.2 加载状态

**像水波涟漪，生生不息**

```css
/* 水波涟漪加载 */
@keyframes waterRipple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.loading-water {
  position: relative;
  width: 60px;
  height: 60px;
}

.loading-water::before,
.loading-water::after {
  content: '';
  position: absolute;
  inset: 0;
  border: 2px solid var(--color-primary);
  border-radius: 50%;
  animation: waterRipple 1.5s ease-out infinite;
}

.loading-water::after {
  animation-delay: 0.75s;
}

/* 呼吸点 */
@keyframes breatheDot {
  0%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-breathe {
  display: flex;
  gap: 8px;
}

.loading-breathe span {
  width: 12px;
  height: 12px;
  background: var(--color-primary);
  border-radius: 50%;
  animation: breatheDot 1.4s ease-in-out infinite;
}

.loading-breathe span:nth-child(2) { animation-delay: 0.2s; }
.loading-breathe span:nth-child(3) { animation-delay: 0.4s; }
```

```javascript
// GSAP 加载动画
const loadingAnimations = {
  // 水波涟漪
  waterRipple: (container) => {
    container.innerHTML = '';
    
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
  
  // 墨滴扩散
  inkSpread: (container) => {
    const ink = document.createElement('div');
    ink.style.cssText = `
      width: 20px;
      height: 20px;
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
  },
  
  // 生长加载条
  growthBar: (element) => {
    gsap.fromTo(element,
      { width: '0%', opacity: 0.5 },
      {
        width: '100%',
        opacity: 1,
        duration: 2,
        repeat: -1,
        ease: 'power2.inOut',
        yoyo: true
      }
    );
  }
};
```

### 3.3 成功反馈

**像墨在水中晕开，从容优雅**

```css
/* 成功勾画 */
@keyframes checkDraw {
  0% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}

/* 墨晕扩散 */
@keyframes successInk {
  0% {
    transform: scale(0);
    opacity: 0.8;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}

/* 粒子绽放 */
@keyframes particleBurst {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(var(--tx), var(--ty)) scale(0);
    opacity: 0;
  }
}

.success-ink {
  position: relative;
}

.success-ink::before {
  content: '';
  position: absolute;
  inset: -20px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%);
  border-radius: 50%;
  animation: successInk 1.5s var(--ease-ink) forwards;
}

.success-check {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: checkDraw 0.6s 0.3s var(--ease-water) forwards;
}
```

```javascript
// GSAP 成功反馈
const successFeedback = (element) => {
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
  
  // 勾画动画
  tl.to(ink, {
    scale: 2,
    opacity: 0,
    duration: 1.2,
    ease: 'power2.out'
  })
  // 元素缩放弹跳
  .fromTo(element, 
    { scale: 0.8, opacity: 0 },
    { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
    0
  )
  // 粒子绽放
  .add(() => {
    createParticles(element, 12, '#22c55e');
  }, 0.3);
  
  return tl;
};

// 粒子效果
const createParticles = (element, count, color) => {
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
};
```

### 3.4 错误反馈

**克制但不冷漠——如轻叹一声**

```css
/* 轻微震动 */
@keyframes gentleShake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-4px); }
  40% { transform: translateX(4px); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

/* 红色光晕闪烁 */
@keyframes errorGlow {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
  }
  50% {
    box-shadow: 0 0 20px 5px rgba(239, 68, 68, 0.2);
  }
}

.error-feedback {
  animation: 
    gentleShake 0.4s var(--ease-water),
    errorGlow 0.8s var(--ease-breath);
}
```

```javascript
// GSAP 错误反馈
const errorFeedback = (element) => {
  const tl = gsap.timeline();
  
  // 轻微震动 - 克制
  tl.to(element, {
    x: [-4, 4, -2, 2, 0],
    duration: 0.4,
    ease: 'power2.inOut'
  })
  // 红色光晕提示
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
};
```

---

## 4. 声音设计建议

### 4.1 声音设计理念

> **声音是空间的情绪，是交互的呼吸**

| 场景 | 材质隐喻 | 情绪 |
|------|----------|------|
| 页面切换 | 宣纸翻动 | 从容、雅致 |
| 点击 | 瓷器轻碰 | 清脆、精致 |
| 成功 | 古琴泛音 | 悠扬、圆满 |
| 错误 | 木鱼轻敲 | 警醒、克制 |
| Hover | 风铃微响 | 轻盈、暗示 |

### 4.2 具体音效建议

#### 页面切换音效
```
材质: 宣纸翻动
特征:
- 轻柔的沙沙声
- 0.5-0.8秒时长
- 高频成分少，温暖质感
- 可叠加轻微的空气流动感

参考:
- 翻书的最后几页
- 丝绸滑过桌面
- 竹叶摩擦
```

#### 点击音效
```
材质: 瓷器轻碰 / 玉石相击
特征:
- 短促清脆 (0.1-0.2秒)
- 高频清晰但不刺耳
- 带有轻微混响尾音
- 不同按钮可有音高变化

音高映射:
- 主按钮: 中高音 (C5)
- 次要按钮: 中音 (G4)
- 危险操作: 低音 (C4)
```

#### 成功音效
```
材质: 古琴泛音 / 编钟余韵
特征:
- 1.5-2秒时长
- 五声音阶 (宫商角徵羽)
- 泛音清澈，余音袅袅
- 可叠加轻微的和弦进行

建议音型:
- 上行琶音: 低音 → 高音
- 结束在稳定的主音
- 避免过于欢快的跳跃感
```

#### 错误音效
```
材质: 木鱼轻敲 / 琴弦轻拨止音
特征:
- 0.3-0.5秒时长
- 短促，不拖沓
- 低频为主，避免尖锐
- 止音干净，不延留

情绪:
- "请留意"而非"出错了"
- 温和但明确
- 不引起焦虑
```

#### Hover 音效（可选）
```
材质: 风铃 / 水滴
特征:
- 极短 (0.05-0.1秒)
- 极低音量
- 单音或双音
- 营造空间感而非明确提示

使用原则:
- 可全局关闭
- 高频操作（如列表滚动）不触发
- 仅用于重要导航元素
```

### 4.3 背景氛围音（可选）

```
概念: 留白中的呼吸
特征:
- 极低音量 (-30dB以下)
- 循环播放，无缝衔接
- 无明确旋律，纯氛围

建议:
- 自然白噪音（雨声、溪流）
- 电子环境音（合成器铺底）
- 古琴单音的长混响尾音

触发条件:
- 用户停留超过30秒
- 非交互状态时逐渐淡入
- 任何交互立即淡出
```

### 4.4 技术实现建议

```javascript
// 音频管理器
class EchoAudioManager {
  constructor() {
    this.context = new (window.AudioContext || window.webkitAudioContext)();
    this.sounds = {};
    this.enabled = true;
    this.volume = 0.5;
  }
  
  // 加载音效
  async load(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    this.sounds[name] = await this.context.decodeAudioData(arrayBuffer);
  }
  
  // 播放音效
  play(name, options = {}) {
    if (!this.enabled || !this.sounds[name]) return;
    
    const source = this.context.createBufferSource();
    source.buffer = this.sounds[name];
    
    // 音量控制
    const gainNode = this.context.createGain();
    gainNode.gain.value = options.volume || this.volume;
    
    // 音高变化
    if (options.detune) {
      source.detune.value = options.detune;
    }
    
    source.connect(gainNode);
    gainNode.connect(this.context.destination);
    source.start(0);
  }
  
  // 页面切换音效
  playPageTransition() {
    this.play('pageFlip', { volume: 0.3 });
  }
  
  // 点击音效（带随机音高）
  playClick(type = 'primary') {
    const detuneMap = {
      primary: 0,
      secondary: -200,
      danger: -500
    };
    this.play('click', { 
      volume: 0.4,
      detune: detuneMap[type] || 0
    });
  }
  
  // 成功音效
  playSuccess() {
    this.play('success', { volume: 0.5 });
  }
  
  // 错误音效
  playError() {
    this.play('error', { volume: 0.35 });
  }
}

// 使用示例
const audio = new EchoAudioManager();

// 预加载
await Promise.all([
  audio.load('pageFlip', '/sounds/page-flip.mp3'),
  audio.load('click', '/sounds/porcelain-tap.mp3'),
  audio.load('success', '/sounds/guzheng-harmonic.mp3'),
  audio.load('error', '/sounds/wood-block.mp3')
]);

// 绑定事件
document.addEventListener('click', (e) => {
  if (e.target.matches('.btn-primary')) {
    audio.playClick('primary');
  }
});
```

---

## 5. 动效参考资源

### 5.1 物理模拟参考

| 效果 | 物理模型 | 参数建议 |
|------|----------|----------|
| 水波纹 | 阻尼正弦波 | 振幅衰减 0.3, 频率 2Hz |
| 墨晕 | 扩散方程 | 扩散系数 0.1, 非线性饱和 |
| 呼吸 | 正弦波 | 周期 4s, 相位偏移 0 |
| 风铃 | 阻尼谐振 | 衰减 0.95, 多频叠加 |

### 5.2 性能优化

```css
/* GPU 加速 */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
}

/* 减少动效偏好 */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

```javascript
// GSAP 性能优化
// 使用 transform 而非 top/left
gsap.to(element, {
  x: 100,  // ✅ 使用 transform
  // left: 100,  // ❌ 避免使用
  force3D: true  // 强制 GPU 加速
});

// 批量动画
const elements = document.querySelectorAll('.card');
gsap.to(elements, {
  y: 0,
  opacity: 1,
  stagger: 0.1,
  batchMax: 20  // 限制同时动画数量
});
```

### 5.3 设计验证清单

- [ ] 动画时长是否让用户感到从容？
- [ ] 缓动曲线是否自然流畅？
- [ ] 是否有足够的留白让眼睛休息？
- [ ] 动效是否服务于功能而非装饰？
- [ ] 是否考虑了减少动效偏好？
- [ ] 移动端性能是否流畅（60fps）？
- [ ] 音效是否与视觉同步？
- [ ] 整体是否传达「生长」的感觉？

---

## 附录：完整 CSS 变量表

```css
:root {
  /* 时序 */
  --duration-instant: 0.15s;
  --duration-fast: 0.3s;
  --duration-normal: 0.6s;
  --duration-slow: 1.2s;
  --duration-ambient: 8s;
  
  /* 缓动 */
  --ease-ink: cubic-bezier(0.25, 0.1, 0.25, 1);
  --ease-water: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bamboo: cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-breath: cubic-bezier(0.45, 0, 0.55, 1);
  --ease-leaf: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-stone: cubic-bezier(0.4, 0, 1, 1);
  
  /* 间距 */
  --stagger-tight: 0.05s;
  --stagger-normal: 0.1s;
  --stagger-relaxed: 0.15s;
}
```

---

> *"动效是时间的雕塑，空间的音乐。"
> —— ECHO Design Philosophy*
