export enum ProductCategoryEnum {
  Lending = 'lending',
  Dex = 'dex',
  LiquidRestaking = 'liquid-restaking',
  YieldOptimizer = 'yield-optimizer',
  Perpetuals = 'perpetuals',
  SmartWallet = 'smart-wallet',
  ETHStaking = 'eth-staking',
  Depeg = 'depeg',
  Custody = 'custody',
  Slashing = 'slashing',
  Uncategorized = 'uncategorized',
}

export const categoryLabelByEnum: Record<ProductCategoryEnum, string> = {
  [ProductCategoryEnum.Lending]: 'Lending',
  [ProductCategoryEnum.Dex]: 'DEX',
  [ProductCategoryEnum.LiquidRestaking]: 'Liquid Restaking',
  [ProductCategoryEnum.YieldOptimizer]: 'Yield Optimizer',
  [ProductCategoryEnum.Perpetuals]: 'Perpetuals',
  [ProductCategoryEnum.SmartWallet]: 'Smart Wallet',
  [ProductCategoryEnum.ETHStaking]: 'ETH Staking',
  [ProductCategoryEnum.Depeg]: 'Depeg',
  [ProductCategoryEnum.Custody]: 'Custody',
  [ProductCategoryEnum.Slashing]: 'Slashing',
  [ProductCategoryEnum.Uncategorized]: 'Uncategorized',
};

