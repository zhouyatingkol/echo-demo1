const fs = require('fs');

const htmlFile = '/root/.openclaw/workspace/echo-sandbox/echo-final-perfect.html';
const jsFile = '/root/.openclaw/workspace/value3d.js';

let content = fs.readFileSync(htmlFile, 'utf8');
const newFunc = fs.readFileSync(jsFile, 'utf8');

// Find and replace the old Stage 4 functions
const startMarker = '// ===== Stage 4: 价值网络可视化 =====';
const endMarker = 'showNodeDetail(nodes[0]);\n        }';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx !== -1 && endIdx !== -1) {
    const before = content.substring(0, startIdx);
    const after = content.substring(endIdx + endMarker.length);
    content = before + newFunc + after;
    fs.writeFileSync(htmlFile, content);
    console.log('Replacement successful');
} else {
    console.log('Pattern not found:', startIdx, endIdx);
}
