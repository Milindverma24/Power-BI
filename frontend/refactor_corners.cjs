const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/rajpu/Documents/AI-BI/frontend/src';

const replacements = [
  // Revert sharp corners back to smooth heavily rounded ones
  { regex: /\brounded-lg\b/g, replacement: 'rounded-2xl' },
  { regex: /\brounded-md\b/g, replacement: 'rounded-xl' },
];

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkDir(directory);
console.log("Refactor complete.");
