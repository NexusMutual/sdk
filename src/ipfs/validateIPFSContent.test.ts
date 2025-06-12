import { Ipfs } from './Ipfs';
import {
  ContentType,
  CoverValidators,
  CoverQuotaShare,
  CoverAumCoverAmountPercentage,
  CoverWalletAddress,
  CoverWalletAddresses,
  CoverFreeText,
  CoverDesignatedWallets,
  StakingPoolDetails,
  ClaimProof,
  AssessmentCriteriaAnswers,
  GovernanceProposal,
  GovernanceCategory,
} from '../types/ipfs';

describe('validateIPFSContent', () => {
  const validEthAddress = '0x1234567890123456789012345678901234567890';
  const invalidEthAddress = '0xinvalid';
  const ipfsApi = new Ipfs();

  describe('coverValidators', () => {
    const validContent: CoverValidators = {
      version: '1.0',
      validators: [validEthAddress],
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverValidators, validContent)).not.toThrow();
    });

    it('should reject invalid version', () => {
      const invalidContent = { ...validContent, version: '2.0' } as unknown as CoverValidators;
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverValidators, invalidContent)).toThrow();
    });

    it('should reject invalid ethereum address', () => {
      const invalidContent: CoverValidators = { ...validContent, validators: [invalidEthAddress] };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverValidators, invalidContent)).toThrow();
    });
  });

  describe('coverQuotaShare', () => {
    const validContent: CoverQuotaShare = {
      version: '1.0',
      quotaShare: 50,
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverQuotaShare, validContent)).not.toThrow();
    });

    it('should reject quota share > 100', () => {
      const invalidContent: CoverQuotaShare = { ...validContent, quotaShare: 101 };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverQuotaShare, invalidContent)).toThrow();
    });

    it('should reject negative quota share', () => {
      const invalidContent: CoverQuotaShare = { ...validContent, quotaShare: -1 };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverQuotaShare, invalidContent)).toThrow();
    });
  });

  describe('coverAumCoverAmountPercentage', () => {
    const validContent: CoverAumCoverAmountPercentage = {
      version: '1.0',
      aumCoverAmountPercentage: 75,
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverAumCoverAmountPercentage, validContent)).not.toThrow();
    });

    it('should reject percentage > 100', () => {
      const invalidContent: CoverAumCoverAmountPercentage = { ...validContent, aumCoverAmountPercentage: 101 };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverAumCoverAmountPercentage, invalidContent)).toThrow();
    });

    it('should reject negative percentage', () => {
      const invalidContent: CoverAumCoverAmountPercentage = { ...validContent, aumCoverAmountPercentage: -1 };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverAumCoverAmountPercentage, invalidContent)).toThrow();
    });
  });

  describe('coverWalletAddress', () => {
    const validContent: CoverWalletAddress = {
      version: '1.0',
      walletAddress: validEthAddress,
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverWalletAddress, validContent)).not.toThrow();
    });

    it('should reject invalid ethereum address', () => {
      const invalidContent: CoverWalletAddress = { ...validContent, walletAddress: '0xinvalid' };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverWalletAddress, invalidContent)).toThrow();
    });
  });

  describe('coverWalletAddresses', () => {
    describe('v1', () => {
      it('should validate correct v1 content', () => {
        const validContentSingleAddress: CoverWalletAddresses = {
          version: '1.0',
          walletAddresses: validEthAddress,
        };
        expect(() =>
          ipfsApi.validateIPFSContent(ContentType.coverWalletAddresses, validContentSingleAddress),
        ).not.toThrow();
      });

      it('should reject invalid single ethereum address', () => {
        const invalidContent: CoverWalletAddresses = {
          version: '1.0',
          walletAddresses: '0xinvalid',
        };
        expect(() => ipfsApi.validateIPFSContent(ContentType.coverWalletAddresses, invalidContent)).toThrow();
      });

      it('should validate valid comma-separated ethereum addresses', () => {
        const validContentMultipleAddress: CoverWalletAddresses = {
          version: '1.0',
          walletAddresses: `${validEthAddress},${validEthAddress}`,
        };
        expect(() =>
          ipfsApi.validateIPFSContent(ContentType.coverWalletAddresses, validContentMultipleAddress),
        ).not.toThrow();
      });

      it('should validate valid comma-separated ethereum addresses with spaces', () => {
        const validContentWithSpaces: CoverWalletAddresses = {
          version: '1.0',
          walletAddresses: `${validEthAddress}, ${validEthAddress}`,
        };
        expect(() =>
          ipfsApi.validateIPFSContent(ContentType.coverWalletAddresses, validContentWithSpaces),
        ).not.toThrow();
      });

      it('should reject if any address in comma-separated list is invalid', () => {
        const invalidContent: CoverWalletAddresses = {
          version: '1.0',
          walletAddresses: `${validEthAddress},${invalidEthAddress}`,
        };
        expect(() => ipfsApi.validateIPFSContent(ContentType.coverWalletAddresses, invalidContent)).toThrow();
      });
    });

    describe('v2', () => {
      it('should validate correct v2 content', () => {
        const validContentV2: CoverWalletAddresses = {
          version: '2.0',
          walletAddresses: [validEthAddress, validEthAddress],
        };
        expect(() => ipfsApi.validateIPFSContent(ContentType.coverWalletAddresses, validContentV2)).not.toThrow();
      });

      it('should reject invalid ethereum address in v2', () => {
        const invalidContent: CoverWalletAddresses = {
          version: '2.0',
          walletAddresses: ['0xinvalid'],
        };
        expect(() => ipfsApi.validateIPFSContent(ContentType.coverWalletAddresses, invalidContent)).toThrow();
      });
    });
  });

  describe('coverFreeText', () => {
    const validContent: CoverFreeText = {
      version: '1.0',
      freeText: 'Sample text',
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverFreeText, validContent)).not.toThrow();
    });

    it('should reject missing free text', () => {
      const invalidContent: CoverFreeText = { version: '1.0' } as CoverFreeText;
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverFreeText, invalidContent)).toThrow();
    });

    it('should reject empty free text', () => {
      const invalidContent: CoverFreeText = { version: '1.0', freeText: '' };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverFreeText, invalidContent)).toThrow(
        'Free text cannot be empty',
      );
    });
  });

  describe('coverDesignatedWallets', () => {
    const validContent: CoverDesignatedWallets = {
      version: '1.0',
      wallets: [
        {
          wallet: validEthAddress,
          amount: '1000000000000000000',
          currency: 'USDC',
        },
      ],
    };

    const validContentWithDecimalAmount: CoverDesignatedWallets = {
      version: '1.0',
      wallets: [
        {
          wallet: validEthAddress,
          amount: '1.5',
          currency: 'USDC',
        },
        {
          wallet: validEthAddress,
          amount: '100,5',
          currency: 'USDC',
        },
        {
          wallet: validEthAddress,
          amount: '1,000.5',
          currency: 'USDC',
        },
        {
          wallet: validEthAddress,
          amount: '1.000.000,5',
          currency: 'USDC',
        },
      ],
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverDesignatedWallets, validContent)).not.toThrow();
    });

    it('should validate correct content with decimal amount', () => {
      expect(() =>
        ipfsApi.validateIPFSContent(ContentType.coverDesignatedWallets, validContentWithDecimalAmount),
      ).not.toThrow();
    });

    it('should reject invalid ethereum address', () => {
      const invalidWallet: CoverDesignatedWallets = {
        version: '1.0',
        wallets: [{ wallet: invalidEthAddress, amount: '1000000000000000000', currency: 'USDC' }],
      };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverDesignatedWallets, invalidWallet)).toThrow();
    });

    it('should reject invalid amount format', () => {
      const invalidAmount: CoverDesignatedWallets = {
        version: '1.0',
        wallets: [{ wallet: validEthAddress, amount: 'invalid', currency: 'USDC' }],
      };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverDesignatedWallets, invalidAmount)).toThrow();
    });

    it('should reject empty wallets array', () => {
      const invalidContent: CoverDesignatedWallets = {
        version: '1.0',
        wallets: [],
      };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverDesignatedWallets, invalidContent)).toThrow(
        'At least one wallet object is required',
      );
    });

    it('should reject empty currency', () => {
      const invalidContent: CoverDesignatedWallets = {
        version: '1.0',
        wallets: [{ wallet: validEthAddress, amount: '1000000000000000000', currency: '' }],
      };
      expect(() => ipfsApi.validateIPFSContent(ContentType.coverDesignatedWallets, invalidContent)).toThrow();
    });
  });

  describe('stakingPoolDetails', () => {
    const validContent: StakingPoolDetails = {
      version: '1.0',
      poolName: 'Test Pool',
      poolDescription: 'Test Description',
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.stakingPoolDetails, validContent)).not.toThrow();
    });

    it('should reject missing pool name', () => {
      const invalidContent = { version: '1.0', poolDescription: 'Test Description' } as StakingPoolDetails;
      expect(() => ipfsApi.validateIPFSContent(ContentType.stakingPoolDetails, invalidContent)).toThrow();
    });

    it('should reject missing pool description', () => {
      const invalidContent = { version: '1.0', poolName: 'Test Pool' } as StakingPoolDetails;
      expect(() => ipfsApi.validateIPFSContent(ContentType.stakingPoolDetails, invalidContent)).toThrow();
    });
  });

  describe('claimProof', () => {
    const validMandatoryContent: ClaimProof = {
      version: '1.0',
      coverId: 1,
      affectedAddresses: [validEthAddress],
      affectedChain: 'Ethereum',
      incidentDescription: 'Test incident',
    };

    it('should validate with only mandatory fields', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.claimProof, validMandatoryContent)).not.toThrow();
    });

    it('should reject empty mandatory fields', () => {
      const invalidMandatoryContents = [
        { ...validMandatoryContent, affectedChain: '' },
        { ...validMandatoryContent, affectedAddresses: [] },
        { ...validMandatoryContent, incidentDescription: '' },
      ];

      invalidMandatoryContents.forEach(content => {
        expect(() => ipfsApi.validateIPFSContent(ContentType.claimProof, content)).toThrow();
      });
    });

    it('should reject empty strings in optional arrays', () => {
      const invalidOptionalContents = [
        { ...validMandatoryContent, incidentTransactionHashes: [''] },
        { ...validMandatoryContent, incidentEvidenceLinks: [''] },
        { ...validMandatoryContent, attachedFilesHashes: [''] },
      ];

      invalidOptionalContents.forEach(content => {
        expect(() => ipfsApi.validateIPFSContent(ContentType.claimProof, content)).toThrow();
      });
    });

    const validContent: ClaimProof = {
      version: '1.0',
      coverId: 1,
      affectedAddresses: [validEthAddress],
      affectedChain: 'Ethereum',
      incidentDescription: 'Test incident',
      incidentTransactionHashes: ['0x123'],
      incidentEvidenceLinks: ['https://example.com'],
      attachedFilesHashes: ['QmHash'],
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.claimProof, validContent)).not.toThrow();
    });

    it('should reject invalid coverId', () => {
      const invalidContent: ClaimProof = { ...validContent, coverId: -1 };
      expect(() => ipfsApi.validateIPFSContent(ContentType.claimProof, invalidContent)).toThrow();
    });

    it('should reject invalid ethereum address', () => {
      const invalidContent: ClaimProof = { ...validContent, affectedAddresses: ['0xinvalid'] };
      expect(() => ipfsApi.validateIPFSContent(ContentType.claimProof, invalidContent)).toThrow();
    });

    it('should reject invalid evidence URL', () => {
      const invalidContent: ClaimProof = { ...validContent, incidentEvidenceLinks: ['not-a-url'] };
      expect(() => ipfsApi.validateIPFSContent(ContentType.claimProof, invalidContent)).toThrow();
    });

    it('should reject empty incidentTransactionHashes', () => {
      const invalidContent: ClaimProof = { ...validContent, incidentTransactionHashes: [] };
      expect(() => ipfsApi.validateIPFSContent(ContentType.claimProof, invalidContent)).toThrow(
        'At least one transaction hash is required',
      );
    });

    it('should reject empty incidentEvidenceLinks', () => {
      const invalidContent: ClaimProof = { ...validContent, incidentEvidenceLinks: [] };
      expect(() => ipfsApi.validateIPFSContent(ContentType.claimProof, invalidContent)).toThrow(
        'At least one evidence link is required',
      );
    });

    it('should reject empty attachedFilesHashes', () => {
      const invalidContent: ClaimProof = { ...validContent, attachedFilesHashes: [] };
      expect(() => ipfsApi.validateIPFSContent(ContentType.claimProof, invalidContent)).toThrow(
        'At least one attached file hash is required',
      );
    });
  });

  describe('assessmentCriteriaAnswers', () => {
    const validContent: AssessmentCriteriaAnswers = {
      version: '1.0',
      answers: { question1: 'answer1' },
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.assessmentCriteriaAnswers, validContent)).not.toThrow();
    });

    it('should reject invalid answers format', () => {
      const invalidAnswers = { version: '1.0', answers: 'not-an-object' } as unknown as AssessmentCriteriaAnswers;
      expect(() => ipfsApi.validateIPFSContent(ContentType.assessmentCriteriaAnswers, invalidAnswers)).toThrow();
    });
  });

  describe('governanceProposal', () => {
    const validContent: GovernanceProposal = {
      version: '1.0',
      proposal: 'Test proposal',
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.governanceProposal, validContent)).not.toThrow();
    });

    it('should reject missing proposal', () => {
      const invalidContent = { version: '1.0' } as GovernanceProposal;
      expect(() => ipfsApi.validateIPFSContent(ContentType.governanceProposal, invalidContent)).toThrow();
    });

    it('should reject empty proposal', () => {
      const invalidContent: GovernanceProposal = { version: '1.0', proposal: '' };
      expect(() => ipfsApi.validateIPFSContent(ContentType.governanceProposal, invalidContent)).toThrow(
        'Proposal cannot be empty',
      );
    });
  });

  describe('governanceCategory', () => {
    const validContent: GovernanceCategory = {
      version: '1.0',
      category: 'Test category',
    };

    it('should validate correct content', () => {
      expect(() => ipfsApi.validateIPFSContent(ContentType.governanceCategory, validContent)).not.toThrow();
    });

    it('should reject missing category', () => {
      const invalidContent = { version: '1.0' } as GovernanceCategory;
      expect(() => ipfsApi.validateIPFSContent(ContentType.governanceCategory, invalidContent)).toThrow();
    });

    it('should reject empty category', () => {
      const invalidContent: GovernanceCategory = { version: '1.0', category: '' };
      expect(() => ipfsApi.validateIPFSContent(ContentType.governanceCategory, invalidContent)).toThrow(
        'Category cannot be empty',
      );
    });
  });

  it('should reject empty content', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => ipfsApi.validateIPFSContent(ContentType.governanceCategory, null as any)).toThrow(
      'Content cannot be empty',
    );
  });

  it('should reject invalid content type', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(() => ipfsApi.validateIPFSContent('invalid' as ContentType, {} as any)).toThrow(
      'Invalid content type: invalid',
    );
  });
});
