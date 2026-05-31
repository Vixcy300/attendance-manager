const fs = require('fs');

let html = fs.readFileSync('email.html', 'utf8');

// Replacements configuration
const replacements = [
  {
    pattern: /IMPORTANT\s*<br\s*\/?>/i,
    replace: 'ATTENDANCE <br />'
  },
  {
    pattern: /POLICY\s+UPDATE\s*<br\s*\/?>/i,
    replace: 'REPORT<br />'
  },
  {
    pattern: /Keeping\s+your\s+banking\s+experience\s*<\/span\s*>\s*<span[^>]*>\s*secure\s*<\/span\s*>\s*<br\s*\/?>/i,
    replace: '<span style="white-space: pre-wrap;">Here is your daily attendance </span><span style="font-weight: 700; white-space: pre-wrap;">update</span><br />'
  },
  {
    pattern: /Starting[\s\S]*?every\s+customer\.\s*<\/span\s*>\s*<br\s*\/?>/i,
    replace: '{{changesHtml}} <br/><br/> {{overviewHtml}}'
  },
  {
    pattern: /Your\s+access\s*<br\s*\/?>/i,
    replace: '1-Click Sync<br />'
  },
  {
    pattern: /Nothing\s+changes\s+in\s+how\s+you\s+log\s+into\s+the\s+app\.\s*<br\s*\/?>/i,
    replace: 'Sync your attendance instantly.<br />'
  },
  {
    pattern: /<span[^>]*>\s*Your\s*<\/span\s*>\s*<span[^>]*>\s*payments\s*<br\s*\/?>\s*<\/span\s*>/i,
    replace: '<span class="ers-fs-187" style="font-size: 18.7px; font-weight: 700; letter-spacing: -0.04em; white-space: pre-wrap;">Secure<br /></span>'
  },
  {
    pattern: /<span[^>]*>\s*We’ve\s+s\s*<\/span\s*>\s*<span[^>]*>\s*implified\s+transfers\s+and\s+limit\s+notifications\.\s*<\/span\s*>\s*<br\s*\/?>/i,
    replace: '<span style="font-size: 13.3px; letter-spacing: -0.01em; white-space: pre-wrap;">Your credentials are AES-256 encrypted.</span><br />'
  },
  {
    pattern: /Your\s+fees\s*<br\s*\/?>/i,
    replace: 'Fast<br />'
  },
  {
    pattern: /We’re\s+adjusting\s+overdraft\s+service\s+charges\.\s*<br\s*\/?>/i,
    replace: 'Runs silently in the background.<br />'
  },
  {
    pattern: /<span[^>]*>\s*Stay\s*<\/span\s*>\s*<span[^>]*>\s*informed\s*<br\s*\/?>\s*<\/span\s*>\s*<span[^>]*>\s*and\s+in\s*<\/span\s*>\s*<span[^>]*>\s*control\s*<\/span\s*>\s*<br\s*\/?>/i,
    replace: '<span style="white-space: pre-wrap;">Stay </span><span style="font-weight: 700; white-space: pre-wrap;">on top</span><span style="white-space: pre-wrap;"> of your </span><span style="font-weight: 700; white-space: pre-wrap;">classes</span><br />'
  },
  {
    pattern: /Together,\s+we’re\s+making\s+banking\s*<br\s*\/?>\s*more\s+secure,\s+simple,\s+and\s+transparent\.\s*<br\s*\/?>/i,
    replace: 'Never miss a class and keep your attendance above 80%.<br />'
  }
];

// Perform replacements
let replacedCount = 0;
for (const item of replacements) {
  if (item.pattern.test(html)) {
    html = html.replace(item.pattern, item.replace);
    replacedCount++;
  }
}

fs.writeFileSync('email.html', html);
console.log(`Successfully customized email.html with ${replacedCount} modifications.`);
