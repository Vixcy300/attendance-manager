const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Replacements for typical dark mode hardcodings to add light mode
  // bg-neutral-900 -> bg-white dark:bg-neutral-900
  // text-white -> text-neutral-900 dark:text-white
  // bg-neutral-950 -> bg-gray-50 dark:bg-neutral-950
  // border-neutral-800 -> border-gray-200 dark:border-neutral-800
  // text-neutral-400 -> text-neutral-500 dark:text-neutral-400
  // text-neutral-300 -> text-neutral-600 dark:text-neutral-300
  // bg-neutral-800 -> bg-gray-100 dark:bg-neutral-800

  const replacements = [
    { regex: /(?<!dark:)(bg-neutral-900)(?!\/)/g, replace: 'bg-white dark:bg-neutral-900' },
    { regex: /(?<!dark:)(bg-neutral-950)(?!\/)/g, replace: 'bg-gray-50 dark:bg-neutral-950' },
    { regex: /(?<!dark:)(bg-neutral-800)(?!\/)/g, replace: 'bg-gray-100 dark:bg-neutral-800' },
    { regex: /(?<!dark:)(border-neutral-800)(?!\/)/g, replace: 'border-gray-200 dark:border-neutral-800' },
    { regex: /(?<!dark:)(border-white\/5)/g, replace: 'border-gray-200 dark:border-white/5' },
    { regex: /(?<!dark:)(border-white\/10)/g, replace: 'border-gray-300 dark:border-white/10' },
    { regex: /(?<!dark:)(bg-white\/\[0\.02\])/g, replace: 'bg-gray-50 dark:bg-white/[0.02]' },
    { regex: /(?<!dark:)(bg-white\/\[0\.03\])/g, replace: 'bg-gray-100 dark:bg-white/[0.03]' },
    { regex: /(?<!dark:)(bg-neutral-900\/40)/g, replace: 'bg-white/80 dark:bg-neutral-900/40' },
    { regex: /(?<!dark:)(bg-neutral-900\/60)/g, replace: 'bg-white/90 dark:bg-neutral-900/60' },
    { regex: /(?<!dark:)(text-white)(?!\/)/g, replace: 'text-neutral-900 dark:text-white' },
    { regex: /(?<!dark:)(text-neutral-400)(?!\/)/g, replace: 'text-neutral-500 dark:text-neutral-400' },
    { regex: /(?<!dark:)(text-neutral-300)(?!\/)/g, replace: 'text-neutral-600 dark:text-neutral-300' },
  ];

  // For event-manager.tsx which has light mode hardcoded
  if (filePath.endsWith('event-manager.tsx')) {
    content = content.replace(/(?<!dark:)(bg-white)(?!\/)/g, 'bg-white dark:bg-neutral-900');
    content = content.replace(/(?<!dark:)(text-neutral-900)(?!\/)/g, 'text-neutral-900 dark:text-white');
    content = content.replace(/(?<!dark:)(bg-neutral-50)(?!\/)/g, 'bg-neutral-50 dark:bg-neutral-800');
    content = content.replace(/(?<!dark:)(border-neutral-200)(?!\/)/g, 'border-neutral-200 dark:border-neutral-700');
    content = content.replace(/(?<!dark:)(border-neutral-100)(?!\/)/g, 'border-neutral-100 dark:border-neutral-800');
    content = content.replace(/(?<!dark:)(text-neutral-800)(?!\/)/g, 'text-neutral-800 dark:text-neutral-100');
    content = content.replace(/(?<!dark:)(text-neutral-600)(?!\/)/g, 'text-neutral-600 dark:text-neutral-300');
  } else {
    for (const { regex, replace } of replacements) {
      content = content.replace(regex, replace);
    }
  }

  // Deduplicate classes if we accidentally generated `bg-white dark:bg-white` or `bg-white dark:bg-neutral-900 bg-white`
  // Actually, standard regex might just inject them. Let's rely on Tailwind's final class processing to pick the right one, 
  // but to be clean, if there are duplicates we just leave them or let prettier fix it if it was running.
  
  // Fix button text-white which SHOULD stay text-white even in light mode
  // e.g. bg-indigo-600 text-neutral-900 dark:text-white -> bg-indigo-600 text-white
  content = content.replace(/bg-indigo-600 text-neutral-900 dark:text-white/g, 'bg-indigo-600 text-white');
  content = content.replace(/bg-red-500 text-neutral-900 dark:text-white/g, 'bg-red-500 text-white');
  content = content.replace(/bg-red-600 text-neutral-900 dark:text-white/g, 'bg-red-600 text-white');
  content = content.replace(/bg-emerald-500 text-neutral-900 dark:text-white/g, 'bg-emerald-500 text-white');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
      processFile(fullPath);
    }
  }
}

walk(srcDir);
console.log('Done fixing light mode classes.');
