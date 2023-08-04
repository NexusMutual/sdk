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
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true,
    publicDir: 'public',
  });
};

main()
  .catch(err => {
    console.log(err);
    process.exit(1);
  })
  .then(() => process.exit(0));
