const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      processDir(p);
    } else if (p.endsWith('.tsx') || p.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf-8');
      let changed = false;

      // replace rounded-md, rounded-lg, rounded-sm, rounded-xl with rounded-full
      const newContent1 = content.replace(/\brounded-(sm|md|lg|xl)\b/g, 'rounded-full');
      if (newContent1 !== content) changed = true;
      content = newContent1;

      // replace borderRadius: 8, etc.
      // Small radiuses <= 16 -> 9999
      // Larger radiuses > 16 -> 48
      const newContent2 = content.replace(/borderRadius:\s*(\d+)/g, (match, p1) => {
        const val = parseInt(p1, 10);
        // Exclude some things if they are 50%
        if (val <= 20) return `borderRadius: 9999`;
        return `borderRadius: 48`;
      });
      if (newContent2 !== content) changed = true;
      content = newContent2;
      
      const newContent3 = content.replace(/borderRadius:\s*'(\d+)px'/g, (match, p1) => {
        const val = parseInt(p1, 10);
        if (val <= 20) return `borderRadius: '9999px'`;
        return `borderRadius: '48px'`;
      });
      if (newContent3 !== content) changed = true;
      content = newContent3;

      if (changed) {
        fs.writeFileSync(p, content, 'utf-8');
        console.log('Updated:', p);
      }
    }
  }
}

processDir('./app');
processDir('./components');
