const abis = require('./data-kovan.json').kovan.abis.map(data => ({
  ...data,
  contractAbi: JSON.parse(data.contractAbi),
}));

require('fs').writeFileSync('input-kovan.json', JSON.stringify(abis, null, 2));
