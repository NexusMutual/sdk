export enum ProductCategoryEnum {
  All = 'all',
  Lending = 'lending',
  Dex = 'dex',
  LiquidRestaking = 'liquid-restaking',
  YieldOptimizer = 'yield-optimizer',
  Perpetuals = 'perpetuals',
  SmartWallet = 'smart-wallet',
  RWA = 'rwa',
  Coverage = 'coverage',
  ETHStaking = 'eth-staking',
  Unity = 'unity',
  // Uncategorized = 'uncategorized',
}

export const categoryLabelByEnum: Record<ProductCategoryEnum, string> = {
  [ProductCategoryEnum.All]: 'All categories',
  [ProductCategoryEnum.Lending]: 'Lending',
  [ProductCategoryEnum.Dex]: 'DEX',
  [ProductCategoryEnum.LiquidRestaking]: 'Liquid Restaking',
  [ProductCategoryEnum.YieldOptimizer]: 'Yield Optimizer',
  [ProductCategoryEnum.Perpetuals]: 'Perpetuals',
  [ProductCategoryEnum.SmartWallet]: 'Smart Wallet',
  [ProductCategoryEnum.RWA]: 'RWA',
  [ProductCategoryEnum.Coverage]: 'Coverage',
  [ProductCategoryEnum.ETHStaking]: 'ETH Staking',
  [ProductCategoryEnum.Unity]: 'Unity',
  // [ProductCategoryEnum.Uncategorized]: 'Uncategorized',
};

