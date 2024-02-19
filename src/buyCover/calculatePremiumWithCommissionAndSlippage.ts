import { COMMISSION_DENOMINATOR, SLIPPAGE_DENOMINATOR } from '../constants/buyCover';

export const calculatePremiumWithCommissionAndSlippage = (premium: bigint, commission = 0, slippage = 0) => {
  const premiumWithCommission =
    (premium * BigInt(COMMISSION_DENOMINATOR)) / BigInt(COMMISSION_DENOMINATOR - commission);

  const premiumWithCommissionAndSlippage =
    (premiumWithCommission * BigInt(SLIPPAGE_DENOMINATOR + slippage)) / BigInt(SLIPPAGE_DENOMINATOR);

  return premiumWithCommissionAndSlippage;
};
