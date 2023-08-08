const productLogos = require('../public/data/product-logos.json');
const { loadConfig, optimize } = require('svgo');
const { appendFile, mkdir, readdir, readFile, writeFile, copyFile } = require('fs').promises;
const camelcase = require('camelcase');
const path = require('path');
const babel = require('@babel/core');
const { transform } = require('@svgr/core');
const pluginTransformReactJsx = require('@babel/plugin-transform-react-jsx');

const OUTPUT_DIR = path.join(__dirname, '../generated/logos');
const OUTPUT_DIR_IMAGES = path.join(__dirname, '../generated/logos-src');

const buildLogos = async () => {
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(OUTPUT_DIR_IMAGES, { recursive: true });

  // Find all logos in the src/ folder
  const logosDir = path.join(__dirname, '../src/logos');
  const allFilePaths = await readFiles(logosDir);
  const svgFilePaths = allFilePaths.filter(path => path.endsWith('.svg'));
  const otherFilePaths = allFilePaths.filter(path => !path.endsWith('.svg'));

  // Validate if all products have a logo
  const missingLogos = productLogos.filter(filename => !allFilePaths.find(fp => fp.endsWith(filename)));
  if (missingLogos.length > 0) {
    throw new Error(`Missing file for filepath: ${missingLogos.join(', ')}`);
  }

  // Validate if all logos are used by products
  const excessLogos = allFilePaths.map(p => path.basename(p)).filter(filename => !productLogos.includes(filename));
  if (excessLogos.length > 0) {
    console.error(`[WARNING] The following logos have no associated product: ${excessLogos.join(', ')}`);
  }

  // Load `./svgo.config.js`
  const config = await loadConfig();

  // Create a Promise for each svg transformation
  const transformations = svgFilePaths.map(async filePath => {
    const content = await readFile(filePath);
    const filename = path.basename(filePath, '.svg');
    const name = camelcase(filename, {
      pascalCase: true,
    });
    const { svg, code } = await optimizeSvg(name, content, config);
    const types = createTypeDef(name);

    await writeFile(path.join(OUTPUT_DIR, `${name}.js`), code);
    await writeFile(path.join(OUTPUT_DIR, `${name}.d.ts`), types);
    await writeFile(path.join(OUTPUT_DIR_IMAGES, `${filename}.svg`), svg);

    return { name, filename, code, types, svg };
  });

  // Copy over non-svg files for legacy support. These files should be replaced with svg's
  otherFilePaths.forEach(async filePath => {
    const filename = path.basename(filePath);
    console.log(`Copy ${filename} for legacy support`);
    await copyFile(filePath, path.join(OUTPUT_DIR_IMAGES, filename));
  });

  // Execute all the transformations in parallel
  const components = await Promise.all(transformations);

  const componentNames = components.map(({ name }) => name);

  // Write index files
  await writeFile(path.join(OUTPUT_DIR, 'index.js'), createIndexJs(componentNames));
  await writeFile(path.join(OUTPUT_DIR, 'index.d.ts'), createIndexDts(componentNames));

  // Add `allLogoFileNames` array for utility use
  await appendFile(
    path.join(OUTPUT_DIR, 'index.js'),
    `\nexport const allLogoFileNames = ['${allFilePaths.map(filepath => path.basename(filepath)).join("', '")}'];`,
  );
  await appendFile(
    path.join(OUTPUT_DIR, 'index.d.ts'),
    `\nexport type LogoFileName = '${allFilePaths.map(filepath => path.basename(filepath)).join("' | '")}';`,
  );
  await appendFile(path.join(OUTPUT_DIR, 'index.d.ts'), `\nexport declare const allLogoFileNames: LogoFileName[];`);
};

/**
 * Utils
 */

function createIndexJs(componentNames) {
  return componentNames.map(name => `export { default as ${name} } from './${name}.js';`).join('\n');
}

function createIndexDts(componentNames) {
  return componentNames.map(name => `export { default as ${name} } from './${name}';`).join('\n');
}

function createTypeDef(componentName) {
  return `\
import * as React from 'react';
declare function ${componentName}(props: React.ComponentProps<'svg'>): JSX.Element;
export default ${componentName};
`;
}

async function optimizeSvg(componentName, svgStr, svgoConfig) {
  // Optimize the svg
  const { data } = optimize(svgStr, svgoConfig);

  // Transform the svg to jsx
  const component = await transform(data, { ref: true }, { componentName });

  // Transform the jsx to js
  const { code } = await babel.transformAsync(component, {
    plugins: [[pluginTransformReactJsx, { useBuiltIns: true }]],
  });

  return {
    svg: data,
    code,
  };
}

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
