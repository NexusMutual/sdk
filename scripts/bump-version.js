const fs = require('fs');
const path = require('path');

const semver = require('semver');

const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');
const PACKAGE_LOCK_PATH = path.join(__dirname, '../package-lock.json');

const packageJson = require(PACKAGE_JSON_PATH);
const packageLock = require(PACKAGE_LOCK_PATH);

const previousVersion = packageJson.version;
const release = process.argv[2] || 'patch';

if (!['major', 'minor', 'patch'].includes(release)) {
  console.error(`Invalid release type: ${release}`);
  process.exit(1);
}

const version = semver.inc(previousVersion, release);

fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify({ ...packageJson, version }, null, 2));
fs.writeFileSync(PACKAGE_LOCK_PATH, JSON.stringify({ ...packageLock, version }, null, 2));

console.log(`Version bumped from ${previousVersion} to ${version}`);
