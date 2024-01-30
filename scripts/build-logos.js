const { loadConfig, optimize } = require('svgo');
const { appendFile, mkdir, readdir, readFile, writeFile, copyFile } = require('fs').promises;
const path = require('path');

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
    const filename = path.basename(filePath, '.svg');

    // Check if the filename starts with a number, if so split on dash. If not, take the whole filename
    const name = /\d+-/.test(filename) ? filename.substring(filename.indexOf('-') + 1) : filename;

    const { data } = optimize(content, config);

    return { name, svg: data };
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
    const rawFilename = path.basename(filePath);

    // Check if the filename starts with a number, if so split on dash. If not, take the whole filename
    const filename = /\d+-/.test(rawFilename) ? rawFilename.substring(rawFilename.indexOf('-') + 1) : rawFilename;

    console.log(`Copy ${filename} for legacy support`);
    await copyFile(filePath, path.join(LOGOS_OUTPUT_DIR, filename));
  });

  // Add `allLogoFileNames` array and `LogoFileName` type for utility use
  const allLogoFileNames = allFileNames.map(filepath => path.basename(filepath).replace(/\.svg$/, ''));
  await appendFile(
    path.join(GENERATED_OUTPUT_DIR, 'types.ts'),
    'export const allLogoFileNames = [\n' +
      `  '${allLogoFileNames.join("',\n  '")}` +
      "',\n] as const;\n" +
      '\nexport type LogoFileName = (typeof allLogoFileNames)[number];\n',
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
