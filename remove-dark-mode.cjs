// remove-dark-mode.cjs
// Strips ALL dark: prefixed Tailwind classes from every source file in src/
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');
const EXTENSIONS = ['.jsx', '.tsx', '.js', '.ts', '.css'];

function walk(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, cb);
    else if (EXTENSIONS.some(e => f.endsWith(e))) cb(full);
  });
}

let total = 0, changed = 0;
walk(SRC_DIR, filePath => {
  total++;
  const src = fs.readFileSync(filePath, 'utf8');
  // Remove dark: classes including complex ones like dark:bg-[#abc], dark:group-hover:text-white etc.
  const cleaned = src.replace(/\s+dark:[a-zA-Z0-9_/\-\[\]#.:!%()]+/g, '');
  if (cleaned !== src) {
    fs.writeFileSync(filePath, cleaned, 'utf8');
    changed++;
    console.log('  ✔ cleaned:', path.relative(__dirname, filePath));
  }
});
console.log(`\nDone. Cleaned ${changed}/${total} files.`);
