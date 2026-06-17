'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useConnection, useSignTypedData } from 'wagmi';
import { sdk } from '@/config/sdk';
import { buildCoverMetadataAuthMessage, type ProofOfLossEntry } from '@nexusmutual/sdk';

type EntryType = ProofOfLossEntry['type'];

const ENTRY_TYPES: { value: EntryType; label: string }[] = [
  { value: 'address', label: 'Address' },
  { value: 'api_key', label: 'API Key' },
  { value: 'validator', label: 'Validator' },
  { value: 'free_text', label: 'Free Text' },
];

export default function EditMetadataPage() {
  const { isConnected } = useConnection();
  const { mutateAsync: signTypedDataAsync } = useSignTypedData();

  const [coverMetadataId, setCoverMetadataId] = useState('');
  const [entryType, setEntryType] = useState<EntryType>('address');
  const [entryValue, setEntryValue] = useState('');
  const [entryLabel, setEntryLabel] = useState('');

  function buildProofOfLoss(): ProofOfLossEntry {
    switch (entryType) {
      case 'address':
        return { type: 'address', content: [{ address: entryValue, label: entryLabel || undefined }] };
      case 'api_key':
        return { type: 'api_key', content: [{ credential: entryValue, label: entryLabel || 'default', role: 'read' }] };
      case 'validator':
        return { type: 'validator', content: [{ value: entryValue, label: entryLabel || undefined }] };
      case 'free_text':
        return { type: 'free_text', content: [{ value: entryValue, label: entryLabel || undefined }] };
      default:
        return { type: 'free_text', content: [{ value: entryValue }] };
    }
  }

  const editMetadata = useMutation({
    mutationFn: async () => {
      const typedData = buildCoverMetadataAuthMessage();

      const signature = await signTypedDataAsync({
        domain: typedData.domain,
        types: typedData.types,
        primaryType: typedData.primaryType,
        message: typedData.value,
      });
      console.log('enters sig', { signature });
      const proofOfLoss = [buildProofOfLoss()];
      console.log('proof of loss', { proofOfLoss });

      const response = await sdk.cover.editCoverMetadata({
        coverMetadataId,
        proofOfLoss,
        signature: {
          signature,
          payload: typedData.value,
        },
      });

      console.log('response', { response });

      if (response.error) {
        console.log('error', { error: response.error });
        throw new Error(response.error.message);
      }
    },
  });

  const isFormValid = isConnected && coverMetadataId && entryValue;
  const placeholder = entryType === 'address' ? '0x...' : entryType === 'api_key' ? 'your-api-key' : 'Enter value';

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
            <label className="mb-1.5 block text-sm font-medium text-foreground">Cover Metadata ID</label>
            <input
              type="text"
              placeholder="e.g. abc123-def456"
              value={coverMetadataId}
              onChange={e => setCoverMetadataId(e.target.value)}
              className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">Entry Type</label>
            <div className="flex flex-wrap gap-2">
              {ENTRY_TYPES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setEntryType(t.value)}
                  className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                    entryType === t.value
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-card-border text-muted hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Value</label>
              <input
                type="text"
                placeholder={placeholder}
                value={entryValue}
                onChange={e => setEntryValue(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Label (optional)</label>
              <input
                type="text"
                placeholder="e.g. My Wallet"
                value={entryLabel}
                onChange={e => setEntryLabel(e.target.value)}
                className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted/50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

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
