const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/rajpu/Documents/AI-BI/frontend/src';

const replacements = [
  // Indigo
  { regex: /\btext-indigo-400\b/g, replacement: 'text-accent-indigo' },
  { regex: /\btext-indigo-300\b/g, replacement: 'text-accent-indigo' },
  { regex: /\bbg-indigo-500\/10\b/g, replacement: 'bg-accent-indigo/10' },
  { regex: /\bbg-indigo-500\/20\b/g, replacement: 'bg-accent-indigo/20' },
  { regex: /\bborder-indigo-500\/20\b/g, replacement: 'border-accent-indigo/20' },
  
  // Emerald
  { regex: /\btext-emerald-400\b/g, replacement: 'text-accent-emerald' },
  { regex: /\bbg-emerald-500\/10\b/g, replacement: 'bg-accent-emerald/10' },
  { regex: /\bborder-emerald-500\/20\b/g, replacement: 'border-accent-emerald/20' },

  // Amber
  { regex: /\btext-amber-400\b/g, replacement: 'text-accent-amber' },
  { regex: /\btext-amber-300\b/g, replacement: 'text-accent-amber' },
  { regex: /\bbg-amber-500\/10\b/g, replacement: 'bg-accent-amber/10' },
  { regex: /\bborder-amber-500\/20\b/g, replacement: 'border-accent-amber/20' },

  // Red
  { regex: /\btext-red-400\b/g, replacement: 'text-accent-red' },
  { regex: /\bbg-red-500\/10\b/g, replacement: 'bg-accent-red/10' },
  { regex: /\bborder-red-500\/20\b/g, replacement: 'border-accent-red/20' },
  { regex: /\bborder-red-500\/50\b/g, replacement: 'border-accent-red/50' },

  // Purple
  { regex: /\btext-purple-400\b/g, replacement: 'text-accent-purple' },
  { regex: /\bbg-purple-500\/20\b/g, replacement: 'bg-accent-purple/20' },

  // Primary
  { regex: /\btext-primary-400\b/g, replacement: 'text-accent-primary' },
  { regex: /\btext-primary-300\b/g, replacement: 'text-accent-primary' },
  { regex: /\bbg-primary-500\/10\b/g, replacement: 'bg-accent-primary/10' },
  { regex: /\bbg-primary-500\/20\b/g, replacement: 'bg-accent-primary/20' },
  { regex: /\bborder-primary-500\/20\b/g, replacement: 'border-accent-primary/20' },
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
