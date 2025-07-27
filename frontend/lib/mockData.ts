import { RecentQuery, DocumentHistoryItem, QueryEntity, PolicyResult, ClauseMapping } from './types';

export const mockRecentQueries: RecentQuery[] = [
  {
    id: '1',
    query: 'Approve claim for 35-year-old from California, $15,000 medical expense',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    entityCount: 4,
  },
  {
    id: '2',
    query: 'Evaluate auto insurance claim for accident in Texas, $8,500 damage',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    entityCount: 3,
  },
  {
    id: '3',
    query: 'Process life insurance application for 45-year-old, $500,000 coverage',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    entityCount: 3,
  },
  {
    id: '4',
    query: 'Review property claim for flood damage in Florida, $25,000',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    entityCount: 4,
  },
  {
    id: '5',
    query: 'Analyze health insurance pre-authorization for surgery, $12,000',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    entityCount: 3,
  },
  {
    id: '6',
    query: 'Evaluate disability claim for 52-year-old construction worker',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    entityCount: 3,
  },
];

export const mockDocumentHistory: DocumentHistoryItem[] = [
  {
    id: '1',
    name: 'Policy_Manual_2024.pdf',
    type: 'pdf',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 2),
    size: '2.4 MB',
    status: 'processed',
  },
  {
    id: '2',
    name: 'Claims_Guidelines.docx',
    type: 'docx',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24),
    size: '856 KB',
    status: 'processed',
  },
  {
    id: '3',
    name: 'Customer_Inquiry_Email.eml',
    type: 'email',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    size: '124 KB',
    status: 'processing',
  },
  {
    id: '4',
    name: 'Underwriting_Rules_v3.pdf',
    type: 'pdf',
    uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    size: '1.8 MB',
    status: 'processed',
  },
];

export const mockQueryEntities: QueryEntity[] = [
  { id: '1', type: 'age', value: '35', editable: true },
  { id: '2', type: 'location', value: 'California', editable: true },
  { id: '3', type: 'amount', value: '$15,000', editable: true },
  { id: '4', type: 'policy_type', value: 'Medical', editable: true },
];

export const mockClauseMappings: ClauseMapping[] = [
  {
    id: '1',
    clause: 'Section 4.2.1 - Medical Expense Coverage',
    section: 'Coverage Limitations',
    relevance: 'high',
    pageNumber: 12,
    highlighted: true,
  },
  {
    id: '2',
    clause: 'Section 7.1 - Age-Based Deductibles',
    section: 'Deductible Structure',
    relevance: 'medium',
    pageNumber: 28,
    highlighted: true,
  },
  {
    id: '3',
    clause: 'Section 2.3 - Geographic Coverage Areas',
    section: 'Eligibility Requirements',
    relevance: 'medium',
    pageNumber: 8,
    highlighted: false,
  },
];

export const mockPolicyResult: PolicyResult = {
  id: '1',
  decision: 'approved',
  amount: '$15,000',
  justification: 'The claim meets all policy requirements for medical expense coverage. The claimant is within the eligible age range, the location is covered under the policy terms, and the claim amount falls within the annual coverage limit of $50,000.',
  confidence: 94,
  clauseMappings: mockClauseMappings,
  details: {
    policySection: 'Medical Coverage - Standard Plan',
    riskAssessment: 'Low risk based on claim history and policy compliance',
    additionalNotes: 'Recommend standard processing with 5-day review period',
  },
};

export const mockDocumentContent = `
POLICY MANUAL 2024 - MEDICAL COVERAGE

Section 1: Overview
This policy provides comprehensive medical coverage for eligible members.

Section 2: Eligibility Requirements
2.1 Age Requirements
Coverage is available for individuals aged 18-65 years.

2.2 Geographic Coverage
Coverage extends to residents of all 50 states, with specific provisions for:
- California: Full coverage including experimental treatments
- Texas: Standard coverage with optional add-ons
- Florida: Enhanced disaster-related medical coverage

Section 3: Coverage Details
3.1 Annual Limits
Standard coverage provides up to $50,000 per calendar year for medical expenses.

3.2 Deductibles
Age-based deductible structure:
- Ages 18-35: $500 deductible
- Ages 36-50: $750 deductible  
- Ages 51-65: $1,000 deductible

Section 4: Claims Processing
4.1 Claim Submission
All claims must be submitted within 90 days of service date.

4.2 Medical Expense Coverage
Covered medical expenses include:
- Emergency room visits
- Specialist consultations
- Diagnostic procedures
- Prescription medications
- Surgical procedures

4.3 Approval Process
Claims are processed within 5-10 business days based on complexity and documentation completeness.
`;