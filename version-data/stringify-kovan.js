const abis = require('./input-kovan.json').map(data => ({
	...data,
	contractAbi: JSON.stringify(data.contractAbi),
}));

const data = {kovan: {abis}};
require('fs').writeFileSync('data-kovan.json', JSON.stringify(data, null, 2));
