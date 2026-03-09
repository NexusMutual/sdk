require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');

const { build } = require('tsup');

const main = async () => {
  // Clean directories
  const dist = path.join(__dirname, '../dist');
  const generated = path.join(__dirname, '../generated');
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true });
  }
  if (fs.existsSync(generated)) {
    fs.rmSync(generated, { recursive: true });
  }

  // Create generated directory and its initial content
  fs.mkdirSync(generated, { recursive: true });

  // Generate version file
  const sdkVersionPath = path.join(generated, 'version.json');
  const { version } = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
  fs.writeFileSync(sdkVersionPath, JSON.stringify({ version }, null, 2));

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

  // Copy version.json from generated to dist
  const generatedDir = path.join(__dirname, '../generated');
  fs.copyFileSync(path.join(generatedDir, 'version.json'), path.join(dist, 'data/version.json'));
};

main()
  .catch(err => {
    console.log(err);
    process.exit(1);
  })
  .then(() => process.exit(0));
