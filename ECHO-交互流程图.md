# ECHO 交互流程图

## 一、核心场景流程图

### 1. 「播种」仪式 - 上传作品流程

```mermaid
flowchart TD
    A[用户选择文件] --> B["🌱 引导语:<br/>请轻轻放下你的种子"]
    B --> C[文件呈现为「种子」形态]
    C --> D[用户添加作品信息]
    D --> E["培土: 完善 metadata"]
    E --> F["点击「落款」按钮"]
    F --> G["🎋 印章落下动效"]
    G --> H[种子缓缓沉入土壤]
    H --> I["✨ 提示: 种子已入土"]
    I --> J[萌芽动效]
    J --> K[进入「待发芽」状态]
    
    style A fill:#E0F2F1
    style F fill:#FFD54F
    style I fill:#7CB342
```

---

### 2. 「结缘」体验 - 购买授权流程

```mermaid
flowchart TD
    A[用户浏览作品] --> B["🌸 移步换景式展示"]
    B --> C[点击「结缘」按钮]
    C --> D["展示「缘起」历史"]
    D --> E["两株植物缓缓靠近"]
    E --> F["🍃 叶子交接仪式"]
    F --> G["根系相连可视化"]
    G --> H["✨ 你们已结缘"]
    H --> I[生成「缘契」凭证]
    I --> J["显示: 第 N 次结缘"]
    
    style C fill:#FFD54F
    style F fill:#7CB342
    style H fill:#E0F2F1
```

---

### 3. 「收获」仪式 - 收益提取流程

```mermaid
flowchart TD
    A[收益产生] --> B["🍎 通知: 园中有果实成熟"]
    B --> C[进入果园页面]
    C --> D["果实闪烁微光"]
    D --> E[用户点击「收获」]
    E --> F["🧺 竹篮出现"]
    F --> G["果实依次落入篮中"]
    G --> H["💫 今日收获 X 枚"]
    H --> I{选择}
    I -->|存入仓库| J["🌾 存入谷仓"]
    I -->|取出享用| K["✨ 取出享用"]
    
    style B fill:#FFD54F
    style E fill:#7CB342
    style H fill:#E0F2F1
```

---

### 4. 「生长」脉动 - 作品被使用反馈

```mermaid
flowchart TD
    A[作品被使用] --> B["🌿 创作者收到「脉动」"]
    B --> C["作品对应部分发光"]
    C --> D["显示: 此处正在生长"]
    D --> E["年轮增加动效"]
    E --> F{累积使用}
    F -->|达到阈值| G["🌳 作品进化升级"]
    F -->|日常增长| H["📊 更新生长数据"]
    G --> I["树形态更加茂盛"]
    H --> J["记录使用场景光点"]
    
    style B fill:#7CB342
    style G fill:#FFD54F
```

---

## 二、用户旅程地图

### 创作者旅程

```mermaid
journey
    title 创作者情感旅程
    section 发现
      浏览作品流: 3: 用户
      发现灵感: 4: 用户
    section 创作
      准备上传: 4: 用户
      填写信息: 3: 用户
    section 发布
      落款仪式: 5: 用户
      种子入土: 4: 用户
    section 收益
      果实成熟通知: 5: 用户
      收获仪式: 5: 用户
    section 再创作
      回顾年轮: 4: 用户
      开始新作: 4: 用户
```

### 购买者旅程

```mermaid
journey
    title 购买者情感旅程
    section 浏览
      园林式发现: 3: 用户
      作品观赏: 4: 用户
    section 结缘
      查看缘起: 4: 用户
      结缘仪式: 4: 用户
    section 使用
      激活作品: 3: 用户
      体验共鸣: 4: 用户
    section 再传播
      分享冲动: 5: 用户
      传薪行动: 5: 用户
```

---

## 三、空状态流程

### 待开垦状态

```mermaid
flowchart TD
    A[用户首次进入] --> B["🌾 展示荒地"]
    B --> C["远山朦胧背景"]
    C --> D["微风吹拂波纹"]
    D --> E["⛏️ 开垦按钮"]
    E --> F[用户点击开垦]
    F --> G["锄头落下动效"]
    G --> H["土地裂开露沃土"]
    H --> I["自动引导至播种"]
    
    style B fill:#5D4037
    style F fill:#FFD54F
    style H fill:#7CB342
```

### 种子未发芽状态

```mermaid
flowchart TD
    A[进入收益页面] --> B["🌱 展示埋种的土壤"]
    B --> C["种子心跳光效"]
    C --> D["☁️ 雨露图标"]
    D --> E["显示: 已播种 X 天"]
    E --> F["预计发芽时间"]
    F --> G["鼓励文案"]
    
    style B fill:#5D4037
    style C fill:#7CB342
```

### 生长中加载状态

```mermaid
flowchart LR
    A["🌰 破土而出<br/>0-30%"] --> B["🌱 抽枝发芽<br/>30-60%"]
    B --> C["🌿 茁壮成长<br/>60-90%"]
    C --> D["🌸 即将绽放<br/>90-100%"]
    D --> E["✨ 加载完成"]
    
    style A fill:#5D4037
    style B fill:#7CB342
    style C fill:#7CB342
    style D fill:#FFD54F
    style E fill:#E0F2F1
```

---

## 四、仪式感详细流程

### 落款仪式

```mermaid
sequenceDiagram
    participant U as 用户
    participant S as 系统
    participant B as 区块链
    
    U->>S: 确认作品信息
    S->>U: 展示宣纸质感预览
    U->>S: 点击「落款」
    S->>U: 印章从天而降
    S->>U: 「咚」金石之声
    S->>U: 印迹留在右下角
    S->>U: 作品卷成卷轴
    S->>B: 卷轴飞向链上
    B->>S: 确认永存
    S->>U: 「已落款，永存于世」
```

### 交接仪式

```mermaid
sequenceDiagram
    participant B as 购买者
    participant S as 系统
    participant C as 创作者植物
    participant P as 购买者植物
    
    B->>S: 确认结缘
    S->>C: 激活母树
    S->>P: 激活新土
    S->>S: 两株植物靠近
    C->>P: 叶子飘出交接
    S->>S: 根系相连可视化
    S->>B: 生成「缘契」
    S->>B: 「你们已结缘」
```

### 收获仪式

```mermaid
sequenceDiagram
    participant U as 用户
    participant S as 系统
    
    U->>S: 进入收获页面
    S->>U: 展示果园场景
    S->>U: 果实闪烁微光
    U->>S: 点击「收获」
    S->>U: 竹篮出现
    loop 每颗果实
        S->>U: 果实落入篮中
        S->>U: 「咚」木质声
    end
    S->>U: 显示收获总数
    U->>S: 选择存取
    S->>U: 完成仪式
```

---

## 五、情感峰值点标注

```mermaid
flowchart LR
    subgraph 创作者路径
        A1[发现] --> A2[创作]
        A2 --> A3[发布⭐]
        A3 --> A4[收益⭐]
        A4 --> A5[再创作]
    end
    
    subgraph 购买者路径
        B1[浏览] --> B2[聆听]
        B2 --> B3[结缘]
        B3 --> B4[使用]
        B4 --> B5[再传播⭐]
    end
    
    style A3 fill:#FFD54F
    style A4 fill:#FFD54F
    style B5 fill:#FFD54F
```

---

*流程图设计说明：*
- ⭐ 标记为情感峰值点
- 所有流程强调「渐进、含蓄、意在言外」
- 每个节点都有「余韵」设计
