require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');

const { build } = require('tsup');

const { buildLogos } = require('./build-logos');
const { buildProducts } = require('./build-products');

const main = async () => {
  const dist = path.join(__dirname, '../dist');
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true });
  }

  const generated = path.join(__dirname, '../generated');
  if (fs.existsSync(generated)) {
    fs.rmSync(generated, { recursive: true });
  }

  await buildLogos();
  await buildProducts();

  await build({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    external: ['react'],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    publicDir: 'public',
  });

  // Copy over all processed logo files to dist
  const logosOutDir = path.join(dist, 'logos');
  const logosSrcDir = path.join(__dirname, '../generated/logos');
  fs.mkdirSync(logosOutDir);
  const logoDirents = await fs.promises.readdir(logosSrcDir, { withFileTypes: true });
  for (const dirent of logoDirents) {
    if (dirent.isFile()) {
      const source = path.join(logosSrcDir, dirent.name);
      const dest = path.join(logosOutDir, dirent.name);
      fs.copyFileSync(source, dest);
    }
  }

  // Copy addresses from @nexusmutual/deployments package
  const addressesFile = path.join(__dirname, '../node_modules/@nexusmutual/deployments/dist/data/addresses.json');
  const dataOutDir = path.join(dist, 'data');
  fs.mkdirSync(dataOutDir, { recursive: true });
  fs.copyFileSync(addressesFile, path.join(dataOutDir, 'addresses.json'));

  // Copy abis from @nexusmutual/deployments package
  const abisOutDir = path.join(dist, 'data/abis');
  const abisSrcDir = path.join(__dirname, '../node_modules/@nexusmutual/deployments/dist/data/abis');
  fs.mkdirSync(abisOutDir, { recursive: true });
  const abiDirents = await fs.promises.readdir(abisSrcDir, { withFileTypes: true });
  for (const dirent of abiDirents) {
    if (dirent.isFile()) {
      const source = path.join(abisSrcDir, dirent.name);
      const dest = path.join(abisOutDir, dirent.name);
      fs.copyFileSync(source, dest);
    }
  }

  // Copy products.json and product-types.json from generated to dist
  const generatedDir = path.join(__dirname, '../generated');
  fs.copyFileSync(path.join(generatedDir, 'products.json'), path.join(dist, 'data/products.json'));
  fs.copyFileSync(path.join(generatedDir, 'product-types.json'), path.join(dist, 'data/product-types.json'));
};

main()
  .catch(err => {
    console.log(err);
    process.exit(1);
  })
  .then(() => process.exit(0));
