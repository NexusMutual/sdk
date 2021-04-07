const abis = require('./input.json').map(data => ({
  ...data,
  contractAbi: JSON.stringify(data.contractAbi),
}));

const data = { mainnet: { abis } };
require('fs').writeFileSync('data.json', JSON.stringify(data, null, 2));
