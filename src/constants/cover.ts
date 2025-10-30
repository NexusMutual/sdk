import { Address, zeroAddress } from 'viem';

import { ProductTypes } from '../../generated/types';

export enum CoverAsset {
  ETH = 0,
  DAI = 1,
  USDC = 6,
  cbBTC = 7,
}
export enum PaymentAsset {
  ETH = 0,
  DAI = 1,
  USDC = 6,
  cbBTC = 7,
  NXM = 255,
}

export const COMMISSION_DENOMINATOR = 100_00;
export const SLIPPAGE_DENOMINATOR = 100_00;
export const TARGET_PRICE_DENOMINATOR = 100_00;

export const MINIMUM_COVER_PERIOD = 28;
export const MAXIMUM_COVER_PERIOD = 365;
export const DEFAULT_SLIPPAGE = 10; // 0.1%

// Commission ratios
export const DEFAULT_COMMISSION_RATIO = 15_00; // 15%
export const SHERLOCK_BUG_BOUNTY_COMMISSION_RATIO = 10_00; // 10%
export const TRM_COMMISSION_RATIO = 10_00; // 10%
export const FUND_PORTFOLIO_COMMISSION_RATIO = 10_00; // 10%
export const DEFI_PASS_COMMISSION_RATIO = 10_00; // 10%
export const GENERALIZED_FUND_PORTFOLIO_COMMISSION_RATIO = 10_00; // 10%
export const CRYPTO_COVER_COMMISSION_RATIO = 10_00; // 10%
export const NEXUS_MUTUAL_COVER_COMMISSION_RATIO = 10_00; // 10%
export const NO_COMMISSION = 0; // 0%
export const LEVERAGED_LIQUIDATION_COMMISSION_RATIO = 10_00; // 10%

// Commission destinations
export const NO_COMMISSION_DESTINATION = zeroAddress as Address;
export const NEXUS_MUTUAL_DAO_TREASURY_ADDRESS = '0x8e53D04644E9ab0412a8c6bd228C84da7664cFE3';
export const IMMUNEFI_ADDRESS = '0x9c2F47079eb7Def5dd01Dd7E1138583f82376bDc' as Address;
export const SPEARBIT_CANTINA_ADDRESS = '0x3Dcb7CFbB431A11CAbb6f7F2296E2354f488Efc2' as Address;

export const BUY_COVER_COMMISSION_RATIO_BY_PRODUCT_TYPE: Record<ProductTypes, number> = {
  [ProductTypes.ethSlashing]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.liquidCollectiveEthStaking]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.stakewiseEthStaking]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.sherlockQuotaShare]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.unoReQuotaShare]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.theRetailMutual]: TRM_COMMISSION_RATIO,
  [ProductTypes.singleProtocol]: NEXUS_MUTUAL_COVER_COMMISSION_RATIO,
  [ProductTypes.multiProtocol]: NEXUS_MUTUAL_COVER_COMMISSION_RATIO,
  [ProductTypes.custody]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.yieldToken]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.sherlockExcess]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.nativeProtocol]: NEXUS_MUTUAL_COVER_COMMISSION_RATIO,
  [ProductTypes.ethSlashingUmbrella]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.openCoverTransaction]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.fundPortfolio]: FUND_PORTFOLIO_COMMISSION_RATIO,
  [ProductTypes.sherlockBugBounty]: SHERLOCK_BUG_BOUNTY_COMMISSION_RATIO,
  [ProductTypes.deFiPass]: DEFI_PASS_COMMISSION_RATIO,
  [ProductTypes.followOn]: NO_COMMISSION,
  [ProductTypes.immunefiBugBounty]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.nexusMutual]: NEXUS_MUTUAL_COVER_COMMISSION_RATIO,
  [ProductTypes.generalizedFundPortfolio]: GENERALIZED_FUND_PORTFOLIO_COMMISSION_RATIO,
  [ProductTypes.crypto]: CRYPTO_COVER_COMMISSION_RATIO,
  [ProductTypes.nativeSyndicate]: NO_COMMISSION,
  [ProductTypes.spearbitCantina]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.leveragedLiquidation]: LEVERAGED_LIQUIDATION_COMMISSION_RATIO,
};

export const BUY_COVER_COMMISSION_DESTINATION_BY_PRODUCT_TYPE: Record<ProductTypes, Address> = {
  [ProductTypes.ethSlashing]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.liquidCollectiveEthStaking]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.stakewiseEthStaking]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.sherlockQuotaShare]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.unoReQuotaShare]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.theRetailMutual]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.singleProtocol]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.multiProtocol]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.custody]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.yieldToken]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.sherlockExcess]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.nativeProtocol]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.ethSlashingUmbrella]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.openCoverTransaction]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.fundPortfolio]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.sherlockBugBounty]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.deFiPass]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.followOn]: NO_COMMISSION_DESTINATION,
  [ProductTypes.immunefiBugBounty]: IMMUNEFI_ADDRESS,
  [ProductTypes.nexusMutual]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.generalizedFundPortfolio]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.crypto]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.nativeSyndicate]: NO_COMMISSION_DESTINATION,
  [ProductTypes.spearbitCantina]: SPEARBIT_CANTINA_ADDRESS,
  [ProductTypes.leveragedLiquidation]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
};
