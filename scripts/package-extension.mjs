import { cp, rm, stat } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = resolve(projectRoot, 'src');
const outputDir = resolve(projectRoot, 'dist');
const outputRelativePath = relative(projectRoot, outputDir);

if (
  !outputRelativePath ||
  outputRelativePath === '..' ||
  outputRelativePath.startsWith(`..${sep}`) ||
  isAbsolute(outputRelativePath)
) {
  throw new Error('Refusing to clear an output directory outside the project root.');
}

const manifestPath = resolve(sourceDir, 'manifest.json');
let manifestInfo;
try {
  manifestInfo = await stat(manifestPath);
} catch (error) {
  if (error.code === 'ENOENT') {
    throw new Error(`Cannot package extension: ${manifestPath} was not found.`);
  }
  throw error;
}
if (!manifestInfo.isFile()) {
  throw new Error(`Cannot package extension: ${manifestPath} is not a file.`);
}

await rm(outputDir, { recursive: true, force: true });
await cp(sourceDir, outputDir, { recursive: true });

console.log('Extension packaged in dist/.');
