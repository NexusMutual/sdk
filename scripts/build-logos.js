const { appendFile, mkdir, readdir, readFile, writeFile, copyFile } = require('fs').promises;
const path = require('path');

const { loadConfig, optimize } = require('svgo');

const { parseFilePath } = require('./utils');

const GENERATED_OUTPUT_DIR = path.join(__dirname, '../generated');
const LOGOS_OUTPUT_DIR = path.join(GENERATED_OUTPUT_DIR, '/logos');
const SRC_DIR = path.join(__dirname, '../src/logos');

const buildLogos = async () => {
  await mkdir(LOGOS_OUTPUT_DIR, { recursive: true });

  // Find all logos in the src/ folder
  const allFilePaths = await readFiles(SRC_DIR);
  const allFileNames = allFilePaths.map(p => path.basename(p));
  const svgFilePaths = allFilePaths.filter(path => path.endsWith('.svg'));
  const otherFilePaths = allFilePaths.filter(path => !path.endsWith('.svg'));

  // Load `./svgo.config.js`
  const config = await loadConfig();

  // Create a Promise for each svg transformation
  const transformations = svgFilePaths.map(async filePath => {
    const content = await readFile(filePath);
    const { filename } = parseFilePath(filePath);

    const { data } = optimize(content, config);

    return { name: filename, svg: data };
  });

  // Execute all the transformations in parallel
  const components = await Promise.all(transformations);

  // Write each component to output directory
  await Promise.all(
    components.map(async ({ name, svg }) => {
      await writeFile(path.join(LOGOS_OUTPUT_DIR, `${name}.svg`), svg);
      console.log(`Copy optimized ${name}.svg`);
    }),
  );

  // Copy over non-svg files for legacy support. These files should be replaced with svg's
  otherFilePaths.forEach(async filePath => {
    const { filename, extension } = parseFilePath(filePath);
    console.log(`Copy ${filename} for legacy support`);
    await copyFile(filePath, path.join(LOGOS_OUTPUT_DIR, `${filename}.${extension}`));
  });

  // Contains all file names including extension
  const allLogoFileNames = allFileNames.map(filePath => {
    const { filename, extension } = parseFilePath(filePath);
    return `${filename}.${extension}`;
  });

  // Contains all file names without extension
  const allLogoNames = allFileNames.map(filePath => {
    const { filename } = parseFilePath(filePath);
    return filename;
  });

  // Write `types.ts` file
  await appendFile(
    path.join(GENERATED_OUTPUT_DIR, 'types.ts'),
    `\
export const allLogoFileNames = [
  ${allLogoFileNames.map(filename => `'${filename}'`).join(',\n  ')}
] as const;

export type LogoFileName = (typeof allLogoFileNames)[number];

export const allLogoNames = [
  ${allLogoNames.map(name => `'${name}'`).join(',\n  ')}
] as const;

export type LogoName = (typeof allLogoNames)[number];
`,
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
