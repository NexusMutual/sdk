'use client';

import Link from 'next/link';
import { useAccount, useConnect, useConnection, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

const sections = [
  {
    title: 'Buy Cover',
    description:
      'Get a quote and purchase cover for your DeFi positions. Specify the product, amount, period, and asset to protect your funds.',
    buttonLabel: 'Get Quote',
    href: '/buy-cover',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
        />
      </svg>
    ),
  },
  {
    title: 'View Cover Metadata',
    description:
      'Look up cover metadata by cover ID. Resolves the on-chain IPFS pointer automatically. Toggle private mode to include proof of loss (requires signature).',
    buttonLabel: 'View Metadata',
    href: '/view-metadata',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      </svg>
    ),
  },
  {
    title: 'Edit Private Metadata',
    description:
      'Update proof of loss data on an existing cover. Supports address, API key, validator, CSV, and free text entries.',
    buttonLabel: 'Edit Metadata',
    href: '/edit-metadata',
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
        />
      </svg>
    ),
  },
];

function ConnectButton() {
  const { address, isConnected } = useAccount();
  const { mutate: connect } = useConnect();
  const { mutate: disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-primary-light px-3 py-1.5 text-sm font-mono text-primary">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <button
          onClick={() => disconnect()}
          className="rounded-lg border border-card-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-foreground"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: injected() })}
      className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
    >
      Connect Wallet
    </button>
  );
}

function FeatureCard({ title, description, buttonLabel, href, icon }: (typeof sections)[number]) {
  const { isConnected } = useConnection();

  return (
    <div className="group flex flex-col rounded-2xl border border-card-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary">
        {icon}
      </div>
      <h2 className="mb-2 text-xl font-semibold text-foreground">{title}</h2>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-muted">{description}</p>
      {isConnected ? (
        <Link
          href={href}
          className="block w-full rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {buttonLabel}
        </Link>
      ) : (
        <button
          disabled
          className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          Connect wallet first
        </button>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-card-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
              N
            </div>
            <span className="text-lg font-semibold text-foreground">Nexus Mutual SDK</span>
          </div>
          <ConnectButton />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">
        <div className="mb-12 max-w-2xl">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">SDK Example App</h1>
          <p className="text-lg leading-relaxed text-muted">
            Explore the{' '}
            <code className="rounded bg-accent px-1.5 py-0.5 font-mono text-sm text-primary">@nexusmutual/sdk</code>{' '}
            capabilities with wagmi wallet integration.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(section => (
            <FeatureCard key={section.title} {...section} />
          ))}
        </div>
      </main>

      <footer className="border-t border-card-border py-6 text-center text-sm text-muted">
        Built with Next.js, wagmi &amp; @nexusmutual/sdk
      </footer>
    </div>
  );
}
