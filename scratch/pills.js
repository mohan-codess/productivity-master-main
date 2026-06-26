const fs = require('fs');
let content = fs.readFileSync('components/layout/Sidebar.tsx', 'utf-8');
content = content.replace(/borderRadius:\s*(10|11|12)/g, 'borderRadius: 9999');
fs.writeFileSync('components/layout/Sidebar.tsx', content);

let topbar = fs.readFileSync('components/layout/Topbar.tsx', 'utf-8');
topbar = topbar.replace(/borderRadius:\s*(10|11|12)/g, 'borderRadius: 9999');
fs.writeFileSync('components/layout/Topbar.tsx', topbar);
