import { z } from 'zod';

const VERSION_1_0 = '1.0' as const;
const VERSION_2_0 = '2.0' as const;

// Ethereum address regex (case insensitive)
const ethereumAddressRegex = /^0x[a-f0-9]{40}$/i;

export const coverValidatorsSchema = z.object({
  version: z.literal(VERSION_1_0),
  validators: z
    .array(z.string().regex(ethereumAddressRegex, 'Invalid Ethereum address'))
    .min(1, 'At least one validator address is required'),
});

export const coverQuotaShareSchema = z.object({
  version: z.literal(VERSION_1_0),
  quotaShare: z.number().min(0).max(100),
});

export const coverAumCoverAmountPercentageSchema = z.object({
  version: z.literal(VERSION_1_0),
  aumCoverAmountPercentage: z.number().min(0).max(100),
});

export const coverWalletAddressSchema = z.object({
  version: z.literal(VERSION_1_0),
  walletAddress: z.string().regex(ethereumAddressRegex, 'Invalid Ethereum address'),
});

export const coverWalletAddressesSchema = z.discriminatedUnion('version', [
  z.object({
    version: z.literal(VERSION_1_0),
    walletAddresses: z.string().refine(val => {
      const addresses = val.split(',').map(addr => addr.trim());
      return addresses.every(addr => ethereumAddressRegex.test(addr));
    }, 'Invalid Ethereum address(es)'),
  }),
  z.object({
    version: z.literal(VERSION_2_0),
    walletAddresses: z
      .array(z.string().regex(ethereumAddressRegex, 'Invalid Ethereum address'))
      .min(1, 'At least one wallet address is required'),
  }),
]);

export const coverFreeTextSchema = z.object({
  version: z.literal(VERSION_1_0),
  freeText: z.string().min(1, 'Free text cannot be empty'),
});

export const coverDesignatedWalletsSchema = z.object({
  version: z.literal(VERSION_1_0),
  wallets: z
    .array(
      z.object({
        wallet: z.string().regex(ethereumAddressRegex, 'Invalid Ethereum address'),
        amount: z.string().regex(/^(?!,$)[\d,.]+$/, 'Amount must be a valid number'),
        currency: z.string().min(1, 'Currency cannot be empty'),
      }),
    )
    .min(1, 'At least one wallet object is required'),
});

export const defiPassContentSchema = z.union([coverWalletAddressSchema, coverDesignatedWalletsSchema]);

export const stakingPoolDetailsSchema = z.object({
  version: z.literal(VERSION_1_0),
  poolName: z.string().min(1, 'Pool name cannot be empty'),
  poolDescription: z.string().min(1, 'Pool description cannot be empty'),
});

export const claimProofSchema = z.discriminatedUnion('version', [
  z.object({
    // mandatory fields
    version: z.literal(VERSION_1_0),
    coverId: z.number().int().positive(),
    affectedChain: z.string().min(1, 'Affected chain cannot be empty'),
    affectedAddresses: z
      .array(z.string().regex(ethereumAddressRegex, 'Invalid Ethereum address'))
      .min(1, 'At least one affected address is required'),
    incidentDescription: z.string().min(1, 'Incident description cannot be empty'),
    // optional fields
    incidentTransactionHashes: z
      .array(z.string().min(1, 'Transaction hash cannot be an empty string'))
      .min(1, 'At least one transaction hash is required')
      .optional(),
    incidentEvidenceLinks: z
      .array(z.string().url().min(1, 'Evidence link cannot be an empty string'))
      .min(1, 'At least one evidence link is required')
      .optional(),
    attachedFilesHashes: z
      .array(z.string().min(1, 'Attached file hash cannot be an empty string'))
      .min(1, 'At least one attached file hash is required')
      .optional(),
  }),
  z.object({
    // mandatory fields
    version: z.literal(VERSION_2_0),
    coverId: z.number().int().positive(),
    affectedChain: z.string().min(1, 'Affected chain cannot be empty'),
    affectedAddresses: z.array(
      z.object({
        address: z.string().regex(ethereumAddressRegex, 'Invalid Ethereum address'),
        proof: z.string(),
        isVerified: z.boolean(),
      }),
    ),
    incidentDescription: z.string().min(1, 'Incident description cannot be empty'),
    // optional fields
    attachedFilesHashes: z
      .array(z.string().min(1, 'Attached file hash cannot be an empty string'))
      .min(1, 'At least one attached file hash is required')
      .optional(),
  }),
]);

export const assessmentCriteriaAnswersSchema = z.object({
  version: z.literal(VERSION_1_0),
  answers: z.record(z.string()).refine(obj => Object.keys(obj).length > 0, 'Answers object cannot be empty'),
});

export const governanceProposalSchema = z.object({
  version: z.literal(VERSION_1_0),
  proposal: z.string().min(1, 'Proposal cannot be empty'),
});

export const governanceCategorySchema = z.object({
  version: z.literal(VERSION_1_0),
  category: z.string().min(1, 'Category cannot be empty'),
});

export const fileSchema = z.unknown().refine(val => val !== undefined, {
  message: 'File must be defined',
});
