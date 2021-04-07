const abis = require('./data.json').mainnet.abis.map(data => ({
  ...data,
  contractAbi: JSON.parse(data.contractAbi),
}));

require('fs').writeFileSync('input.json', JSON.stringify(abis, null, 2));
