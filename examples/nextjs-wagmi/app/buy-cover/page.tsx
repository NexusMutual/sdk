'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { parseEther, parseUnits, formatEther, formatUnits } from 'viem';
import { useConnection, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { productAPI, sdk } from '@/config/sdk';
import { addresses, CoverBroker, CoverAsset, type GetQuoteResponse } from '@nexusmutual/sdk';

const COVER_ASSETS = [
  { label: 'ETH', value: CoverAsset.ETH, decimals: 18 },
  { label: 'DAI', value: CoverAsset.DAI, decimals: 18 },
  { label: 'USDC', value: CoverAsset.USDC, decimals: 6 },
  { label: 'cbBTC', value: CoverAsset.cbBTC, decimals: 8 },
] as const;

function formatPremium(weiValue: string, decimals: number): string {
  if (decimals === 18) return formatEther(BigInt(weiValue));
  return formatUnits(BigInt(weiValue), decimals);
}

function parseAmount(value: string, decimals: number): string {
  if (decimals === 18) return parseEther(value).toString();
  return parseUnits(value, decimals).toString();
}

export default function BuyCoverPage() {
  const { address, isConnected } = useConnection();

  const [productId, setProductId] = useState('');
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('30');
  const [coverAssetIndex, setCoverAssetIndex] = useState(0);
  const [quotaShare, setQuotaShare] = useState('');

  const debouncedProductId = useDebounce(productId, 500);

  const { data: txHash, writeContract, isPending: isTxPending, error: txError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  const quoteMutation = useMutation({
    mutationFn: async (): Promise<GetQuoteResponse> => {
      if (!address) throw new Error('Wallet not connected');
      if (!product || !productType) throw new Error('Product not loaded');

      const amountInSmallestUnit = parseAmount(amount, selectedAsset.decimals);
      const response = await sdk.quote.getQuoteAndBuyCoverInputs({
        productId: Number(productId),
        amount: amountInSmallestUnit,
        period: Number(period),
        coverAsset: selectedAsset.value,
        buyerAddress: address,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.result!;
    },
  });

  const numProductId = Number(debouncedProductId);

  const productQuery = useQuery({
    queryKey: ['product', numProductId],
    queryFn: async () => {
      const product = await productAPI.getProductById(numProductId);
      const productType = await productAPI.getProductTypeById(product.productType, ['buyCoverForm']);
      return { product, productType };
    },
    enabled: numProductId > 0,
  });

  useEffect(() => {
    setCoverAssetIndex(0);
    setQuotaShare('');
    quoteMutation.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedProductId]);

  const product = productQuery.data?.product ?? null;
  const productType = productQuery.data?.productType ?? null;
  const buyCoverForm = productType?.buyCoverForm;

  const availableAssets = product?.coverAssets?.length
    ? COVER_ASSETS.filter(a => product.coverAssets.some(ca => ca.assetId === a.value))
    : COVER_ASSETS;

  const selectedAsset = availableAssets[coverAssetIndex] ?? availableAssets[0];

  const quoteResult = quoteMutation.data;

  function handleBuyCover() {
    if (!quoteResult) return;

    const { buyCoverParams, poolAllocationRequests } = quoteResult.buyCoverInput;

    const params = {
      coverId: BigInt(buyCoverParams.coverId),
      owner: buyCoverParams.owner as `0x${string}`,
      productId: buyCoverParams.productId,
      coverAsset: buyCoverParams.coverAsset,
      amount: BigInt(buyCoverParams.amount),
      period: buyCoverParams.period,
      maxPremiumInAsset: BigInt(buyCoverParams.maxPremiumInAsset),
      paymentAsset: buyCoverParams.paymentAsset,
      commissionRatio: buyCoverParams.commissionRatio,
      commissionDestination: (buyCoverParams.commissionDestination ?? address) as `0x${string}`,
      ipfsData: buyCoverParams.ipfsData,
    };

    const allocations = poolAllocationRequests.map(r => ({
      poolId: BigInt(r.poolId),
      coverAmountInAsset: BigInt(r.coverAmountInAsset),
      skip: r.skip,
    }));

    const value = selectedAsset.value === CoverAsset.ETH ? BigInt(buyCoverParams.maxPremiumInAsset) : BigInt(0);

    writeContract({
      address: addresses.CoverBroker as `0x${string}`,
      abi: CoverBroker,
      functionName: 'buyCover',
      args: [params, allocations],
      value,
    });
  }

  const isFormValid =
    isConnected &&
    product &&
    amount &&
    Number(period) >= 28 &&
    (buyCoverForm !== 'withQuotaShare' || Number(quotaShare) > 0);

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-card-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-6">
          <Link href="/" className="flex items-center gap-2.5 text-muted transition-colors hover:text-foreground">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-12">
        <h1 className="mb-2 text-2xl font-bold text-foreground">Buy Cover</h1>
        <p className="mb-8 text-sm text-muted">Get a quote and purchase cover for your DeFi positions.</p>

        {/* Form */}
        <div className="space-y-5 rounded-2xl border border-card-border bg-card p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Product ID</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 1"
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Product Info */}
          {productQuery.isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading product...
            </div>
          )}

          {productQuery.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {productQuery.error.message}
            </div>
          )}

          {product && (
            <div className="rounded-xl border border-primary/20 bg-primary-light p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{product.name}</span>
                {productType && (
                  <span className="rounded-full bg-card border border-card-border px-2.5 py-0.5 text-xs text-muted">
                    {productType.name}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                <span>Min Price: {product.minPrice}</span>
                {product.isPrivate && <span className="font-medium text-amber-500">Private</span>}
                {product.isDeprecated && <span className="font-medium text-red-500">Deprecated</span>}
              </div>

              {product.proofOfLossInputTypes && product.proofOfLossInputTypes.length > 0 && (
                <div className="border-t border-primary/20 pt-3">
                  <p className="mb-2 text-xs font-medium text-foreground">Required Proof of Loss Fields</p>
                  <div className="flex flex-wrap gap-2">
                    {product.proofOfLossInputTypes.map(type => (
                      <span
                        key={type}
                        className="inline-flex items-center rounded-lg border border-primary/30 bg-card px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product?.proofOfLossInputTypes?.length && (
                <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  This product type requires proof of loss data when buying cover.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Cover Amount ({selectedAsset.label})
              </label>
              <input
                type="text"
                placeholder="e.g. 10"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Period (days)</label>
              <input
                type="number"
                min="28"
                max="365"
                value={period}
                onChange={e => setPeriod(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Cover Asset</label>
            <div className="flex gap-2">
              {availableAssets.map((asset, i) => (
                <button
                  key={asset.label}
                  onClick={() => setCoverAssetIndex(i)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    i === coverAssetIndex
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-card-border text-muted hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {asset.label}
                </button>
              ))}
            </div>
          </div>

          {buyCoverForm === 'withQuotaShare' && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Quota Share (%)</label>
              <input
                type="number"
                min="1"
                max="100"
                placeholder="e.g. 50"
                value={quotaShare}
                onChange={e => setQuotaShare(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={() => quoteMutation.mutate()}
            disabled={!isFormValid || quoteMutation.isPending}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {quoteMutation.isPending ? 'Getting Quote...' : 'Get Quote'}
          </button>
        </div>

        {/* Error */}
        {quoteMutation.error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {quoteMutation.error.message}
          </div>
        )}

        {/* Quote Result */}
        {quoteResult && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-card-border bg-card p-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Quote Details</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-card-border pb-3">
                  <span className="text-sm text-muted">Premium</span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {formatPremium(quoteResult.displayInfo.premiumInAsset, selectedAsset.decimals)}{' '}
                    {selectedAsset.label}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-card-border pb-3">
                  <span className="text-sm text-muted">Cover Amount</span>
                  <span className="font-mono text-sm text-foreground">
                    {formatPremium(quoteResult.displayInfo.coverAmount, selectedAsset.decimals)} {selectedAsset.label}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-card-border pb-3">
                  <span className="text-sm text-muted">Yearly Cost</span>
                  <span className="font-mono text-sm text-foreground">
                    {(quoteResult.displayInfo.yearlyCostPerc * 100).toFixed(2)}%
                  </span>
                </div>
                {quoteResult.displayInfo.maxCapacity && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">Max Capacity</span>
                    <span className="font-mono text-sm text-foreground">
                      {formatPremium(quoteResult.displayInfo.maxCapacity, selectedAsset.decimals)} {selectedAsset.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleBuyCover}
              disabled={isTxPending || isConfirming}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isTxPending ? 'Confirm in Wallet...' : isConfirming ? 'Confirming...' : 'Buy Cover'}
            </button>

            {txError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
                {txError.message}
              </div>
            )}

            {isConfirmed && txHash && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Cover purchased!</p>
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block text-sm text-green-600 underline dark:text-green-400"
                >
                  View on Etherscan
                </a>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
