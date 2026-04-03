import fs from 'node:fs';
import path from 'node:path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changes = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  const initial = content;

  // Add loading="lazy" safely to all <img> tags that don't already have it
  content = content.replace(/<img(?![^>]*loading="lazy")/gi, '<img loading="lazy"');

  if (content !== initial) {
    fs.writeFileSync(file, content, 'utf8');
    changes++;
  }
});

console.log('Lazy Loading applied to ' + changes + ' .jsx files.');
