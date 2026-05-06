const fs = require('fs');
const path = require('path');

const semver = require('semver');

const PACKAGE_JSON_PATH = path.join(__dirname, '../package.json');

const packageJson = require(PACKAGE_JSON_PATH);

const previousVersion = packageJson.version;
const release = process.argv[2] || 'patch';

if (!['major', 'minor', 'patch'].includes(release)) {
  console.error(`Invalid release type: ${release}`);
  process.exit(1);
}

const version = semver.inc(previousVersion, release);

fs.writeFileSync(PACKAGE_JSON_PATH, JSON.stringify({ ...packageJson, version }, null, 2));

console.log(`Version bumped from ${previousVersion} to ${version}`);
