import { COMMISSION_DENOMINATOR, SLIPPAGE_DENOMINATOR } from '../constants/cover';

/**
 * Class for handling cover-related functionality including purchase, calculations, and more
 */
export class Cover {
  /**
   * Calculate premium with commission and slippage
   * @param premium Base premium
   * @param commission Commission rate (default: 0)
   * @param slippage Slippage tolerance (default: 0)
   * @returns Premium with commission and slippage applied
   */
  public calculatePremiumWithCommissionAndSlippage(premium: bigint, commission = 0, slippage = 0): bigint {
    const premiumWithCommission =
      (premium * BigInt(COMMISSION_DENOMINATOR)) / BigInt(COMMISSION_DENOMINATOR - commission);

    const premiumWithCommissionAndSlippage =
      (premiumWithCommission * BigInt(SLIPPAGE_DENOMINATOR + slippage)) / BigInt(SLIPPAGE_DENOMINATOR);

    return premiumWithCommissionAndSlippage;
  }
}
