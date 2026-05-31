const fs = require('fs');
const path = require('path');
const lines = fs.readFileSync('C:/Users/vigne/.gemini/antigravity/brain/b9464f47-491d-4671-8533-8137bad7e482/.system_generated/logs/transcript.jsonl', 'utf8').split('\n');
const match = lines.find(l => l.includes('animated-characters-login-page.tsx') && l.includes('USER_INPUT'));
if(match) {
  const content = JSON.parse(match).content;
  const regex = /```tsx([\s\S]*?)```/g;
  let codeMatch;
  let filesExtracted = 0;
  while ((codeMatch = regex.exec(content)) !== null) {
    let code = codeMatch[1];
    
    // Sometimes there are multiple files inside one block separated by a filename
    const parts = code.split(/(?:^|\n)(animated-characters-login-page\.tsx|demo\.tsx|[\w-]+\.tsx)(?:\n|$)/);
    
    if (parts.length > 1) {
      for(let i=1; i<parts.length; i+=2) {
        let fileName = parts[i].trim();
        let fileCode = parts[i+1].trim();
        const p = path.join('C:/Users/vigne/OneDrive/Desktop/attendance-manger/src/components/ui', fileName);
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, fileCode);
        console.log('Extracted:', p);
        filesExtracted++;
      }
    } else {
      let firstNewline = code.indexOf('\n');
      let firstLine = code.substring(0, firstNewline).trim();
      let actualCode = code.substring(firstNewline + 1);
      
      if (firstLine.includes('.tsx') || firstLine.includes('.ts')) {
        const p = path.join('C:/Users/vigne/OneDrive/Desktop/attendance-manger/src/components/ui', firstLine);
        fs.mkdirSync(path.dirname(p), { recursive: true });
        fs.writeFileSync(p, actualCode.trim());
        console.log('Extracted:', p);
        filesExtracted++;
      } else {
        const p = path.join('C:/Users/vigne/OneDrive/Desktop/attendance-manger/src/components/ui', 'animated-characters-login-page.tsx');
        fs.mkdirSync(path.dirname(p), { recursive: true });
        let finalCode = code.replace('animated-characters-login-page.tsx', '');
        fs.writeFileSync(p, finalCode.trim());
        console.log('Extracted default:', p);
        filesExtracted++;
      }
    }
  }
  console.log('Done, extracted ' + filesExtracted + ' files.');
} else {
  console.log('Not found');
}
