export enum CoverAsset {
  ETH = 0,
  DAI = 1,
  USDC = 6,
}

export enum CoverId {
  BUY = 0,
}

export const COMMISSION_DENOMINATOR = 100_00;
export const SLIPPAGE_DENOMINATOR = 100_00;
export const TARGET_PRICE_DENOMINATOR = 100_00;

export const MINIMUM_COVER_PERIOD = 28;
export const MAXIMUM_COVER_PERIOD = 365;
export const DEFAULT_SLIPPAGE = 10; // 0.1%
export const DEFAULT_COMMISSION_RATIO = 15_00; // 15%
export const NEXUS_MUTUAL_DAO_TREASURY_ADDRESS = '0x586b9b2F8010b284A0197f392156f1A7Eb5e86e9';
