import sdk, { CoverAsset } from '../dist';
import { Wallet, Contract, providers, Event } from 'ethers';
import { addresses, abis } from '@nexusmutual/deployments';
import * as ethers from 'ethers';

const COVER_BROKER_ADDRESS = '0x0000cbd7a26f72ff222bf5f136901d224b08be4e';

const productId = 150;
const coverAmount = ethers.utils.parseEther('0.001').toString();
const coverPeriod = 28;
const coverAsset = CoverAsset.ETH;
const PRIVATE_KEY = '0x191d2ce20eafe97882551cee7f04592784a2c598482508474cbc343731c0e844';

const provider = new providers.JsonRpcProvider(process.env.PROVIDER_URL);

const execute = async () => {
  const signer = new Wallet(PRIVATE_KEY, provider);
  const coverBuyerAddress = signer.address;
  const coverBrokerContract = new Contract(COVER_BROKER_ADDRESS, COVER_BROKER_ABI(), signer);
  const response = await sdk.getQuoteAndBuyCoverInputs(
    productId,
    coverAmount,
    coverPeriod,
    coverAsset,
    coverBuyerAddress as any,
  );
  console.debug('result: ', require('util').inspect(response.result, { depth: null }));

  console.info('DISPLAY INFO:', require('util').inspect(response.result?.displayInfo, { depth: null }));

  if (response.result) {
    const { buyCoverParams, poolAllocationRequests } = response.result?.buyCoverInput;
    const tx = await coverBrokerContract.buyCover(buyCoverParams, poolAllocationRequests, {
      gasLimit: 999999,
    });
    const txReceipt = await tx.wait();
    console.debug('txReceipt: ', require('util').inspect(txReceipt, { depth: null }));
  }
};

