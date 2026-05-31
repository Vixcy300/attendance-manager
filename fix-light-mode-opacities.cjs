const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  const replacements = [
    { regex: /(?<!dark:)(bg-neutral-950\/40)/g, replace: 'bg-gray-100/50 dark:bg-neutral-950/40' },
    { regex: /(?<!dark:)(bg-neutral-950\/80)/g, replace: 'bg-white/80 dark:bg-neutral-950/80' },
    { regex: /(?<!dark:)(bg-neutral-950\/90)/g, replace: 'bg-white/90 dark:bg-neutral-950/90' },
    { regex: /(?<!dark:)(border-neutral-800\/80)/g, replace: 'border-gray-200/80 dark:border-neutral-800/80' },
    { regex: /(?<!dark:)(bg-black\/70)/g, replace: 'bg-gray-900/40 dark:bg-black/70' }, // For modal backdrops
  ];

  for (const { regex, replace } of replacements) {
    content = content.replace(regex, replace);
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated opacities in', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

walk(srcDir);
console.log('Done fixing opacities.');