export const productCategoryMap: { [productId: number]: ProductCategoryEnum } = {
  1: ProductCategoryEnum.Dex, // 1Inch (DEX & Liquidity Pools)
  2: ProductCategoryEnum.Lending, // Aave v2
  3: ProductCategoryEnum.Lending, // Abracadabra v1
  4: ProductCategoryEnum.YieldOptimizer, // Alchemix v2
  5: ProductCategoryEnum.Uncategorized, // Anchor (deprecated)
  6: ProductCategoryEnum.Lending, // Angle v1
  7: ProductCategoryEnum.SmartWallet, // Argent
  8: ProductCategoryEnum.YieldOptimizer, // Aura v1
  9: ProductCategoryEnum.Uncategorized, // Babylon Finance (deprecated)
  10: ProductCategoryEnum.Uncategorized, // BadgerDAO v1 (deprecated)
  11: ProductCategoryEnum.Dex, // Balancer v2
  12: ProductCategoryEnum.Uncategorized, // Bancor v2 (deprecated)
  13: ProductCategoryEnum.Uncategorized, // Bancor v3 (deprecated)
  14: ProductCategoryEnum.YieldOptimizer, // Beefy v2
  15: ProductCategoryEnum.Uncategorized, // Binance (deprecated)
  16: ProductCategoryEnum.Uncategorized, // BlockFi (deprecated)
  17: ProductCategoryEnum.Uncategorized, // Bundle: Gelt + mStable + Aave v2
  18: ProductCategoryEnum.Uncategorized, // Centrifuge Tinlake (deprecated)
  19: ProductCategoryEnum.Uncategorized, // Coinbase (deprecated)
  20: ProductCategoryEnum.Lending, // Compound v2
  21: ProductCategoryEnum.Uncategorized, // Convex 3CRV (cvx3CRV) (deprecated)
  22: ProductCategoryEnum.YieldOptimizer, // Convex Finance v1
  23: ProductCategoryEnum.Uncategorized, // Convex stethCrv (cvxstethCrv) (deprecated)
  24: ProductCategoryEnum.Uncategorized, // Crypto.com (deprecated)
  25: ProductCategoryEnum.Uncategorized, // Curve 3pool LP (3Crv) (deprecated)
  26: ProductCategoryEnum.Dex, // Curve All Pools (incl staking)
  27: ProductCategoryEnum.Uncategorized, // Curve sETH LP (eCrv) (deprecated)
  28: ProductCategoryEnum.Perpetuals, // dydx Perpetual
  29: ProductCategoryEnum.Uncategorized, // Ease v1
  30: ProductCategoryEnum.Uncategorized, // Enzyme v3 (deprecated)
  31: ProductCategoryEnum.YieldOptimizer, // Enzyme v4
  32: ProductCategoryEnum.Uncategorized, // Eth 2.0 (deposit contract) (deprecated)
  33: ProductCategoryEnum.Uncategorized, // Euler (deprecated)
  34: ProductCategoryEnum.Perpetuals, // FODL v1
  35: ProductCategoryEnum.Uncategorized, // FTX (deprecated)
  36: ProductCategoryEnum.Lending, // Gearbox v2
  37: ProductCategoryEnum.Uncategorized, // Gemini (deprecated)
  38: ProductCategoryEnum.Perpetuals, // GMX v1
  39: ProductCategoryEnum.Lending, // Goldfinch v1
  40: ProductCategoryEnum.Uncategorized, // Hodlnaut (deprecated)
  41: ProductCategoryEnum.Uncategorized, // Kraken (deprecated)
  42: ProductCategoryEnum.Uncategorized, // Ledn (deprecated)
  43: ProductCategoryEnum.Uncategorized, // Liquid Collective (deprecated)
  44: ProductCategoryEnum.Lending, // Liquity v1
  45: ProductCategoryEnum.Lending, // Sky Money
  46: ProductCategoryEnum.Uncategorized, // mStable (deprecated)
  47: ProductCategoryEnum.Uncategorized, // Nested v1 (deprecated)
  48: ProductCategoryEnum.Uncategorized, // Nexo (deprecated)
  49: ProductCategoryEnum.Lending, // Notional Finance v2
  50: ProductCategoryEnum.Uncategorized, // OlympusDAO (deprecated)
  51: ProductCategoryEnum.Perpetuals, // Opyn v2
  52: ProductCategoryEnum.Uncategorized, // Origin OUSD (deprecated)
  53: ProductCategoryEnum.Dex, // Pangolin v1
  54: ProductCategoryEnum.Perpetuals, // Perpetual Protocol v2
  55: ProductCategoryEnum.Uncategorized, // Pool Together v4 (deprecated)
  56: ProductCategoryEnum.Uncategorized, // Premia Finance (deprecated)
  57: ProductCategoryEnum.Uncategorized, // Rari Capital (deprecated)
  58: ProductCategoryEnum.Lending, // Reflexer v1
  59: ProductCategoryEnum.Perpetuals, // Aevo
  60: ProductCategoryEnum.SmartWallet, // Safe (formerly Gnosis Safe)
  61: ProductCategoryEnum.Uncategorized, // Set Protocol (deprecated)
  62: ProductCategoryEnum.YieldOptimizer, // Set Protocol v2
  63: ProductCategoryEnum.Uncategorized, // Stakewise(?)
  64: ProductCategoryEnum.YieldOptimizer, // Stake DAO v1
  65: ProductCategoryEnum.Uncategorized, // Stakewise 3rd party (3 ETH/validator) (deprecated)
  66: ProductCategoryEnum.Uncategorized, // Stakewise operated (3 ETH/validator) (deprecated)
  67: ProductCategoryEnum.Dex, // SushiSwap v1
  68: ProductCategoryEnum.Perpetuals, // Synthetix
  69: ProductCategoryEnum.Uncategorized, // THORChain (Thorchain Network) (deprecated)
  70: ProductCategoryEnum.Dex, // LFJ
  71: ProductCategoryEnum.Dex, // Uniswap v2
  72: ProductCategoryEnum.Dex, // Uniswap v3
  73: ProductCategoryEnum.YieldOptimizer, // Vector v1
  74: ProductCategoryEnum.YieldOptimizer, // Vesper v3
  75: ProductCategoryEnum.YieldOptimizer, // Yearn Finance v2 (all vaults)
  76: ProductCategoryEnum.Uncategorized, // Yearn yvUSDC v2 (deprecated)
  77: ProductCategoryEnum.Lending, // Yeti Finance v1
  78: ProductCategoryEnum.Uncategorized, // Yield App (deprecated)
  79: ProductCategoryEnum.YieldOptimizer, // Alpaca Finance v1
  80: ProductCategoryEnum.Lending, // WeFi v1
  81: ProductCategoryEnum.Lending, // Exactly
  82: ProductCategoryEnum.Uncategorized, // EtherFi 5ETH
  83: ProductCategoryEnum.Uncategorized, // Squeeth by Opyn (Sherlock)
  84: ProductCategoryEnum.Uncategorized, // Rage Trade (Sherlock)
  85: ProductCategoryEnum.Uncategorized, // Sentiment (Sherlock)
  86: ProductCategoryEnum.Uncategorized, // Lyra Newport (Sherlock)
  87: ProductCategoryEnum.Uncategorized, // Perennial (Sherlock)
  88: ProductCategoryEnum.Uncategorized, // LiquiFi (Sherlock)
  89: ProductCategoryEnum.Uncategorized, // Lyra Avalon (Sherlock)
  90: ProductCategoryEnum.Uncategorized, // Buffer Finance (Sherlock)
  91: ProductCategoryEnum.Uncategorized, // Hook (Sherlock)
  92: ProductCategoryEnum.Uncategorized, // Holyheld (Sherlock)
  93: ProductCategoryEnum.Uncategorized, // Union Finance (Sherlock)
  94: ProductCategoryEnum.Uncategorized, // OpenQ (Sherlock)
  95: ProductCategoryEnum.Perpetuals, // Level Finance v1
  96: ProductCategoryEnum.Dex, // Offramp.xyz v1
  97: ProductCategoryEnum.Lending, // Aave v3
  98: ProductCategoryEnum.YieldOptimizer, // Morpho Optimisers v1 (deprecated)
  99: ProductCategoryEnum.Uncategorized, // Chorus One
  100: ProductCategoryEnum.Uncategorized, // Kiln
  101: ProductCategoryEnum.Uncategorized, // Vertex (Native Protocol)
  102: ProductCategoryEnum.Uncategorized, // The Retail Mutual
  103: ProductCategoryEnum.ETHStaking, // Figment
  104: ProductCategoryEnum.Uncategorized, // Teller (Sherlock)
  105: ProductCategoryEnum.Uncategorized, // Ajna (Sherlock)
  106: ProductCategoryEnum.LiquidRestaking, // EigenLayer v1
  107: ProductCategoryEnum.Uncategorized, // Vox Finance (UnoRe)
  108: ProductCategoryEnum.Uncategorized, // MahaLend (UnoRe)
  109: ProductCategoryEnum.Uncategorized, // SELF (UnoRe)
  110: ProductCategoryEnum.Uncategorized, // Scallop (UnoRe)
  111: ProductCategoryEnum.Uncategorized, // WeFi (UnoRe)
  112: ProductCategoryEnum.Uncategorized, // ZkTsunami (UnoRe)
  113: ProductCategoryEnum.Uncategorized, // Hats Protocol
  114: ProductCategoryEnum.YieldOptimizer, // DAI Savings Rate (sDAI)
  115: ProductCategoryEnum.Lending, // Spark Lending v1
  116: ProductCategoryEnum.YieldOptimizer, // DefiEdge
  117: ProductCategoryEnum.ETHStaking, // Stakewise v3
  118: ProductCategoryEnum.Lending, // Compound v3
  123: ProductCategoryEnum.YieldOptimizer, // Yearn v3
  124: ProductCategoryEnum.Dex, // Velodrome
  125: ProductCategoryEnum.Perpetuals, // GMX v2
  126: ProductCategoryEnum.YieldOptimizer, // dHedge
  127: ProductCategoryEnum.Lending, // Term Finance
  128: ProductCategoryEnum.YieldOptimizer, // Pendle
  129: ProductCategoryEnum.Dex, // Aerodrome
  130: ProductCategoryEnum.Perpetuals, // Hyperliquid
  131: ProductCategoryEnum.Dex, // Maverick
  132: ProductCategoryEnum.YieldOptimizer, // Equilibria
  133: ProductCategoryEnum.Dex, // Camelot
  134: ProductCategoryEnum.Lending, // NFTperp
  135: ProductCategoryEnum.Lending, // Gearbox v3
  136: ProductCategoryEnum.ETHStaking, // pxETH
  137: ProductCategoryEnum.Lending, // fx Protocol
  138: ProductCategoryEnum.Lending, // Prisma
  139: ProductCategoryEnum.Dex, // Beethoven X
  140: ProductCategoryEnum.YieldOptimizer, // Arrakis
  141: ProductCategoryEnum.YieldOptimizer, // Yearn v3
  142: ProductCategoryEnum.Perpetuals, // Synthetix Ecosystem
  143: ProductCategoryEnum.LiquidRestaking, // EigenLayer + Ether.fi + Pendle (deprecated)
  144: ProductCategoryEnum.YieldOptimizer, // Beefy + Curve (deprecated)
  145: ProductCategoryEnum.YieldOptimizer, // Beefy + Compound v3 (deprecated)
  146: ProductCategoryEnum.YieldOptimizer, // Beefy + Balancer v2 + Aura (deprecated)
  147: ProductCategoryEnum.Lending, // Notional v3
  148: ProductCategoryEnum.Lending, // Fraxlend
  149: ProductCategoryEnum.Lending, // wstETH/USDC Market Morpho Blue (deprecated)
  150: ProductCategoryEnum.YieldOptimizer, // Ether.fi Liquid ETH Vault
  151: ProductCategoryEnum.Uncategorized, // Arcadia (Sherlock)
  152: ProductCategoryEnum.YieldOptimizer, // fx Protocol
  153: ProductCategoryEnum.LiquidRestaking, // EigenLayer + KelpDAO + Pendle (deprecated)
  154: ProductCategoryEnum.LiquidRestaking, // EigenLayer + Renzo + Pendle (deprecated)
  155: ProductCategoryEnum.LiquidRestaking, // EigenLayer + Swell + Pendle (deprecated)
  156: ProductCategoryEnum.YieldOptimizer, // Arcadia
  157: ProductCategoryEnum.Perpetuals, // Derive (formerly Lyra)
  158: ProductCategoryEnum.LiquidRestaking, // Renzo
  159: ProductCategoryEnum.Uncategorized, // Liquid Collective
  160: ProductCategoryEnum.LiquidRestaking, // Etherfi (Zircuit) Pendle (deprecated)
  161: ProductCategoryEnum.LiquidRestaking, // KelpDAO (Zircuit) Pendle (deprecated)
  162: ProductCategoryEnum.LiquidRestaking, // Renzo (Zircuit) Pendle (deprecated)
  163: ProductCategoryEnum.Uncategorized, // Pocket Universe
  164: ProductCategoryEnum.Uncategorized, // Request Finance
  165: ProductCategoryEnum.YieldOptimizer, // Ether.fi Liquid Market-Neutral USD Vault
  166: ProductCategoryEnum.YieldOptimizer, // Superform
  167: ProductCategoryEnum.LiquidRestaking, // Ether.fi
  168: ProductCategoryEnum.YieldOptimizer, // Beefy CLM + Uniswap v3 (deprecated)
  169: ProductCategoryEnum.ETHStaking, // RockX
  170: ProductCategoryEnum.YieldOptimizer, // sUSDe Pendle (deprecated)
  171: ProductCategoryEnum.YieldOptimizer, // sUSDe (Karak) Pendle (deprecated)
  172: ProductCategoryEnum.Lending, // Steakhouse MetaMorpho + Morpho Blue (deprecated)
  173: ProductCategoryEnum.Lending, // Re7 MetaMorpho + Morpho Blue (deprecated)
  174: ProductCategoryEnum.YieldOptimizer, // Index Coop
  175: ProductCategoryEnum.Lending, // Gauntlet MetaMorpho + Morpho Blue (deprecated)
  176: ProductCategoryEnum.YieldOptimizer, // Ether.fi (Karak) Pendle (deprecated)
  177: ProductCategoryEnum.YieldOptimizer, // EigenLayer + Puffer + Pendle (deprecated)
  178: ProductCategoryEnum.YieldOptimizer, // EigenLayer + Bedrock + Pendle (deprecated)
  179: ProductCategoryEnum.YieldOptimizer, // crvUSD (Silo) Pendle (deprecated)
  180: ProductCategoryEnum.Lending, // Block Analitica/B.Protocol MetaMorpho + Morpho Blue (deprecated)
  181: ProductCategoryEnum.YieldOptimizer, // Beefy + Aerodrome
  182: ProductCategoryEnum.YieldOptimizer, // ExtraFi
  183: ProductCategoryEnum.Lending, // Moonwell
  184: ProductCategoryEnum.Lending, //  Instadapp Fluid
  185: ProductCategoryEnum.Lending, //  Silo Finance
  186: ProductCategoryEnum.Uncategorized, // DeltaPrime (UnoRe)
  187: ProductCategoryEnum.YieldOptimizer, // Toros Finance Solana Bull 3x (deprecated)
  188: ProductCategoryEnum.YieldOptimizer, // Toros Finance Ethereum Bull 3x (deprecated)
  189: ProductCategoryEnum.YieldOptimizer, // Toros Finance
  190: ProductCategoryEnum.Lending, // Notional v3
  191: ProductCategoryEnum.YieldOptimizer, // Overnight Finance
  192: ProductCategoryEnum.LiquidRestaking, // Symbiotic
  193: ProductCategoryEnum.YieldOptimizer, // Etherfi Liquid Super Symbiotic LRT Vault
  194: ProductCategoryEnum.YieldOptimizer, // Toros Finance Andromeda Yield (deprecated)
  195: ProductCategoryEnum.Uncategorized, // Dialectic Moonphase
  196: ProductCategoryEnum.Uncategorized, // Dialectic Chronograph
  197: ProductCategoryEnum.YieldOptimizer, // Spectra
  198: ProductCategoryEnum.YieldOptimizer, // Origin OUSD
  199: ProductCategoryEnum.LiquidRestaking, // Mellow (P2P Market) + Symbiotic (deprecated)
  200: ProductCategoryEnum.LiquidRestaking, // Mellow
  201: ProductCategoryEnum.LiquidRestaking, // Mellow (Re7 Labs Market) + Symbiotic (deprecated)
  202: ProductCategoryEnum.LiquidRestaking, // Mellow (MEV Capital Market) + Symbiotic (deprecated)
  203: ProductCategoryEnum.YieldOptimizer, // rstETH Symbiotic + Mellow + Pendle (deprecated)
  204: ProductCategoryEnum.YieldOptimizer, // amphrETH Symbiotic + Mellow + Pendle (deprecated)
  205: ProductCategoryEnum.YieldOptimizer, // steakLRT Symbiotic + Mellow + Pendle (deprecated)
  206: ProductCategoryEnum.YieldOptimizer, // Re7LRT Symbiotic + Mellow + Pendle (deprecated)
  207: ProductCategoryEnum.Lending, // Inverse Finance FiRM
  208: ProductCategoryEnum.YieldOptimizer, // Inverse Finance sDOLA
  209: ProductCategoryEnum.YieldOptimizer, // Ether.fi Liquid King Karak LRT Vault
  210: ProductCategoryEnum.YieldOptimizer, // Beefy CLM + Velodrome (deprecated)
  211: ProductCategoryEnum.YieldOptimizer, // Beefy
  212: ProductCategoryEnum.YieldOptimizer, // Beefy CLM + Camelot (deprecated)
  213: ProductCategoryEnum.YieldOptimizer, // Beefy CLM + PancakeSwap (deprecated)
  214: ProductCategoryEnum.Lending, // Curve LlamaLend
  215: ProductCategoryEnum.Dex, // Ramses Exchange
  216: ProductCategoryEnum.Lending, // Credit Guild
  217: ProductCategoryEnum.YieldOptimizer, // Reserve
  218: ProductCategoryEnum.YieldOptimizer, // Contango
  219: ProductCategoryEnum.Uncategorized, // Flat Money (Sherlock) (deprecated)
  220: ProductCategoryEnum.Uncategorized, // Flat Money
  221: ProductCategoryEnum.YieldOptimizer, // Ether.fi Liquid eBTC Bitcoin LRT
  222: ProductCategoryEnum.YieldOptimizer, // Contango + Compound v3 (deprecated)
  223: ProductCategoryEnum.YieldOptimizer, // Contango + Aave v3 (deprecated)
  224: ProductCategoryEnum.YieldOptimizer, // Contango
  225: ProductCategoryEnum.Dex, // PancakeSwap
  226: ProductCategoryEnum.YieldOptimizer, // Beefy + Velodrome (deprecated)
  227: ProductCategoryEnum.Uncategorized, // Base Defi Pass
  228: ProductCategoryEnum.Lending, // Blue Chip Euler v2 Markets
  229: ProductCategoryEnum.Lending, // Blue Chip Morpho Vaults
  230: ProductCategoryEnum.Lending, // Ajna Finance
  231: ProductCategoryEnum.Lending, // Dolomite
  232: ProductCategoryEnum.Lending, // Steer Protocol
  233: ProductCategoryEnum.Uncategorized, // Relative Finance
  234: ProductCategoryEnum.YieldOptimizer, // AO Staking
  235: ProductCategoryEnum.Perpetuals, // GammaSwap
  236: ProductCategoryEnum.YieldOptimizer, // Ether.fi Liquid Usual Stable Vault
  237: ProductCategoryEnum.YieldOptimizer, // Ether.fi Liquid Elixir Stable Vault
  238: ProductCategoryEnum.YieldOptimizer, // Sky Savings Rate (sUSDS)
  239: ProductCategoryEnum.Uncategorized, // Everstake
  240: ProductCategoryEnum.Uncategorized, // Ensuro
  241: ProductCategoryEnum.YieldOptimizer, // Savings crvUSD (scrvUSD)
  242: ProductCategoryEnum.YieldOptimizer, // Lombard DeFi Vault
  243: ProductCategoryEnum.Lending, // Liquity v2
  244: ProductCategoryEnum.Dex, // CoW AMM
  245: ProductCategoryEnum.Uncategorized, // Entry Plan
  246: ProductCategoryEnum.Uncategorized, // Essential Plan
  247: ProductCategoryEnum.Uncategorized, // Elite Plan
  248: ProductCategoryEnum.YieldOptimizer, // Pendle
  249: ProductCategoryEnum.Dex, // SparkDEX
  250: ProductCategoryEnum.Uncategorized, // Fasanara
  251: ProductCategoryEnum.Lending, // Term Finance
  252: ProductCategoryEnum.YieldOptimizer, // Sturdy Finance
  253: ProductCategoryEnum.Depeg, // Ethena USDe Depeg
  254: ProductCategoryEnum.Lending, // Maple
  255: ProductCategoryEnum.Lending, // Syrup
  256: ProductCategoryEnum.Dex, // Uniswap v4
  257: ProductCategoryEnum.Dex, // Balancer v3
  258: ProductCategoryEnum.Perpetuals, // RFX
  259: ProductCategoryEnum.Uncategorized, // Bittensor
  260: ProductCategoryEnum.Uncategorized, // DeFi Covered
  261: ProductCategoryEnum.Depeg, // Sky USDS Depeg
  262: ProductCategoryEnum.Depeg, // Level USD Depeg
  263: ProductCategoryEnum.Depeg, // Tether USDT0 Depeg
  264: ProductCategoryEnum.Depeg, // Resolv USR Depeg
  265: ProductCategoryEnum.Depeg, // Treehouse ETH Depeg
  266: ProductCategoryEnum.Depeg, // Super OETH Depeg
  267: ProductCategoryEnum.Depeg, // WBTC Depeg
  268: ProductCategoryEnum.Depeg, // Ether.fi eBTC Depeg
  269: ProductCategoryEnum.YieldOptimizer, // vfat
  270: ProductCategoryEnum.Uncategorized, // Entry Cover (deprecated)
  271: ProductCategoryEnum.Uncategorized, // Essential Cover (deprecated)
  272: ProductCategoryEnum.Uncategorized, // Elite Cover (deprecated)
  273: ProductCategoryEnum.Uncategorized, // L1 Advisors Cover
  274: ProductCategoryEnum.Uncategorized, // Figment ETH Slashing
  275: ProductCategoryEnum.YieldOptimizer, // PoolTogether
  276: ProductCategoryEnum.Custody, // Coinbase
  277: ProductCategoryEnum.Custody, // Kraken
  278: ProductCategoryEnum.Custody, // Binance
  279: ProductCategoryEnum.Custody, // OKX
  280: ProductCategoryEnum.Custody, // Deribit
  281: ProductCategoryEnum.Custody, // Bitmex
  282: ProductCategoryEnum.Custody, // Bybit
  283: ProductCategoryEnum.Dex, // Shadow
  284: ProductCategoryEnum.Uncategorized, // Cork
  285: ProductCategoryEnum.YieldOptimizer, // Rings
  286: ProductCategoryEnum.Depeg, // Inverse DOLA Depeg
  287: ProductCategoryEnum.Uncategorized, // Ensuro Yield
  288: ProductCategoryEnum.Lending, // Coinshift USDL Morpho Vault
  289: ProductCategoryEnum.Lending, // B-Tier Morpho Vaults
  290: ProductCategoryEnum.Lending, // B-Tier Euler v2 Markets
  291: ProductCategoryEnum.Uncategorized, // OC Cover
  292: ProductCategoryEnum.Uncategorized, // Usual Bug Bounty
  293: ProductCategoryEnum.Depeg, // Resupply USD (reUSD) Depeg
  294: ProductCategoryEnum.YieldOptimizer, // Origin Sonic (OS)
  295: ProductCategoryEnum.LiquidRestaking, // Byzantine Finance
  296: ProductCategoryEnum.Uncategorized, // Brava Conservative Cover
  297: ProductCategoryEnum.Uncategorized, // Brava Balanced Cover
  298: ProductCategoryEnum.Uncategorized, // Brava Advanced Cover
  299: ProductCategoryEnum.Lending, // Extrafi Xlend
  300: ProductCategoryEnum.Dex, // Ambient Finance
  301: ProductCategoryEnum.Lending, // Kinetic
  302: ProductCategoryEnum.YieldOptimizer, // Revert Finance
  303: ProductCategoryEnum.Lending, // WBTC / eUSD Morpho Market
  304: ProductCategoryEnum.SmartWallet, // Stackup
  305: ProductCategoryEnum.YieldOptimizer, // YO Protocol
  306: ProductCategoryEnum.Lending, // cbBTC / USDC Morpho Market
  307: ProductCategoryEnum.YieldOptimizer, // Harvest Finance
  308: ProductCategoryEnum.Lending, // InfiniFi
  309: ProductCategoryEnum.Slashing, // Aave Umbrella Slashing
  310: ProductCategoryEnum.Depeg, // Savings GHO (sGHO) Depeg
  311: ProductCategoryEnum.Depeg, // fx Protocol fxUSD Depeg
  312: ProductCategoryEnum.Depeg, // Curve crvUSD Depeg
  313: ProductCategoryEnum.Depeg, // Falcon USDf Depeg
  314: ProductCategoryEnum.YieldOptimizer, // YieldFi
  315: ProductCategoryEnum.YieldOptimizer, // Tokemak
  316: ProductCategoryEnum.YieldOptimizer, // Velvet Capital
  317: ProductCategoryEnum.Depeg, // Tether USDT Depeg
  318: ProductCategoryEnum.Depeg, // Frax frxUSD Depeg
  319: ProductCategoryEnum.YieldOptimizer, // Yo ETH Vault
  320: ProductCategoryEnum.YieldOptimizer, // Yo USD Vault
  321: ProductCategoryEnum.YieldOptimizer, // Tokemak autoUSD Vault
  322: ProductCategoryEnum.YieldOptimizer, // Katana Vault Bridge
  323: ProductCategoryEnum.Uncategorized, // Colend Single Protocol Cover
  324: ProductCategoryEnum.Uncategorized, // Nest Credit Vaults Protocol Cover
};
