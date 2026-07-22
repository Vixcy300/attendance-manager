const fs = require('fs');

const path = 'src/pages/Community.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace blue-900 with blue-700 and blue-800 with blue-600 to make it slightly lighter
content = content.replace(/blue-900/g, 'blue-700');
content = content.replace(/blue-800/g, 'blue-600');

fs.writeFileSync(path, content, 'utf8');
console.log('Lighter blue colors applied successfully!');
