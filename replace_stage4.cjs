const fs = require('fs');

const file = '/root/.openclaw/workspace/echo-sandbox/echo-final-perfect.html';
let content = fs.readFileSync(file, 'utf8');

// 读取新的 Stage 4 代码
const newCode = fs.readFileSync('/root/.openclaw/workspace/stage4_final.js', 'utf8');

// 找到 Stage 4 开始位置（在 "// ===== Stage 4:" 之后）
const startMark = '// ===== Stage 4:';
const endMark = '// 初始化';

const startIdx = content.indexOf(startMark);
const endIdx = content.indexOf(endMark);

if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // 替换 Stage 4 代码
    content = content.substring(0, startIdx) + newCode + '\n\n        ' + content.substring(endIdx);
    fs.writeFileSync(file, content);
    console.log('Stage 4 replaced successfully');
} else {
    console.log('Markers not found:', startIdx, endIdx);
}
