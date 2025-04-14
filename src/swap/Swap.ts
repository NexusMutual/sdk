import { Reserves } from './reserves.type';

/**
 * Class for handling token swap functionality
 */
export class Swap {
  /**
   * Calculate exact amount of ETH for a given amount of NXM
   * @param nxmIn Amount of NXM to swap in
   * @param reserves Pool reserves
   * @returns Amount of ETH out
   */
  public calculateExactEthForNxm(nxmIn: bigint, reserves: Reserves): bigint {
    if (nxmIn <= 0n) {
      throw new Error('NXM in value must be greater than 0');
    }

    // Calculate the constant product (k) for the market maker model
    const k = reserves.nxmB * reserves.ethReserve;

    // Simulate the swap and calculate the new reserves
    const nxmReservesAfter = reserves.nxmB + nxmIn;
    const ethReservesAfter = k / nxmReservesAfter;

    // Calculate the amount of Eth that will flow out of the pool
    const ethOut = reserves.ethReserve - ethReservesAfter;

    if (ethOut < 0n) {
      throw new Error('Cannot swap this amount');
    }

    return ethOut;
  }

  /**
   * Calculate exact amount of NXM for a given amount of ETH
   * @param ethIn Amount of ETH to swap in
   * @param reserves Pool reserves
   * @returns Amount of NXM out
   */
  public calculateExactNxmForEth(ethIn: bigint, reserves: Reserves): bigint {
    if (ethIn <= 0n) {
      throw new Error('ETH in value must be greater than 0');
    }

    // Calculate the constant product (k) for the market maker model
    const k = reserves.nxmB * reserves.ethReserve;

    // Simulate the swap and calculate the new reserves
    const ethReservesAfter = reserves.ethReserve + ethIn;
    const nxmReservesAfter = k / ethReservesAfter;

    // Calculate the amount of NXM that will flow out of the pool
    const nxmOut = reserves.nxmB - nxmReservesAfter;

    if (nxmOut < 0n) {
      throw new Error('Cannot swap this amount');
    }

    return nxmOut;
  }

  /**
   * Calculate amount of ETH for an exact amount of NXM
   * @param nxmOut Exact amount of NXM out
   * @param reserves Pool reserves
   * @returns Amount of ETH in
   */
  public calculateEthForExactNxm(nxmOut: bigint, reserves: Reserves): bigint {
    if (nxmOut <= 0n) {
      throw new Error('NXM out value must be greater than 0');
    }

    if (nxmOut >= reserves.nxmB) {
      throw new Error('Not enough NXM in the pool');
    }

    // Calculate the constant product (k) for the market maker model
    const k = reserves.nxmB * reserves.ethReserve;

    // Simulate the swap and calculate the new reserves
    const nxmReservesAfter = reserves.nxmB - nxmOut;
    const ethReservesAfter = k / nxmReservesAfter;

    // Calculate the amount of ETH that will flow into the pool
    const ethIn = ethReservesAfter - reserves.ethReserve;

    return ethIn;
  }

  /**
   * Calculate amount of NXM for an exact amount of ETH
   * @param ethOut Exact amount of ETH out
   * @param reserves Pool reserves
   * @returns Amount of NXM in
   */
  public calculateNxmForExactEth(ethOut: bigint, reserves: Reserves): bigint {
    if (ethOut <= 0n) {
      throw new Error('ETH out value must be greater than 0');
    }

    if (ethOut >= reserves.ethReserve) {
      throw new Error('Not enough ETH in the pool');
    }

    // Calculate the constant product (k) for the market maker model
    const k = reserves.nxmB * reserves.ethReserve;

    // Simulate the swap and calculate the new reserves
    const ethReservesAfter = reserves.ethReserve - ethOut;
    const nxmReservesAfter = k / ethReservesAfter;

    // Calculate the amount of NXM that will flow into the pool
    const nxmIn = nxmReservesAfter - reserves.nxmB;

    return nxmIn;
  }

  /**
   * Calculate price impact type A
   * @param tokenAmount Token amount
   * @param reserves Pool reserves
   * @returns Price impact
   */
  public calculatePriceImpactA(tokenAmount: bigint, reserves: Reserves): bigint {
    const spotPrice = this.calculateSpotPrice(reserves).spotPriceA;
    const totalOutput = this.calculateExactEthForNxm(tokenAmount, reserves);
    const estimatedPrice = (totalOutput * 10000n) / tokenAmount;
    const priceImpact = 10000n - (estimatedPrice * 10000n) / spotPrice;
    return priceImpact;
  }

  /**
   * Calculate price impact type B
   * @param tokenAmount Token amount
   * @param reserves Pool reserves
   * @returns Price impact
   */
  public calculatePriceImpactB(tokenAmount: bigint, reserves: Reserves): bigint {
    const spotPrice = this.calculateSpotPrice(reserves).spotPriceB;
    const totalOutput = this.calculateExactNxmForEth(tokenAmount, reserves);
    const estimatedPrice = (totalOutput * 10000n) / tokenAmount;
    const priceImpact = 10000n - (estimatedPrice * 10000n) / spotPrice;
    return priceImpact;
  }

  /**
   * Calculate spot price
   * @param reserves Pool reserves
   * @returns Spot price object with spotPriceA and spotPriceB
   */
  public calculateSpotPrice(reserves: Reserves): { spotPriceA: bigint; spotPriceB: bigint } {
    const spotPriceA = (reserves.ethReserve * 10000n) / reserves.nxmB;
    const spotPriceB = (reserves.nxmB * 10000n) / reserves.ethReserve;
    return { spotPriceA, spotPriceB };
  }
}
