const fs = require('fs');
const path = require('path');

const srcDir = 'c:/Users/rajpu/Documents/AI-BI/frontend/src';
const pagesDir = path.join(srcDir, 'pages');

// App.tsx
let appContent = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf8');
if (!appContent.includes('import Logo')) {
  appContent = appContent.replace(
    /import \{ NavLink \} from 'react-router-dom';/,
    "import { NavLink } from 'react-router-dom';\nimport Logo from './components/Logo';"
  );
}
appContent = appContent.replace(
  /<div className="text-2xl font-bold tracking-tight mb-8 px-2 flex items-center gap-3">[\s\S]*?<span>AIBI<span className="text-accent-indigo">\.<\/span><\/span>\s*<\/div>/,
  `<div className="mb-10 pl-2">
          <Logo size="sm" />
        </div>`
);
fs.writeFileSync(path.join(srcDir, 'App.tsx'), appContent, 'utf8');


// Pages
const pagesToUpdate = [
  'Login.tsx', 
  'Register.tsx', 
  'VerifyEmail.tsx', 
  'ForgotPassword.tsx', 
  'ResetPassword.tsx'
];

for (const page of pagesToUpdate) {
  const fullPath = path.join(pagesDir, page);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (!content.includes('import Logo')) {
      content = content.replace(
        /import \{ Link/g,
        "import Logo from '../components/Logo';\nimport { Link"
      );
      // Fallback if Link is not the first import of React-router
      if (!content.includes("import Logo from '../components/Logo';")) {
        content = "import Logo from '../components/Logo';\n" + content;
      }
    }
    
    // Replace old logo block
    content = content.replace(
      /<div className="w-16 h-16 bg-accent-indigo\/10 rounded-2xl flex items-center justify-center mb-4 border border-accent-indigo\/20 text-accent-indigo">[\s\S]*?<\/div>/,
      `<div className="flex justify-center mb-2">
              <Logo size="lg" />
            </div>`
    );
    
    // Clean up specific welcome texts to remove the explicit "AIBI" since the new logo has it built-in huge.
    content = content.replace(/>Welcome back to AIBI</g, ">Welcome back<");
    content = content.replace(/>Create an AIBI account</g, ">Create an account<");

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${fullPath}`);
  }
}

console.log('Logo replacement complete.');
