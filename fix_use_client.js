const fs = require('fs');
const path = require('path');
function fixFile(fp) {
  if (!fs.existsSync(fp)) return;
  let content = fs.readFileSync(fp, 'utf8');
  const original = content;
  // Replace malformed use client directives
  // Cases: "use client\"; , 'use client\";' , use client\"; (missing opening quote)
  content = content.replace(/\"use client\\\";/g, '"use client";');
  content = content.replace(/'use client\\";'/g, "'use client';");
  content = content.replace(/use client\\";/g, '"use client";');
  // Also fix duplicate imports if any (not needed now)
  if (content !== original) {
    fs.writeFileSync(fp, content, 'utf8');
    console.log('Fixed', fp);
  }
}
function walk(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const p = path.join(dir, entry);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (['node_modules', '.next', 'dist'].includes(entry)) continue;
      walk(p);
    } else if (p.endsWith('.jsx') || p.endsWith('.tsx')) {
      fixFile(p);
    }
  }
}
walk('app');
walk('components');
