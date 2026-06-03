import { Ipfs } from './Ipfs';
import {
  ContentType,
  StakingPoolDetails,
  ClaimProof,
  AssessmentCriteriaAnswers,
  GovernanceProposal,
  GovernanceCategory,
} from '../types/ipfs';

describe('validateIPFSContent', () => {
  const validEthAddress = '0x1234567890123456789012345678901234567890';
  const ipfsApi = new Ipfs();

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
