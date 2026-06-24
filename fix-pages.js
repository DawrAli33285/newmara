const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (f === 'page.js' && fs.readFileSync(full, 'utf8').trim() === '') {
      const name = path.basename(path.dirname(full));
      const comp = name.replace(/[^a-zA-Z]/g, '') + 'Page';
      fs.writeFileSync(full, `export default function ${comp}() {\n  return <div><h1>${name}</h1></div>;\n}\n`);
      console.log('Fixed:', full);
    }
  });
}
walk('./app');