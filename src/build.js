const fs = require('fs').promises;
const path = require('path');

async function processDirectory(sourcePath, targetPath) {
  await fs.mkdir(targetPath, { recursive: true });

  const items = await fs.readdir(sourcePath, { withFileTypes: true });

  for (const item of items) {
    const sourceItemPath = path.join(sourcePath, item.name);
    const targetItemPath = path.join(targetPath, item.name);

    if (item.isDirectory()) {
      await processDirectory(sourceItemPath, targetItemPath);
    } else {
      if (item.name.endsWith('.json')) {
        const content = await fs.readFile(sourceItemPath, 'utf8');
        const minified = JSON.stringify(JSON.parse(content));
        await fs.writeFile(targetItemPath, minified);
      } else if (item.name.endsWith('.txt')) {
        const content = await fs.readFile(sourceItemPath, 'utf8');
        const sorted = content
          .split('\n')
          .filter(line => line.trim())
          .sort()
          .join('\n');
        await fs.writeFile(targetItemPath, sorted + '\n');
      } else {
        await fs.copyFile(sourceItemPath, targetItemPath);
      }
    }
  }
}

const sourceDir = '../filters';
const targetDir = '../dist/filters';

await processDirectory(sourceDir, targetDir);