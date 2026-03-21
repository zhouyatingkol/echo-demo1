// D3.js 可视化图表

// 64势场分布图
function drawFieldMap() {
    const width = document.getElementById('fieldMap').clientWidth;
    const height = 400;
    
    // 清除之前的内容
    d3.select("#fieldMap").selectAll("*").remove();
    
    const svg = d3.select("#fieldMap")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // 生成模拟的64个区域数据
    const regions = [];
    const colors = {
        "乾": "#e74c3c", // 红色 - 全面领先
        "姤": "#3498db", // 蓝色 - 高开放
        "坤": "#2ecc71", // 绿色 - 稳健
        "其他": "#9b59b6" // 紫色 - 其他
    };
    
    // 八卦基础
    const bagua = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];
    
    for (let i = 0; i < 64; i++) {
        const upper = bagua[Math.floor(i / 8)];
        const lower = bagua[i % 8];
        
        regions.push({
            id: i + 1,
            name: upper + lower,
            type: i < 8 ? "乾" : i > 55 ? "坤" : i % 8 === 0 ? "姤" : "其他",
            x: Math.random() * (width - 100) + 50,
            y: Math.random() * (height - 100) + 50,
            radius: Math.random() * 20 + 15,
            count: Math.floor(Math.random() * 50) + 10
        });
    }
    
    // 绘制区域
    const nodes = svg.selectAll(".region")
        .data(regions)
        .enter()
        .append("g")
        .attr("class", "region")
        .attr("transform", d => `translate(${d.x}, ${d.y})`);
    
    // 区域圆圈
    nodes.append("circle")
        .attr("r", 0)
        .attr("fill", d => colors[d.type] + "40") // 添加透明度
        .attr("stroke", d => colors[d.type])
        .attr("stroke-width", 2)
        .transition()
        .duration(1000)
        .attr("r", d => d.radius);
    
    // 区域标签
    nodes.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("fill", "#e0e0e0")
        .attr("font-size", "12px")
        .text(d => d.name)
        .style("opacity", 0)
        .transition()
        .delay(500)
        .duration(500)
        .style("opacity", 1);
    
    // 成员数量标签
    nodes.append("text")
        .attr("text-anchor", "middle")
        .attr("dy", "1.5em")
        .attr("fill", "#888")
        .attr("font-size", "10px")
        .text(d => d.count)
        .style("opacity", 0)
        .transition()
        .delay(700)
        .duration(500)
        .style("opacity", 1);
    
    // 添加交互
    nodes.on("mouseover", function(event, d) {
        d3.select(this).select("circle")
            .transition()
            .duration(200)
            .attr("r", d.radius * 1.2)
            .attr("stroke-width", 3);
    })
    .on("mouseout", function(event, d) {
        d3.select(this).select("circle")
            .transition()
            .duration(200)
            .attr("r", d.radius)
            .attr("stroke-width", 2);
    });
}

// 演化趋势图
function drawEvolutionChart() {
    const width = document.getElementById('evolutionChart').clientWidth;
    const height = 300;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    
    d3.select("#evolutionChart").selectAll("*").remove();
    
    const svg = d3.select("#evolutionChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);
    
    // 模拟4周的演化数据
    const data = [
        { week: 1, qian: 30, gou: 20, kun: 15, other: 35 },
        { week: 2, qian: 32, gou: 22, kun: 14, other: 32 },
        { week: 3, qian: 28, gou: 25, kun: 16, other: 31 },
        { week: 4, qian: 25, gou: 28, kun: 18, other: 29 }
    ];
    
    const x = d3.scaleBand()
        .domain(data.map(d => d.week))
        .range([margin.left, width - margin.right])
        .padding(0.3);
    
    const y = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.bottom, margin.top]);
    
    // X轴
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d => `第${d}周`))
        .attr("color", "#888");
    
    // Y轴
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))
        .attr("color", "#888");
    
    // 堆叠数据
    const stack = d3.stack()
        .keys(["qian", "gou", "kun", "other"]);
    
    const stackedData = stack(data);
    
    const colors = ["#e74c3c", "#3498db", "#2ecc71", "#9b59b6"];
    
    // 绘制堆叠柱状图
    svg.selectAll(".series")
        .data(stackedData)
        .enter()
        .append("g")
        .attr("class", "series")
        .attr("fill", (d, i) => colors[i])
        .selectAll("rect")
        .data(d => d)
        .enter()
        .append("rect")
        .attr("x", d => x(d.data.week))
        .attr("y", height - margin.bottom)
        .attr("height", 0)
        .attr("width", x.bandwidth())
        .transition()
        .duration(800)
        .attr("y", d => y(d[1]))
        .attr("height", d => y(d[0]) - y(d[1]));
    
    // 添加图例
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, ${margin.top})`);
    
    const labels = ["乾", "姤", "坤", "其他"];
    
    labels.forEach((label, i) => {
        const row = legend.append("g")
            .attr("transform", `translate(0, ${i * 20})`);
        
        row.append("rect")
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", colors[i]);
        
        row.append("text")
            .attr("x", 18)
            .attr("y", 10)
            .attr("fill", "#888")
            .attr("font-size", "12px")
            .text(label + "势场");
    });
}

// 六爻雷达图
function drawYaoRadar(dimensions) {
    const width = 300;
    const height = 300;
    const margin = 50;
    const radius = Math.min(width, height) / 2 - margin;
    
    const svg = d3.select("#radarChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);
    
    const axes = ["用", "扩", "衍", "益"];
    const angleSlice = (Math.PI * 2) / axes.length;
    
    // 绘制网格
    const levels = 5;
    for (let i = 0; i < levels; i++) {
        const levelRadius = radius * ((i + 1) / levels);
        svg.append("circle")
            .attr("r", levelRadius)
            .attr("fill", "none")
            .attr("stroke", "#333")
            .attr("stroke-dasharray", "3,3");
    }
    
    // 绘制轴线
    axes.forEach((axis, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        svg.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke", "#333");
        
        svg.append("text")
            .attr("x", x * 1.15)
            .attr("y", y * 1.15)
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("fill", "#888")
            .text(axis);
    });
    
    // 绘制数据
    const data = dimensions || [85, 92, 78, 65];
    const points = data.map((value, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const r = radius * (value / 100);
        return [Math.cos(angle) * r, Math.sin(angle) * r];
    });
    
    const line = d3.line()
        .x(d => d[0])
        .y(d => d[1])
        .curve(d3.curveLinearClosed);
    
    svg.append("path")
        .datum(points)
        .attr("d", line)
        .attr("fill", "rgba(52, 152, 219, 0.3)")
        .attr("stroke", "#3498db")
        .attr("stroke-width", 2);
}

// 页面加载时初始化图表
window.addEventListener('load', function() {
    drawFieldMap();
    drawEvolutionChart();
});

// 窗口大小改变时重绘
window.addEventListener('resize', function() {
    drawFieldMap();
    drawEvolutionChart();
});
