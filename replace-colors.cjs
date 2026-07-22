const fs = require('fs');

const path = 'src/pages/Community.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace all instances of slate-900 and slate-800 with blue-900 and blue-800
content = content.replace(/slate-900/g, 'blue-900');
content = content.replace(/slate-800/g, 'blue-800');

fs.writeFileSync(path, content, 'utf8');
console.log('Colors replaced successfully!');
