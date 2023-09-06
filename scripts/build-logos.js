const { loadConfig, optimize } = require('svgo');
const { appendFile, mkdir, readdir, readFile, writeFile, copyFile } = require('fs').promises;
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../generated/logos');
const SRC_DIR = path.join(__dirname, '../src/logos');

const buildLogos = async () => {
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Find all logos in the src/ folder
  const allFilePaths = await readFiles(SRC_DIR);
  const allFileNames = allFilePaths.map(p => p.substring(p.indexOf('-') + 1));
  const svgFilePaths = allFilePaths.filter(path => path.endsWith('.svg'));
  const otherFilePaths = allFilePaths.filter(path => !path.endsWith('.svg'));

  // Load `./svgo.config.js`
  const config = await loadConfig();

  // Create a Promise for each svg transformation
  const transformations = svgFilePaths.map(async filePath => {
    const content = await readFile(filePath);
    const filename = path.basename(filePath, '.svg');
    const name = filename.substring(filename.indexOf('-') + 1);

    const { data } = optimize(content, config);

    return { name, svg: data };
  });

  // Execute all the transformations in parallel
  const components = await Promise.all(transformations);

  // Write each component to output directory
  await Promise.all(
    components.map(async ({ name, svg }) => {
      await writeFile(path.join(OUTPUT_DIR, `${name}.svg`), svg);
      console.log(`Copy optimized ${name}.svg`);
    }),
  );

  // Copy over non-svg files for legacy support. These files should be replaced with svg's
  otherFilePaths.forEach(async filePath => {
    const rawFilename = path.basename(filePath);
    const filename = rawFilename.substring(rawFilename.indexOf('-') + 1);
    console.log(`Copy ${filename} for legacy support`);
    await copyFile(filePath, path.join(OUTPUT_DIR, filename));
  });

  // Add `allLogoFileNames` array for utility use
  await appendFile(
    path.join(OUTPUT_DIR, 'types.ts'),
    `export type LogoFileName = '${allFileNames.map(filepath => path.basename(filepath)).join("' | '")}';\n`,
  );
  await appendFile(
    path.join(OUTPUT_DIR, 'types.ts'),
    `export const allLogoFileNames: LogoFileName[] = ['${allFileNames
      .map(filepath => path.basename(filepath))
      .join("', '")}'];\n`,
  );
};

async function readFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true });

  const nestedPaths = await Promise.all(
    dirents.map(dirent => {
      const res = path.resolve(dir, dirent.name);
      return dirent.isDirectory() ? readFiles(res) : res;
    }),
  );

  const paths = nestedPaths.flat();

  return paths;
}

module.exports = {
  buildLogos,
};
