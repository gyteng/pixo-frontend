import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const buildInfo = {
  deployTime: new Date().toISOString(),
  deployTimeFormatted: new Date().toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
};

const outputPath = join(__dirname, '../src/lib/build-info.js');
const content = `// This file is auto-generated during build
export const buildInfo = ${JSON.stringify(buildInfo, null, 2)};
`;

writeFileSync(outputPath, content, 'utf8');
console.log('Build info generated:', buildInfo);
