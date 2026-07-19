import fs from 'fs';
import path from 'path';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // For CSS files
  if (filePath.endsWith('.css')) {
    // Skip replacing border-radius: 50%
    const cssRegex = /border-radius\s*:\s*(?!50%|0(?![0-9]))[^;]+;/gi;
    if (cssRegex.test(content)) {
      content = content.replace(cssRegex, 'border-radius: 0;');
      changed = true;
    }
    // Also fix variable definitions if they are used like --radius: 12px;
    const varRegex1 = /--radius\s*:\s*[^;]+;/g;
    const varRegex2 = /--radius-sm\s*:\s*[^;]+;/g;
    if (varRegex1.test(content)) {
      content = content.replace(varRegex1, '--radius: 0px;');
      changed = true;
    }
    if (varRegex2.test(content)) {
      content = content.replace(varRegex2, '--radius-sm: 0px;');
      changed = true;
    }
  }

  // For JS/JSX files
  if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
    // Matches borderRadius: <number> or borderRadius: '<string>'
    // Skips borderRadius: '50%' and borderRadius: 0
    const jsRegexNumber = /borderRadius\s*:\s*(?!0\b)\d+/g;
    const jsRegexString = /borderRadius\s*:\s*(?!'50%'|"50%"|'0'|"0")['"][^'"]+['"]/g;

    if (jsRegexNumber.test(content)) {
      content = content.replace(jsRegexNumber, 'borderRadius: 0');
      changed = true;
    }
    if (jsRegexString.test(content)) {
      content = content.replace(jsRegexString, 'borderRadius: 0');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx') || fullPath.endsWith('.css')) {
      processFile(fullPath);
    }
  }
}

walkDir('./src');
