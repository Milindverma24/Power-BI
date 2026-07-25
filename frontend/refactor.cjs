const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/rajpu/Documents/AI-BI/frontend/src';

const replacements = [
  { regex: /\bbg-slate-900\b/g, replacement: 'bg-surface' },
  { regex: /\bbg-\[\#0a0a0a\]\b/g, replacement: 'bg-surface' },
  { regex: /\bbg-\[\#111111\]\b/g, replacement: 'bg-surface-hover' },
  { regex: /\bbg-slate-800\b/g, replacement: 'bg-surface-hover' },
  { regex: /\btext-white\b/g, replacement: 'text-main' },
  { regex: /\btext-slate-200\b/g, replacement: 'text-main' },
  { regex: /\btext-slate-300\b/g, replacement: 'text-main' },
  { regex: /\btext-slate-400\b/g, replacement: 'text-muted' },
  { regex: /\btext-slate-500\b/g, replacement: 'text-muted' },
  { regex: /\bborder-slate-700\/50\b/g, replacement: 'border-border-theme' },
  { regex: /\bborder-slate-700\b/g, replacement: 'border-border-theme' },
  { regex: /\bborder-slate-800\/50\b/g, replacement: 'border-border-theme' },
  { regex: /\bborder-slate-800\b/g, replacement: 'border-border-theme' },
  { regex: /\bborder-white\/\[0\.\d+\]\b/g, replacement: 'border-border-theme' },
  { regex: /\brounded-2xl\b/g, replacement: 'rounded-lg' },
  { regex: /\brounded-3xl\b/g, replacement: 'rounded-lg' },
  { regex: /\brounded-\[2rem\]\b/g, replacement: 'rounded-lg' },
  { regex: /\brounded-xl\b/g, replacement: 'rounded-md' },
  { regex: /\bshadow-2xl\b/g, replacement: 'shadow-[0_4px_20px_rgba(192,255,0,0.15)]' },
  { regex: /\bshadow-lg\b/g, replacement: 'shadow-[0_4px_20px_rgba(192,255,0,0.15)]' },
  { regex: /\bbg-surface\/80\b/g, replacement: 'bg-surface/80' } // Ensure transparency remains if needed, but it might get tricky. The regex above won't break it unless it matches bg-slate-900/50.
];

// Add replacements for bg-slate-900/50 etc
replacements.push({ regex: /\bbg-slate-900\/\d+\b/g, replacement: 'bg-surface/50' });

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
