#!/usr/bin/env node

const path = require('node:path');
const { mkdir, readdir, copyFile } = require('node:fs').promises;
const { rimraf } = require('rimraf');

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

  await rimraf(targetPath);
  await mkdir(targetPath);

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