export const productCategoryMap: { [productId: number]: ProductCategoryEnum } = {
  1: ProductCategoryEnum.Dex, // 1Inch (DEX & Liquidity Pools)
  2: ProductCategoryEnum.Lending, // Aave v2
  3: ProductCategoryEnum.Lending, // Abracadabra v1
  4: ProductCategoryEnum.YieldOptimizer, // Alchemix v2
  // 5: ProductCategoryEnum.Uncategorized, // Anchor
  6: ProductCategoryEnum.Lending, // Angle v1
  7: ProductCategoryEnum.SmartWallet, // Argent
  8: ProductCategoryEnum.YieldOptimizer, // Aura v1
  // 9: ProductCategoryEnum.Uncategorized, // Babylon Finance
  // 10: ProductCategoryEnum.Uncategorized, // BadgerDAO v1
  11: ProductCategoryEnum.Dex, // Balancer v2
  // 12: ProductCategoryEnum.Uncategorized, // Bancor v2
  // 13: ProductCategoryEnum.Uncategorized, // Bancor v3
  14: ProductCategoryEnum.YieldOptimizer, // Beefy v2
  // 15: ProductCategoryEnum.Uncategorized, // Binance
  // 16: ProductCategoryEnum.Uncategorized, // BlockFi
  // 17: ProductCategoryEnum.Uncategorized, // Bundle: Gelt + mStable + Aave v2
  18: ProductCategoryEnum.RWA, // Centrifuge Tinlake
  // 19: ProductCategoryEnum.Uncategorized, // Coinbase
  20: ProductCategoryEnum.Lending, // Compound v2
  // 21: ProductCategoryEnum.Uncategorized, // Convex 3CRV (cvx3CRV)
  22: ProductCategoryEnum.YieldOptimizer, // Convex Finance v1
  // 23: ProductCategoryEnum.Uncategorized, // Convex stethCrv (cvxstethCrv)
  // 24: ProductCategoryEnum.Uncategorized, // Crypto.com
  // 25: ProductCategoryEnum.Uncategorized, // Curve 3pool LP (3Crv)
  26: ProductCategoryEnum.Dex, // Curve All Pools (incl staking)
  // 27: ProductCategoryEnum.Uncategorized, // Curve sETH LP (eCrv)
  28: ProductCategoryEnum.Perpetuals, // dydx Perpetual
  29: ProductCategoryEnum.Coverage, // Ease v1
  // 30: ProductCategoryEnum.Uncategorized, // Enzyme v3
  31: ProductCategoryEnum.YieldOptimizer, // Enzyme v4
  // 32: ProductCategoryEnum.Uncategorized, // Eth 2.0 (deposit contract)
  // 33: ProductCategoryEnum.Uncategorized, // Euler
  34: ProductCategoryEnum.Perpetuals, // FODL v1
  // 35: ProductCategoryEnum.Uncategorized, // FTX
  36: ProductCategoryEnum.Lending, // Gearbox v2
  // 37: ProductCategoryEnum.Uncategorized, // Gemini
  38: ProductCategoryEnum.Perpetuals, // GMX v1
  39: ProductCategoryEnum.Lending, // Goldfinch v1
  // 40: ProductCategoryEnum.Uncategorized, // Hodlnaut
  // 41: ProductCategoryEnum.Uncategorized, // Kraken
  // 42: ProductCategoryEnum.Uncategorized, // Ledn
  43: ProductCategoryEnum.Unity, // Liquid Collective
  44: ProductCategoryEnum.Lending, // Liquity v1
  45: ProductCategoryEnum.Lending, // MakerDAO CDP
  // 46: ProductCategoryEnum.Uncategorized, // mStable
  // 47: ProductCategoryEnum.Uncategorized, // Nested v1
  // 48: ProductCategoryEnum.Uncategorized, // Nexo
  49: ProductCategoryEnum.Lending, // Notional Finance v2
  // 50: ProductCategoryEnum.Uncategorized, // OlympusDAO
  51: ProductCategoryEnum.Perpetuals, // Opyn v2
  // 52: ProductCategoryEnum.Uncategorized, // Origin OUSD
  53: ProductCategoryEnum.Dex, // Pangolin v1
  54: ProductCategoryEnum.Perpetuals, // Perpetual Protocol v2
  // 55: ProductCategoryEnum.Uncategorized, // Pool Together v4
  // 56: ProductCategoryEnum.Uncategorized, // Premia Finance
  // 57: ProductCategoryEnum.Uncategorized, // Rari Capital
  58: ProductCategoryEnum.Lending, // Reflexer v1
  59: ProductCategoryEnum.Perpetuals, // Aevo
  60: ProductCategoryEnum.SmartWallet, // Safe (formerly Gnosis Safe)
  // 61: ProductCategoryEnum.Uncategorized, // Set Protocol
  62: ProductCategoryEnum.YieldOptimizer, // Set Protocol v2
  // 63: ProductCategoryEnum.Uncategorized, // Stakewise(?)
  64: ProductCategoryEnum.YieldOptimizer, // Stake DAO v1
  65: ProductCategoryEnum.Unity, // Stakewise 3rd party (3 ETH/validator)
  66: ProductCategoryEnum.Unity, // Stakewise operated (3 ETH/validator)
  67: ProductCategoryEnum.Dex, // SushiSwap v1
  68: ProductCategoryEnum.Perpetuals, // Synthetix
  // 69: ProductCategoryEnum.Uncategorized, // THORChain (Thorchain Network)
  70: ProductCategoryEnum.Dex, // Trader Joe v2.1
  71: ProductCategoryEnum.Dex, // Uniswap v2
  72: ProductCategoryEnum.Dex, // Uniswap v3
  73: ProductCategoryEnum.YieldOptimizer, // Vector v1
  74: ProductCategoryEnum.YieldOptimizer, // Vesper v3
  75: ProductCategoryEnum.YieldOptimizer, // Yearn Finance v2 (all vaults)
  // 76: ProductCategoryEnum.Uncategorized, // Yearn yvUSDC v2
  77: ProductCategoryEnum.Lending, // Yeti Finance v1
  // 78: ProductCategoryEnum.Uncategorized, // Yield App
  79: ProductCategoryEnum.YieldOptimizer, // Alpaca Finance v1
  80: ProductCategoryEnum.Lending, // WeFi v1
  81: ProductCategoryEnum.Lending, // Exactly v1
  82: ProductCategoryEnum.Unity, // EtherFi 5ETH
  // 83: ProductCategoryEnum.Uncategorized, // Squeeth by Opyn (Sherlock)
  // 84: ProductCategoryEnum.Uncategorized, // Rage Trade (Sherlock)
  // 85: ProductCategoryEnum.Uncategorized, // Sentiment (Sherlock)
  // 86: ProductCategoryEnum.Uncategorized, // Lyra Newport (Sherlock)
  // 87: ProductCategoryEnum.Uncategorized, // Perennial (Sherlock)
  // 88: ProductCategoryEnum.Uncategorized, // LiquiFi (Sherlock)
  // 89: ProductCategoryEnum.Uncategorized, // Lyra Avalon (Sherlock)
  // 90: ProductCategoryEnum.Uncategorized, // Buffer Finance (Sherlock)
  // 91: ProductCategoryEnum.Uncategorized, // Hook (Sherlock)
  // 92: ProductCategoryEnum.Uncategorized, // Holyheld (Sherlock)
  // 93: ProductCategoryEnum.Uncategorized, // Union Finance (Sherlock)
  // 94: ProductCategoryEnum.Uncategorized, // OpenQ (Sherlock)
  95: ProductCategoryEnum.Perpetuals, // Level Finance v1
  96: ProductCategoryEnum.Dex, // Offramp.xyz v1
  97: ProductCategoryEnum.Lending, // Aave v3
  98: ProductCategoryEnum.YieldOptimizer, // Morpho Optimisers v1
  99: ProductCategoryEnum.Unity, // Chorus One
  100: ProductCategoryEnum.Unity, // Kiln
  // 101: ProductCategoryEnum.Uncategorized, // Vertex (Native Protocol)
  102: ProductCategoryEnum.Unity, // The Retail Mutual
  103: ProductCategoryEnum.ETHStaking, // Figment
  // 104: ProductCategoryEnum.Uncategorized, // Teller (Sherlock)
  // 105: ProductCategoryEnum.Uncategorized, // Ajna (Sherlock)
  106: ProductCategoryEnum.LiquidRestaking, // EigenLayer v1
  // 107: ProductCategoryEnum.Uncategorized, // Vox Finance (UnoRe)
  // 108: ProductCategoryEnum.Uncategorized, // MahaLend (UnoRe)
  // 109: ProductCategoryEnum.Uncategorized, // SELF (UnoRe)
  // 110: ProductCategoryEnum.Uncategorized, // Scallop (UnoRe)
  // 111: ProductCategoryEnum.Uncategorized, // WeFi (UnoRe)
  // 112: ProductCategoryEnum.Uncategorized, // ZkTsunami (UnoRe)
  // 113: ProductCategoryEnum.Uncategorized, // Hats Protocol
  114: ProductCategoryEnum.YieldOptimizer, // MakerDAO DSR (sDAI)
  115: ProductCategoryEnum.Lending, // Spark Lending v1
  116: ProductCategoryEnum.YieldOptimizer, // DefiEdge
  117: ProductCategoryEnum.ETHStaking, // Stakewise v3
  118: ProductCategoryEnum.Lending, // Compound v3
  123: ProductCategoryEnum.YieldOptimizer, // Yearn v3
  124: ProductCategoryEnum.Dex, // Velodrome v2
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
  141: ProductCategoryEnum.YieldOptimizer, // Yearn Juiced Vaults
  142: ProductCategoryEnum.Perpetuals, // Kwenta + Synthetix
  143: ProductCategoryEnum.LiquidRestaking, // EigenLayer + Ether.fi + Pendle
  144: ProductCategoryEnum.YieldOptimizer, // Beefy + Curve
  145: ProductCategoryEnum.YieldOptimizer, // Beefy + Compound v3
  146: ProductCategoryEnum.YieldOptimizer, // Beefy + Balancer v2 + Aura
  147: ProductCategoryEnum.Lending, // Notional v3
  148: ProductCategoryEnum.Lending, // Fraxlend
  149: ProductCategoryEnum.Lending, // wstETH/USDC Market Morpho Blue
  150: ProductCategoryEnum.YieldOptimizer, // EtherFi Liquid
  // 151: ProductCategoryEnum.Uncategorized, // Arcadia (Sherlock)
  152: ProductCategoryEnum.YieldOptimizer, // fx Protocol + Curve + Convex
  153: ProductCategoryEnum.LiquidRestaking, // EigenLayer + KelpDAO + Pendle
  154: ProductCategoryEnum.LiquidRestaking, // EigenLayer + Renzo + Pendle
  155: ProductCategoryEnum.LiquidRestaking, // EigenLayer + Swell + Pendle
  156: ProductCategoryEnum.YieldOptimizer, // Arcadia
  157: ProductCategoryEnum.Perpetuals, // Lyra + Synthetix
  158: ProductCategoryEnum.LiquidRestaking, // EigenLayer + Renzo
  159: ProductCategoryEnum.Unity, // Liquid Collective
  160: ProductCategoryEnum.LiquidRestaking, // Etherfi (Zircuit) Pendle
  161: ProductCategoryEnum.LiquidRestaking, // KelpDAO (Zircuit) Pendle
  162: ProductCategoryEnum.LiquidRestaking, // Renzo (Zircuit) Pendle
  // 163: ProductCategoryEnum.Uncategorized, // Pocket Universe
  // 164: ProductCategoryEnum.Uncategorized, // Request Finance
  165: ProductCategoryEnum.YieldOptimizer, // Etherfi Liquid Market-Neutral USD Vault
  166: ProductCategoryEnum.YieldOptimizer, // Superform
  167: ProductCategoryEnum.LiquidRestaking, // EigenLayer + Etherfi
  168: ProductCategoryEnum.YieldOptimizer, // Beefy CLM + Uniswap v3
  169: ProductCategoryEnum.ETHStaking, // RockX
};
