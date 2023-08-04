const fs = require('node:fs');
const path = require('node:path');
const { build } = require('tsup');

const main = async () => {
  const dist = path.join(__dirname, '../dist');
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true });
  }

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
  const outDir = path.join(dist, 'logos');
  const srcDir = path.join(__dirname, '../generated/logos-src');
  fs.mkdirSync(outDir);
  const dirents = await fs.promises.readdir(srcDir, { withFileTypes: true });
  for (const dirent of dirents) {
    if (dirent.isFile()) {
      const source = path.join(srcDir, dirent.name);
      const dest = path.join(outDir, dirent.name);
      fs.copyFileSync(source, dest);
    }
  }
};

main()
  .catch(err => {
    console.log(err);
    process.exit(1);
  })
  .then(() => process.exit(0));
