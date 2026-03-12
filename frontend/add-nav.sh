#!/bin/bash

# 为所有 HTML 页面添加统一导航

NAV_HTML='<nav class="main-nav" style="position: fixed; top: 0; left: 0; right: 0; height: 64px; background: rgba(10,10,26,0.95); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.1); z-index: 1000;"><div style="max-width: 1400px; margin: 0 auto; height: 100%; display: flex; align-items: center; padding: 0 20px; gap: 30px;"><a href="index.html" style="display: flex; align-items: center; gap: 8px; text-decoration: none; font-size: 20px; font-weight: bold; background: linear-gradient(90deg, #00d4ff, #7b2cbf); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🎵 ECHO Music</a><div style="display: flex; gap: 8px; flex: 1;"><a href="discover.html" style="padding: 8px 14px; color: #aaa; text-decoration: none; border-radius: 6px; font-size: 14px;">发现</a><a href="music-market.html" style="padding: 8px 14px; color: #aaa; text-decoration: none; border-radius: 6px; font-size: 14px;">市场</a><a href="charts.html" style="padding: 8px 14px; color: #aaa; text-decoration: none; border-radius: 6px; font-size: 14px;">榜单</a><a href="mint-music.html" style="padding: 8px 14px; color: #aaa; text-decoration: none; border-radius: 6px; font-size: 14px;">铸造</a><a href="dashboard.html" style="padding: 8px 14px; color: #aaa; text-decoration: none; border-radius: 6px; font-size: 14px;">收益</a></div><div style="display: flex; align-items: center; gap: 12px;"><a href="my-favorites.html" style="padding: 8px; text-decoration: none; font-size: 18px;">❤️</a><button style="padding: 8px 20px; background: linear-gradient(90deg, #00d4ff, #7b2cbf); border: none; border-radius: 6px; color: #fff; font-size: 14px; cursor: pointer;" onclick="connectWallet()">连接钱包</button></div></div></nav>'

# 为每个 HTML 文件添加导航（除了 index.html 和 demo 页面）
for file in *.html; do
    if [[ "$file" != "index.html" ]] && [[ "$file" != *"demo"* ]] && [[ "$file" != *"backup"* ]]; then
        # 检查是否已经有导航
        if ! grep -q "main-nav" "$file"; then
            # 在 <body> 后添加导航
            sed -i "s|<body>|<body>${NAV_HTML}|" "$file"
            # 添加 body padding
            sed -i 's/body {/body { padding-top: 64px;/' "$file"
            echo "已添加导航: $file"
        fi
    fi
done

echo "✅ 所有页面已添加统一导航"
