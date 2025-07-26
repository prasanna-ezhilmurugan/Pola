'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { DocumentUploader } from '@/components/DocumentUploader';
import { QueryInput } from '@/components/QueryInput';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { DocumentViewer } from '@/components/DocumentViewer';
import { QueryChips } from '@/components/QueryChips';
import { cn } from '@/lib/utils';

export default function PolicyRetrievalSystem() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [queryDetails, setQueryDetails] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [recentQueries, setRecentQueries] = useState([
    'What is the maximum coverage limit for dental procedures?',
    'Are pre-existing conditions covered under this policy?',
    'What documents are required for claim submission?'
  ]);

  const handleQuerySubmit = async () => {
    if (!currentQuery.trim()) return;
    
    setIsLoading(true);
    
    // Extract query parameters (mock implementation)
    const mockDetails = [
      'coverage type: dental',
      'amount: maximum limit',
      'category: benefits'
    ];
    setQueryDetails(mockDetails);
    
    // Add to recent queries
    if (!recentQueries.includes(currentQuery)) {
      setRecentQueries(prev => [currentQuery, ...prev.slice(0, 4)]);
    }
    
    // Simulate API call
    setTimeout(() => {
      const mockResults = {
        decision: 'Coverage Approved',
        amount: '$2,500 annually',
        justification: 'According to Section 4.2.1 of the policy, dental procedures are covered up to $2,500 per calendar year for preventive and basic treatments.',
        referencedClauses: [
          {
            id: 'section-4-2-1',
            text: 'Dental coverage includes preventive care, basic restorative procedures, and emergency treatments up to the annual maximum benefit of $2,500 per covered individual.',
            section: 'Section 4.2.1 - Dental Benefits'
          },
          {
            id: 'section-4-2-3',
            text: 'Coverage resets annually on the policy anniversary date. Unused benefits do not carry over to the following year.',
            section: 'Section 4.2.3 - Benefit Periods'
          }
        ]
      };
      
      setResults(mockResults);
      setIsLoading(false);
    }, 2000);
  };

  const handleDocumentUpload = (files: File[]) => {
    const newDocuments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date().toISOString()
    }));
    
    setUploadedDocuments(prev => [...prev, ...newDocuments]);
    
    // Auto-select first document for viewer
    if (!selectedDocument && newDocuments.length > 0) {
      setSelectedDocument(newDocuments[0]);
    }
  };

  const handleQueryChipRemove = (chipToRemove: string) => {
    setQueryDetails(prev => prev.filter(chip => chip !== chipToRemove));
  };

  const handleQueryChipEdit = (oldChip: string, newChip: string) => {
    setQueryDetails(prev => prev.map(chip => chip === oldChip ? newChip : chip));
  };

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        recentQueries={recentQueries}
        uploadedDocuments={uploadedDocuments}
        onQuerySelect={setCurrentQuery}
        onDocumentSelect={setSelectedDocument}
      />
      
      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "ml-16" : "ml-80"
        )}
        role="main"
        aria-label="Policy retrieval interface"
      >
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Policy Retrieval System
              </h1>
              <p className="text-slate-600">
                Upload documents and query policy information using natural language
              </p>
            </div>

            {/* Document Uploader */}
            <DocumentUploader onUpload={handleDocumentUpload} />

            {/* Query Input Section */}
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 space-y-4">
              <QueryInput
                value={currentQuery}
                onChange={setCurrentQuery}
                onSubmit={handleQuerySubmit}
                isLoading={isLoading}
                disabled={uploadedDocuments.length === 0}
              />
              
              {/* Query Details Chips */}
              {queryDetails.length > 0 && (
                <QueryChips
                  chips={queryDetails}
                  onRemove={handleQueryChipRemove}
                  onEdit={handleQueryChipEdit}
                />
              )}
            </div>

            {/* Results Display */}
            {(isLoading || results) && (
              <ResultsDisplay
                results={results}
                isLoading={isLoading}
              />
            )}

            {/* Document Viewer */}
            {selectedDocument && (
              <DocumentViewer
                document={selectedDocument}
                highlightedClauses={results?.referencedClauses || []}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}