'use client';

import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useConnection, useSignTypedData } from 'wagmi';
import { sdk } from '@/config/sdk';
import { buildCoverMetadataAuthMessage, type AuthSignature, type ViewCoverMetadataResponse } from '@nexusmutual/sdk';

export default function ViewMetadataPage() {
  const { isConnected } = useConnection();
  const signTypedData = useSignTypedData();

  const [coverId, setCoverId] = useState('');
  const [withPrivate, setWithPrivate] = useState(false);

  const viewMetadata = useMutation({
    mutationFn: async (): Promise<ViewCoverMetadataResponse> => {
      // Step 1: Get cover data (includes coverMetadataId)
      const coverResponse = await sdk.cover.getCover(Number(coverId));

      if (coverResponse.error) {
        throw new Error(coverResponse.error.message);
      }

      const { coverMetadataId } = coverResponse.result;

      if (!coverMetadataId) {
        throw new Error('No metadata found for this cover. It may not have associated metadata.');
      }

      // Step 2: Build signature if private data is requested
      let signature: AuthSignature | undefined;

      if (withPrivate) {
        const typedData = buildCoverMetadataAuthMessage();
        const sig = await signTypedData.mutateAsync({
          domain: typedData.domain,
          types: typedData.types,
          primaryType: typedData.primaryType,
          message: typedData.value,
        });
        signature = { signature: sig, payload: typedData.value };
      }

      // Step 3: Fetch cover metadata
      const response = await sdk.cover.viewCoverMetadata({
        coverMetadataId,
        signature,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      return response.result!;
    },
  });

  const metadata = viewMetadata.data;
  const canFetch = !!coverId && Number(coverId) > 0;

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
        <h1 className="mb-2 text-2xl font-bold text-foreground">View Cover Metadata</h1>
        <p className="mb-8 text-sm text-muted">
          Enter a cover ID to fetch its metadata. Toggle &ldquo;With Private&rdquo; to include proof-of-loss data
          (requires wallet signature).
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

          {/* With Private toggle */}
          <div className="flex items-center justify-between">
            <label htmlFor="with-private" className="text-sm font-medium text-foreground">
              With Private
            </label>
            <button
              id="with-private"
              type="button"
              role="switch"
              aria-checked={withPrivate}
              onClick={() => setWithPrivate(prev => !prev)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                withPrivate ? 'bg-primary' : 'bg-card-border'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
                  withPrivate ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => viewMetadata.mutate()}
            disabled={!isConnected || !canFetch || viewMetadata.isPending}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
          >
            {viewMetadata.isPending ? (withPrivate ? 'Signing & Fetching...' : 'Fetching...') : 'View Metadata'}
          </button>
        </div>

        {viewMetadata.error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {viewMetadata.error.message}
          </div>
        )}

        {metadata && (
          <div className="mt-6 rounded-2xl border border-card-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Metadata</h2>
            <div className="space-y-3">
              <Row label="ID" value={metadata.id} />
              <Row label="Cover ID" value={String(metadata.coverId)} />
              <Row label="Created At" value={metadata.createdAt} />
              <Row label="Updated At" value={metadata.updatedAt ?? '—'} />

              {metadata.publicData && (
                <div className="border-t border-card-border pt-3">
                  <p className="mb-2 text-sm font-medium text-foreground">Public Data</p>
                  <pre className="overflow-x-auto rounded-lg bg-accent p-3 font-mono text-xs text-foreground">
                    {JSON.stringify(metadata.publicData, null, 2)}
                  </pre>
                </div>
              )}

              {metadata.privateData && (
                <div className="border-t border-card-border pt-3">
                  <p className="mb-2 text-sm font-medium text-foreground">Private Data</p>
                  {metadata.privateData.createdAt && (
                    <p className="mb-2 text-xs text-muted">Created: {metadata.privateData.createdAt}</p>
                  )}
                  {metadata.privateData.proofOfLoss ? (
                    <pre className="overflow-x-auto rounded-lg bg-accent p-3 font-mono text-xs text-foreground">
                      {JSON.stringify(metadata.privateData.proofOfLoss, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-muted">No proof of loss data</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-card-border pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}
