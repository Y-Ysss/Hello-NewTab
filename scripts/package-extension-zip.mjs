import { readdir, readFile, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { deflateRawSync } from 'node:zlib';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = resolve(projectRoot, 'dist');
const outputDirectory = resolve(projectRoot, 'build');
const manifestPath = resolve(distDirectory, 'manifest.json');
const outputRelativePath = relative(projectRoot, outputDirectory);

if (
  !outputRelativePath ||
  outputRelativePath === '..' ||
  outputRelativePath.startsWith(`..${sep}`) ||
  isAbsolute(outputRelativePath)
) {
  throw new Error('Refusing to write the ZIP outside the project root.');
}

let manifestInfo;
try {
  manifestInfo = await stat(manifestPath);
} catch (error) {
  if (error.code === 'ENOENT') {
    throw new Error(
      `Cannot create extension ZIP: ${manifestPath} was not found. Run the build step first.`,
    );
  }
  throw error;
}
if (!manifestInfo.isFile()) {
  throw new Error(`Cannot create extension ZIP: ${manifestPath} is not a file.`);
}

const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const safeName = String(manifest.name ?? '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const version = String(manifest.version ?? '');
if (!safeName || !/^[a-zA-Z0-9._-]+$/.test(version)) {
  throw new Error('Cannot create extension ZIP: manifest name or version is missing or invalid.');
}

const crc32Table = Uint32Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(data) {
  let value = 0xffffffff;
  for (const byte of data) {
    value = (value >>> 8) ^ crc32Table[(value ^ byte) & 0xff];
  }
  return (value ^ 0xffffffff) >>> 0;
}

function writeZip(entries) {
  if (entries.length > 0xffff) {
    throw new Error('Cannot create extension ZIP: too many files for a non-ZIP64 archive.');
  }

  const localRecords = [];
  const centralRecords = [];
  let localOffset = 0;

  for (const entry of entries) {
    const fileName = Buffer.from(entry.name, 'utf8');
    if (fileName.length > 0xffff) {
      throw new Error(`Cannot create extension ZIP: file name is too long: ${entry.name}`);
    }

    const compressedData = deflateRawSync(entry.data);
    const fileCrc32 = crc32(entry.data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(33, 12);
    localHeader.writeUInt32LE(fileCrc32, 14);
    localHeader.writeUInt32LE(compressedData.length, 18);
    localHeader.writeUInt32LE(entry.data.length, 22);
    localHeader.writeUInt16LE(fileName.length, 26);
    localHeader.writeUInt16LE(0, 28);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(33, 14);
    centralHeader.writeUInt32LE(fileCrc32, 16);
    centralHeader.writeUInt32LE(compressedData.length, 20);
    centralHeader.writeUInt32LE(entry.data.length, 24);
    centralHeader.writeUInt16LE(fileName.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(localOffset, 42);

    localRecords.push(localHeader, fileName, compressedData);
    centralRecords.push(centralHeader, fileName);
    localOffset += localHeader.length + fileName.length + compressedData.length;
  }

  const centralDirectory = Buffer.concat(centralRecords);
  if (localOffset + centralDirectory.length > 0xffffffff) {
    throw new Error('Cannot create extension ZIP: archive is too large for a non-ZIP64 archive.');
  }

  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4);
  endRecord.writeUInt16LE(0, 6);
  endRecord.writeUInt16LE(entries.length, 8);
  endRecord.writeUInt16LE(entries.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(localOffset, 16);
  endRecord.writeUInt16LE(0, 20);

  return Buffer.concat([...localRecords, centralDirectory, endRecord]);
}

async function collectFiles(directory, relativeDirectory = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  const files = [];

  for (const entry of entries) {
    const filePath = resolve(directory, entry.name);
    const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;

    if (entry.isSymbolicLink()) {
      throw new Error(
        `Cannot create extension ZIP: symbolic links are not supported: ${relativePath}`,
      );
    }
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(filePath, relativePath)));
    } else if (entry.isFile()) {
      files.push({ name: relativePath.split(sep).join('/'), data: await readFile(filePath) });
    }
  }

  return files;
}

const files = await collectFiles(distDirectory);
if (!files.some((file) => file.name === 'manifest.json')) {
  throw new Error('Cannot create extension ZIP: manifest.json must be at the ZIP root.');
}

await mkdir(outputDirectory, { recursive: true });
const zipPath = resolve(outputDirectory, `${safeName}-${version}.zip`);
await rm(zipPath, { force: true });
await writeFile(zipPath, writeZip(files));

console.log(`Extension ZIP packaged at ${zipPath}`);
