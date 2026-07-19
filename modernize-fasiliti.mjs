import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'src/app/aduan/fasiliti/page.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Change blue labels to standard black/dark gray. The user asked for '#000' (same as lokasi lain text).
content = content.replace(/color:\s*'blue'/g, "color: '#000'");

// 2. Modernize the inputs and selects (padding: '1px 2px', border: '1px solid #777')
// Replace padding: '1px 2px' or padding: '2px' with padding: '7px 10px'
content = content.replace(/padding:\s*'1px 2px'/g, "padding: '7px 10px'");
content = content.replace(/padding:\s*'2px'/g, "padding: '8px 10px'");

// Replace border: '1px solid #777' or '#a9a9a9' with border: '1px solid #d1d5db'
content = content.replace(/border:\s*'1px solid #777'/g, "border: '1px solid #d1d5db'");
content = content.replace(/border:\s*'1px solid #a9a9a9'/g, "border: '1px solid #d1d5db'");

// Modernize the hantar button which has very old styling:
// padding: '2px 8px', backgroundColor: '#e9e9ed', border: '1px solid #777' -> wait, it might be better to just give it className="btn btn-primary"
content = content.replace(
  /style={{\s*padding:\s*'2px 8px',\s*backgroundColor:\s*'#e9e9ed',[^}]*}}/g,
  `className="btn btn-primary" style={{ padding: '10px 24px', fontWeight: 600, fontSize: '0.9rem' }}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fasiliti form modernized.');
