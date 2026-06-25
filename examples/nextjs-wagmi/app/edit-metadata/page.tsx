'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useConnection, useSignTypedData } from 'wagmi';
import { productAPI, sdk } from '@/config/sdk';
import { buildCoverMetadataAuthMessage, type ProofOfLossEntry } from '@nexusmutual/sdk';

type ProofOfLossType = ProofOfLossEntry['type'];
type ProofOfLossFormState = Record<string, string>;
type CsvFieldState = { address: string; amount: string; currency: string };

function buildProofOfLossEntry(type: ProofOfLossType, raw: string, csv?: CsvFieldState): ProofOfLossEntry {
  switch (type) {
    case 'address':
      return {
        type,
        content: raw
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .map(address => ({ address })),
      };
    case 'validator':
      return {
        type,
        content: raw
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .map(value => ({ value })),
      };
    case 'free_text':
      return { type, content: [{ value: raw }] };
    case 'api_key':
      return {
        type,
        content: raw
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
          .map(credential => ({ credential, label: '', role: '' })),
      };
    case 'csv':
      return {
        type,
        content: [{ address: csv?.address ?? '', amount: csv?.amount ?? '', currency: csv?.currency ?? '' }],
      };
  }
}

const PROOF_OF_LOSS_LABELS: Record<ProofOfLossType, { label: string; placeholder: string }> = {
  address: { label: 'Addresses', placeholder: 'Comma-separated addresses, e.g. 0xabc..., 0xdef...' },
  validator: { label: 'Validator Keys', placeholder: 'Comma-separated validator public keys' },
  free_text: { label: 'Description', placeholder: 'Describe your position or relevant details' },
  api_key: { label: 'API Credentials', placeholder: 'Comma-separated credentials' },
  csv: { label: 'Position', placeholder: '' },
};

export default function EditMetadataPage() {
  const { isConnected } = useConnection();
  const { mutateAsync: signTypedDataAsync } = useSignTypedData();

  const [coverId, setCoverId] = useState('');
  const [proofOfLoss, setProofOfLoss] = useState<ProofOfLossFormState>({});
  const [csvFields, setCsvFields] = useState<Record<string, CsvFieldState>>({});

  const debouncedCoverId = useDebounce(coverId, 500);
  const numCoverId = Number(debouncedCoverId);

  const coverQuery = useQuery({
    queryKey: ['cover', numCoverId],
    queryFn: async () => {
      const coverResponse = await sdk.cover.getCover(numCoverId);
      if (coverResponse.error) throw new Error(coverResponse.error.message);

      const cover = coverResponse.result!;
      if (!cover.coverMetadataId) {
        throw new Error('No metadata found for this cover. It may not have associated metadata.');
      }

      const product = await productAPI.getProductById(cover.productId);
      return { cover, product };
    },
    enabled: numCoverId > 0,
  });

  const product = coverQuery.data?.product ?? null;
  const coverMetadataId = coverQuery.data?.cover.coverMetadataId ?? null;
  const proofOfLossTypes = product?.proofOfLossInputTypes ?? [];

  const editMetadata = useMutation({
    mutationFn: async () => {
      if (!coverMetadataId) throw new Error('No cover metadata ID available');
      if (!proofOfLossTypes.length) throw new Error('No proof of loss types required for this product');

      const entries: ProofOfLossEntry[] = proofOfLossTypes.map(type => {
        const raw = proofOfLoss[type] ?? '';
        return buildProofOfLossEntry(type, raw, csvFields[type]);
      });

      const typedData = buildCoverMetadataAuthMessage();

      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.value,
      });

      const response = await sdk.cover.editCoverMetadata({
        coverMetadataId,
        proofOfLoss: entries,
        signature: {
          signature,
          payload: typedData.value,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }
    },
  });

  const hasRequiredFields =
    proofOfLossTypes.length > 0 &&
    proofOfLossTypes.every(type => {
      if (type === 'csv') {
        const csv = csvFields[type];
        return csv?.address && csv?.amount && csv?.currency;
      }
      return (proofOfLoss[type] ?? '').trim().length > 0;
    });

  const isFormValid = isConnected && numCoverId > 0 && coverQuery.isSuccess && hasRequiredFields;

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
        <h1 className="mb-2 text-2xl font-bold text-foreground">Edit Private Metadata</h1>
        <p className="mb-8 text-sm text-muted">
          Update proof of loss data on an existing cover. You&apos;ll be asked to sign a message to authenticate.
        </p>

        <div className="space-y-5 rounded-2xl border border-card-border bg-card p-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Cover ID</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 1234"
              value={coverId}
              onChange={e => setCoverId(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
          </div>

          {coverQuery.isLoading && (
            <div className="flex items-center gap-2 text-sm text-muted">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading cover...
            </div>
          )}

          {coverQuery.error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {coverQuery.error.message}
            </div>
          )}

          {product && (
            <div className="rounded-xl border border-primary/20 bg-primary-light p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">{product.name}</span>
                <span className="rounded-full bg-card border border-card-border px-2.5 py-0.5 text-xs text-muted">
                  Product #{product.id}
                </span>
              </div>
              {proofOfLossTypes.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {proofOfLossTypes.map(type => (
                    <span
                      key={type}
                      className="inline-flex items-center rounded-lg border border-primary/30 bg-card px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
              {!proofOfLossTypes.length && (
                <p className="text-xs text-muted">This product does not require proof of loss data.</p>
              )}
            </div>
          )}

          {product && proofOfLossTypes.length > 0 && (
            <div className="space-y-4 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Provide updated proof of loss data for this cover.
              </p>
              {proofOfLossTypes.map(type => {
                const config = PROOF_OF_LOSS_LABELS[type];
                if (type === 'csv') {
                  const csv = csvFields[type] ?? { address: '', amount: '', currency: '' };
                  return (
                    <div key={type}>
                      <p className="mb-1.5 text-sm font-medium text-foreground">{config.label}</p>
                      <div className="grid grid-cols-3 gap-3">
                        <input
                          type="text"
                          placeholder="0x..."
                          value={csv.address}
                          onChange={e => setCsvFields(prev => ({ ...prev, [type]: { ...csv, address: e.target.value } }))}
                          className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Amount"
                          value={csv.amount}
                          onChange={e => setCsvFields(prev => ({ ...prev, [type]: { ...csv, amount: e.target.value } }))}
                          className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="Currency"
                          value={csv.currency}
                          onChange={e =>
                            setCsvFields(prev => ({ ...prev, [type]: { ...csv, currency: e.target.value } }))
                          }
                          className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={type}>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">{config.label}</label>
                    <input
                      type="text"
                      placeholder={config.placeholder}
                      value={proofOfLoss[type] ?? ''}
                      onChange={e => setProofOfLoss(prev => ({ ...prev, [type]: e.target.value }))}
                      className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => editMetadata.mutate()}
            disabled={!isFormValid || editMetadata.isPending}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {editMetadata.isPending ? 'Signing & Updating...' : 'Update Metadata'}
          </button>
        </div>

        {editMetadata.error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {editMetadata.error.message}
          </div>
        )}

        {editMetadata.isSuccess && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Metadata updated successfully!</p>
          </div>
        )}
      </main>
    </div>
  );
}
