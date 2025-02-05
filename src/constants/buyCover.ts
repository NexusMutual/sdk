import { Address, zeroAddress } from 'viem';

import { ProductTypes } from '../../generated/types';

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

// Commission ratios
export const DEFAULT_COMMISSION_RATIO = 15_00; // 15%
export const TRM_COMMISSION_RATIO = 10_00; // 10%
export const FUND_PORTFOLIO_COMMISSION_RATIO = 10_00; // 10%
export const DEFI_PASS_COMMISSION_RATIO = 10_00; // 10%
export const GENERALISED_FUND_PORTFOLIO_COMMISSION_RATIO = 10_00; // 10%
export const CRYPTO_COVER_COMMISSION_RATIO = 10_00; // 10%
export const NEXUS_MUTUAL_COVER_COMMISSION_RATIO = 10_00; // 10%
export const NO_COMMISSION = 0; // 0%

// Commission destinations
export const NO_COMMISSION_DESTINATION = zeroAddress as Address;
export const UNITY_ADDRESS = '0x95aBC2A62eE543217CF7640B277BA13D056d904A' as Address;
export const NEXUS_MUTUAL_DAO_TREASURY_ADDRESS = '0x8e53D04644E9ab0412a8c6bd228C84da7664cFE3';
export const IMMUNEFI_ADDRESS = '0x9c2F47079eb7Def5dd01Dd7E1138583f82376bDc' as Address;

export const BUY_COVER_COMMISSION_RATIO_BY_PRODUCT_TYPE: Record<ProductTypes, number> = {
  [ProductTypes.ethSlashing]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.liquidCollectiveEthStaking]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.stakewiseEthStaking]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.sherlockQuotaShare]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.unoReQuotaShare]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.theRetailMutual]: TRM_COMMISSION_RATIO,
  [ProductTypes.protocol]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.bundledProtocol]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.custody]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.yieldToken]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.sherlockExcess]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.nativeProtocol]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.ethSlashingUmbrella]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.openCoverTransaction]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.fundPortfolio]: FUND_PORTFOLIO_COMMISSION_RATIO,
  [ProductTypes.sherlockBugBounty]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.deFiPass]: DEFI_PASS_COMMISSION_RATIO,
  [ProductTypes.followOn]: NO_COMMISSION,
  [ProductTypes.immunefiBugBounty]: DEFAULT_COMMISSION_RATIO,
  [ProductTypes.nexusMutual]: NEXUS_MUTUAL_COVER_COMMISSION_RATIO,
  [ProductTypes.generalisedFundPortfolio]: GENERALISED_FUND_PORTFOLIO_COMMISSION_RATIO,
  [ProductTypes.crypto]: CRYPTO_COVER_COMMISSION_RATIO,
};

export const BUY_COVER_COMMISSION_DESTINATION_BY_PRODUCT_TYPE: Record<ProductTypes, Address> = {
  [ProductTypes.ethSlashing]: UNITY_ADDRESS,
  [ProductTypes.liquidCollectiveEthStaking]: UNITY_ADDRESS,
  [ProductTypes.stakewiseEthStaking]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.sherlockQuotaShare]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.unoReQuotaShare]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.theRetailMutual]: UNITY_ADDRESS,
  [ProductTypes.protocol]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.bundledProtocol]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.custody]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.yieldToken]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.sherlockExcess]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.nativeProtocol]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.ethSlashingUmbrella]: UNITY_ADDRESS,
  [ProductTypes.openCoverTransaction]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.fundPortfolio]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.sherlockBugBounty]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.deFiPass]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.followOn]: NO_COMMISSION_DESTINATION,
  [ProductTypes.immunefiBugBounty]: IMMUNEFI_ADDRESS,
  [ProductTypes.nexusMutual]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.generalisedFundPortfolio]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
  [ProductTypes.crypto]: NEXUS_MUTUAL_DAO_TREASURY_ADDRESS,
};
