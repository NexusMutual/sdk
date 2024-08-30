const { readdir, copyFile } = require('node:fs').promises;
const path = require('node:path');

/**
 * Usage:
 *  node node_modules/@nexusmutual/sdk/dist/scripts/copy-logos.cjs ./public/logos
 */
const main = async argv => {
  if (!argv[2]) {
    console.error('Please provide a target path');
    process.exit(1);
  }

  const targetPath = path.resolve(argv[2]);
  const sourcePath = path.resolve(__dirname, '../logos');

  const dirents = await readdir(sourcePath, { withFileTypes: true });
  dirents.forEach(dirent => {
    if (dirent.isFile()) {
      const sourceFile = path.resolve(sourcePath, dirent.name);
      const targetFile = path.resolve(targetPath, dirent.name);
      copyFile(sourceFile, targetFile);
    }
  });
};

main(process.argv);
