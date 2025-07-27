'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ZoomIn, ZoomOut, RotateCcw, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ClauseMapping, DocumentHighlight } from '@/lib/types';
import { mockDocumentContent } from '@/lib/mockData';

interface DocumentViewerProps {
  selectedClause?: ClauseMapping;
  onHighlightSelect?: (highlight: DocumentHighlight) => void;
  className?: string;
}

export default function DocumentViewer({ selectedClause, onHighlightSelect, className }: DocumentViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(3); // Mock total pages
  const contentRef = useRef<HTMLDivElement>(null);

  // Mock highlights based on selected clause
  const highlights: DocumentHighlight[] = selectedClause ? [
    {
      id: '1',
      startOffset: mockDocumentContent.indexOf('Medical Coverage'),
      endOffset: mockDocumentContent.indexOf('Medical Coverage') + 'Medical Coverage'.length,
      clause: selectedClause.clause,
      color: 'bg-policy-accent/30',
    },
    {
      id: '2', 
      startOffset: mockDocumentContent.indexOf('Ages 18-35: $500 deductible'),
      endOffset: mockDocumentContent.indexOf('Ages 18-35: $500 deductible') + 'Ages 18-35: $500 deductible'.length,
      clause: selectedClause.clause,
      color: 'bg-policy-accent-teal/30',
    }
  ] : [];

  // Scroll to highlighted content when clause is selected
  useEffect(() => {
    if (selectedClause && contentRef.current) {
      const highlightElement = contentRef.current.querySelector(`[data-highlight-id="${highlights[0]?.id}"]`);
      if (highlightElement) {
        highlightElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedClause, highlights]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleResetZoom = () => {
    setZoom(100);
  };

  const highlightText = (text: string, highlights: DocumentHighlight[]) => {
    if (highlights.length === 0) return text;

    let highlightedText = text;
    const sortedHighlights = [...highlights].sort((a, b) => b.startOffset - a.startOffset);

    sortedHighlights.forEach(highlight => {
      const before = highlightedText.substring(0, highlight.startOffset);
      const highlighted = highlightedText.substring(highlight.startOffset, highlight.endOffset);
      const after = highlightedText.substring(highlight.endOffset);

      highlightedText = before + 
        `<mark data-highlight-id="${highlight.id}" class="${highlight.color} border border-policy-accent rounded px-1 cursor-pointer transition-all duration-200 hover:scale-105" title="${highlight.clause}">` +
        highlighted + 
        '</mark>' + 
        after;
    });

    return highlightedText;
  };

  const searchHighlight = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-400 text-policy-primary rounded px-1">$1</mark>');
  };

  const processedContent = () => {
    let content = mockDocumentContent;
    content = highlightText(content, highlights);
    content = searchHighlight(content, searchTerm);
    return content;
  };

  return (
    <div className={cn('w-full bg-policy-card rounded-xl shadow-lg border border-policy-secondary overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-policy-secondary bg-policy-primary">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-policy-accent" />
          <h3 className="text-policy-text font-medium">Policy Document Viewer</h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-policy-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search document..."
              className="pl-10 pr-4 py-2 bg-policy-card border border-policy-secondary rounded-lg text-policy-text placeholder-policy-text-muted focus:outline-none focus:ring-2 focus:ring-policy-accent focus:border-transparent text-sm w-48"
              aria-label="Search document content"
            />
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1 border border-policy-secondary rounded-lg overflow-hidden">
            <button
              onClick={handleZoomOut}
              className="p-2 text-policy-text-muted hover:text-policy-text hover:bg-policy-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent"
              aria-label="Zoom out"
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-policy-text text-sm font-medium border-x border-policy-secondary">
              {zoom}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-policy-text-muted hover:text-policy-text hover:bg-policy-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent"
              aria-label="Zoom in"
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 text-policy-text-muted hover:text-policy-text hover:bg-policy-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent border-l border-policy-secondary"
              aria-label="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-1 border border-policy-secondary rounded-lg overflow-hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-2 text-policy-text-muted hover:text-policy-text hover:bg-policy-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent"
              aria-label="Previous page"
              disabled={currentPage <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 text-policy-text text-sm font-medium border-x border-policy-secondary">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-2 text-policy-text-muted hover:text-policy-text hover:bg-policy-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent"
              aria-label="Next page"
              disabled={currentPage >= totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="p-6 overflow-y-auto max-h-96 bg-white">
        <div
          ref={contentRef}
          className="prose prose-sm max-w-none"
          style={{ 
            fontSize: `${zoom}%`,
            lineHeight: '1.6',
            color: '#2d3748'
          }}
          dangerouslySetInnerHTML={{ __html: processedContent() }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'MARK' && target.dataset.highlightId) {
              const highlight = highlights.find(h => h.id === target.dataset.highlightId);
              if (highlight && onHighlightSelect) {
                onHighlightSelect(highlight);
              }
            }
          }}
        />
      </div>

      {/* Status Bar */}
      {selectedClause && (
        <div className="px-4 py-2 bg-policy-primary border-t border-policy-secondary">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-policy-accent rounded-full animate-pulse-subtle" />
            <span className="text-policy-text-muted">
              Showing highlights for: 
            </span>
            <span className="text-policy-accent font-medium">
              {selectedClause.clause}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}