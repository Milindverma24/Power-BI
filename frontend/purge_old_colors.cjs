const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/rajpu/Documents/AI-BI/frontend/src';

const replacements = [
  // 1. Remove hardcoded dark backgrounds
  { regex: /\bbg-slate-950\b/g, replacement: 'bg-surface' },
  { regex: /\bbg-slate-900\b/g, replacement: 'bg-surface' },
  { regex: /\bbg-slate-800\b/g, replacement: 'bg-surface-hover' },
  { regex: /\bbg-slate-700\b/g, replacement: 'bg-surface-hover' },
  { regex: /\bborder-slate-600\b/g, replacement: 'border-border-theme' },
  { regex: /\bhover:bg-slate-700\b/g, replacement: 'hover:bg-surface-hover' },
  { regex: /\bhover:bg-slate-600\b/g, replacement: 'hover:bg-surface-hover' },
  
  // 2. Remove hardcoded neon/indigo buttons (map to accent-indigo)
  { regex: /\bbg-primary-600\b/g, replacement: 'bg-accent-indigo' },
  { regex: /\bbg-primary-500\b/g, replacement: 'bg-accent-indigo' },
  { regex: /\bhover:bg-primary-500\b/g, replacement: 'hover:opacity-90' },
  { regex: /\bhover:bg-primary-600\b/g, replacement: 'hover:opacity-90' },
  
  { regex: /\bbg-indigo-500\b/g, replacement: 'bg-accent-indigo' },
  { regex: /\bbg-indigo-600\b/g, replacement: 'bg-accent-indigo' },
  { regex: /\bhover:bg-indigo-600\b/g, replacement: 'hover:opacity-90' },
  { regex: /\bhover:bg-indigo-500\b/g, replacement: 'hover:opacity-90' },
  
  // Text inside primary buttons was black (for neon lime). Now it's indigo, so text must be white.
  // We'll replace text-black with text-white IF it's likely inside a button (we'll just replace text-black globally since the app uses text-main for standard text, not text-black)
  { regex: /\btext-black\b/g, replacement: 'text-white' },

  // Primary text colors
  { regex: /\btext-primary-600\b/g, replacement: 'text-accent-indigo' },
  { regex: /\btext-primary-500\b/g, replacement: 'text-accent-indigo' },
  { regex: /\bhover:text-primary-600\b/g, replacement: 'hover:text-accent-indigo' },
  
  // Primary borders and shadows
  { regex: /\bborder-primary-600\b/g, replacement: 'border-accent-indigo' },
  { regex: /\bborder-primary-500\b/g, replacement: 'border-accent-indigo' },
  
  { regex: /shadow-\[0_4px_20px_rgba\(192,255,0,0\.15\)\]/g, replacement: 'shadow-[0_4px_20px_rgba(79,70,229,0.15)]' },
  { regex: /shadow-\[0_0_15px_rgba\(192,255,0,0\.2\)\]/g, replacement: 'shadow-[0_0_15px_rgba(79,70,229,0.2)]' },
  { regex: /shadow-\[0_0_20px_rgba\(192,255,0,0\.3\)\]/g, replacement: 'shadow-[0_0_20px_rgba(79,70,229,0.3)]' },
  { regex: /shadow-\[0_0_30px_rgba\(192,255,0,0\.05\)\]/g, replacement: 'shadow-[0_0_30px_rgba(79,70,229,0.05)]' },
  
  // Replace the custom shadow-primary-500/20 with indigo version
  { regex: /\bshadow-primary-500\/20\b/g, replacement: 'shadow-accent-indigo/20' },
  { regex: /\bshadow-indigo-500\/20\b/g, replacement: 'shadow-accent-indigo/20' }
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
console.log("Purge old colors complete.");
