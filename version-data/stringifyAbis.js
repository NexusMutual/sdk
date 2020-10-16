const abis = require('./input.json').map(data => ({
  ...data,
  contractAbi: JSON.stringify(data.contractAbi),
}));

const data = { kovan: { abis } };
require('fs').writeFileSync('data.json', JSON.stringify(data, null, 2));