function COVER_BROKER_ABI() {
  return [
    {
      inputs: [
        { internalType: 'address', name: '_cover', type: 'address' },
        { internalType: 'address', name: '_memberRoles', type: 'address' },
        { internalType: 'address', name: '_nxmToken', type: 'address' },
        { internalType: 'address', name: '_master', type: 'address' },
        { internalType: 'address', name: '_owner', type: 'address' },
      ],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    { inputs: [], name: 'InvalidOwnerAddress', type: 'error' },
    { inputs: [], name: 'InvalidPayment', type: 'error' },
    { inputs: [], name: 'InvalidPaymentAsset', type: 'error' },
    {
      inputs: [
        { internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'uint256', name: 'value', type: 'uint256' },
        { internalType: 'address', name: 'token', type: 'address' },
      ],
      name: 'TransferFailed',
      type: 'error',
    },
    { inputs: [{ internalType: 'address', name: 'token', type: 'address' }], name: 'ZeroBalance', type: 'error' },
    {
      anonymous: false,
      inputs: [
        { indexed: true, internalType: 'address', name: 'previousOwner', type: 'address' },
        { indexed: true, internalType: 'address', name: 'newOwner', type: 'address' },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      inputs: [],
      name: 'ETH',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          components: [
            { internalType: 'uint256', name: 'coverId', type: 'uint256' },
            { internalType: 'address', name: 'owner', type: 'address' },
            { internalType: 'uint24', name: 'productId', type: 'uint24' },
            { internalType: 'uint8', name: 'coverAsset', type: 'uint8' },
            { internalType: 'uint96', name: 'amount', type: 'uint96' },
            { internalType: 'uint32', name: 'period', type: 'uint32' },
            { internalType: 'uint256', name: 'maxPremiumInAsset', type: 'uint256' },
            { internalType: 'uint8', name: 'paymentAsset', type: 'uint8' },
            { internalType: 'uint16', name: 'commissionRatio', type: 'uint16' },
            { internalType: 'address', name: 'commissionDestination', type: 'address' },
            { internalType: 'string', name: 'ipfsData', type: 'string' },
          ],
          internalType: 'struct BuyCoverParams',
          name: 'params',
          type: 'tuple',
        },
        {
          components: [
            { internalType: 'uint40', name: 'poolId', type: 'uint40' },
            { internalType: 'bool', name: 'skip', type: 'bool' },
            { internalType: 'uint256', name: 'coverAmountInAsset', type: 'uint256' },
          ],
          internalType: 'struct PoolAllocationRequest[]',
          name: 'poolAllocationRequests',
          type: 'tuple[]',
        },
      ],
      name: 'buyCover',
      outputs: [{ internalType: 'uint256', name: 'coverId', type: 'uint256' }],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'cover',
      outputs: [{ internalType: 'contract ICover', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'master',
      outputs: [{ internalType: 'contract INXMMaster', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'contract IERC20', name: 'erc20', type: 'address' }],
      name: 'maxApproveCoverContract',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'memberRoles',
      outputs: [{ internalType: 'contract IMemberRoles', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'nxmToken',
      outputs: [{ internalType: 'contract INXMToken', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [],
      name: 'owner',
      outputs: [{ internalType: 'address', name: '', type: 'address' }],
      stateMutability: 'view',
      type: 'function',
    },
    { inputs: [], name: 'renounceOwnership', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    {
      inputs: [{ internalType: 'address', name: 'assetAddress', type: 'address' }],
      name: 'rescueFunds',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'newAddress', type: 'address' }],
      name: 'switchMembership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [{ internalType: 'address', name: 'newOwner', type: 'address' }],
      name: 'transferOwnership',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    { stateMutability: 'payable', type: 'receive' },
  ];
}

const getTx = async () => {
  const txHash = '0x4649c0e1181cb6ea1a21ffbff30c24aaff2de8d2b5596af31d93e45f28842073';
  const tx = await provider.getTransaction(txHash);
  const txResult = await tx.wait();
  console.log(txResult);
};

// struct BuyCoverParams {
//   uint coverId;
//   address owner;
//   uint24 productId;
//   uint8 coverAsset;
//   uint96 amount;
//   uint32 period;
//   uint maxPremiumInAsset;
//   uint8 paymentAsset;
//   uint16 commissionRatio;
//   address commissionDestination;
//   string ipfsData;
// }

const checkNftBalance = () => {
  // The ERC-721 contract address
  const contractAddress = '0xcafeaCa76be547F14D0220482667B42D8E7Bc3eb';

  // A simplified ABI with only the `balanceOf` function
  const erc721Abi = ['function balanceOf(address owner) external view returns (uint256)'];

  // Create a new contract instance
  const nftContract = new Contract(contractAddress, erc721Abi, provider);

  // The address you want to check
  const address = '0x285B3c10d269dB8ECc15A3404c56A2282b482d4a';

  async function checkNFTBalance() {
    try {
      // Call the `balanceOf` function
      const balance = await nftContract.balanceOf(address);
      console.log(`Address ${address} owns ${balance.toString()} NFT(s)`);
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  checkNFTBalance();
};

const getEvent = async () => {
  const txHash = '0x4649c0e1181cb6ea1a21ffbff30c24aaff2de8d2b5596af31d93e45f28842073';
  const coverContract = new Contract(addresses.Cover, abis.Cover, provider);
  try {
    // Get the transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);

    // Each event is an entry in the 'logs' array of the receipt
    // You can filter the logs by the contract address and event signature if you're looking for specific events
    const events = receipt.logs.filter(log => log.address.toLowerCase() === coverContract.address.toLowerCase());

    // If you know the event signature, you can decode the events
    // For example, if you are looking for a specific event named 'CoverPurchased'
    const coverPurchasedEvents = events.filter(
      log => log.topics[0] === coverContract.interface.getEventTopic('CoverEdited'),
    );

    // Decode the events to get a more friendly representation
    const decodedEvents = coverPurchasedEvents.map(event =>
      coverContract.interface.decodeEventLog('CoverEdited', event.data, event.topics),
    );

    console.log(decodedEvents);
  } catch (error) {
    console.error('An error occurred:', error);
  }
};

const getRevertCode = async (txHash: string) => {
  const tx = await provider.getTransaction(txHash);

  const response = await provider.call(
    {
      to: tx.to,
      from: tx.from,
      nonce: tx.nonce,
      gasLimit: tx.gasLimit,
      gasPrice: tx.gasPrice,
      data: tx.data,
      value: tx.value,
      chainId: tx.chainId,
      type: tx.type ?? undefined,
      accessList: tx.accessList,
    },
    tx.blockNumber,
  );

  console.log('ERROR: ', ethers.utils.toUtf8String('0x' + response.substring(138)));
};

// getTx();
execute();
// checkNftBalance();
// getEvent();
// getRevertCode('0xf5f53631e8e2ed60e3311c5b4f77ff8b23725b0368d302affeac1585b81464f4');
