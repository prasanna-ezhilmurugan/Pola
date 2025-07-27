export interface RecentQuery {
  id: string;
  query: string;
  timestamp: Date;
  entityCount: number;
}

export interface DocumentHistoryItem {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'email';
  uploadDate: Date;
  size: string;
  status: 'processed' | 'processing' | 'error';
}

export interface QueryEntity {
  id: string;
  type: 'age' | 'location' | 'amount' | 'date' | 'policy_type' | 'custom';
  value: string;
  editable: boolean;
}

export interface PolicyResult {
  id: string;
  decision: 'approved' | 'rejected' | 'pending';
  amount?: string;
  justification: string;
  confidence: number;
  clauseMappings: ClauseMapping[];
  details: {
    policySection: string;
    riskAssessment: string;
    additionalNotes?: string;
  };
}

export interface ClauseMapping {
  id: string;
  clause: string;
  section: string;
  relevance: 'high' | 'medium' | 'low';
  pageNumber: number;
  highlighted: boolean;
}

export interface UploadProgress {
  progress: number;
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface DocumentHighlight {
  id: string;
  startOffset: number;
  endOffset: number;
  clause: string;
  color: string;
}