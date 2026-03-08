// 使用skill-creator来完成这个复杂的合并任务
// 步骤：
// 1. 从备份提取Stage 1-3的HTML和JS
// 2. 从当前文件提取Stage 4和新的JS
// 3. 合并成完整文件

const fs = require('fs');

const backupFile = '/root/.openclaw/workspace/echo-sandbox/echo-final-perfect.html.backup';
const currentFile = '/root/.openclaw/workspace/echo-sandbox/echo-final-perfect.html';
const outputFile = '/root/.openclaw/workspace/echo-sandbox/echo-complete.html';

const backup = fs.readFileSync(backupFile, 'utf8');
const current = fs.readFileSync(currentFile, 'utf8');

// 从备份提取Stage 0-3
const stage0to3Match = backup.match(/(<!-- STAGE 0:.*?)<!-- STAGE 4:/s);
const stage0to3 = stage0to3Match ? stage0to3Match[1] : '';

// 从当前文件提取Stage 4
const stage4Match = current.match(/(<!-- Stage 4:.*?)<script>/s);
const stage4HTML = stage4Match ? stage4Match[1] : '';

// 从当前文件提取JS
const jsMatch = current.match(/<script>([\s\S]*?)<\/script>/);
const newJS = jsMatch ? jsMatch[1] : '';

// 组合
const result = backup.substring(0, backup.indexOf('<!-- STAGE 4:')) + 
               stage4HTML + 
               '<script>\n' + newJS + '\n    </script>\n</body>\n</html>';

fs.writeFileSync(outputFile, result);
console.log('Merged to:', outputFile);
