const fs = require('fs');
let button = fs.readFileSync('components/ui/Button.tsx', 'utf-8');
button = button.replace(/borderRadius:\s*10/g, 'borderRadius: 9999');
button = button.replace(/borderRadius:\s*12/g, 'borderRadius: 9999');
button = button.replace(/borderRadius:\s*14/g, 'borderRadius: 9999');
fs.writeFileSync('components/ui/Button.tsx', button);

let input = fs.readFileSync('components/ui/Input.tsx', 'utf-8');
input = input.replace(/borderRadius:\s*'var\(--r-md\)'/g, 'borderRadius: 9999');
input = input.replace(/borderRadius:\s*'10px'/g, 'borderRadius: 9999');
fs.writeFileSync('components/ui/Input.tsx', input);

let select = fs.readFileSync('components/ui/Select.tsx', 'utf-8');
select = select.replace(/borderRadius:\s*10/g, 'borderRadius: 9999');
select = select.replace(/borderRadius:\s*'var\(--r-md\)'/g, 'borderRadius: 9999');
fs.writeFileSync('components/ui/Select.tsx', select);

let sidebar = fs.readFileSync('components/layout/Sidebar.tsx', 'utf-8');
sidebar = sidebar.replace(/borderRadius:\s*(10|11|12)/g, 'borderRadius: 9999');
fs.writeFileSync('components/layout/Sidebar.tsx', sidebar);

let topbar = fs.readFileSync('components/layout/Topbar.tsx', 'utf-8');
topbar = topbar.replace(/borderRadius:\s*(10|11|12)/g, 'borderRadius: 9999');
fs.writeFileSync('components/layout/Topbar.tsx', topbar);
