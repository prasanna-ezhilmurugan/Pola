'use client';

import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface DocumentViewerProps {
  document: {
    id: string | number;
    name: string;
    type: string;
    size: number;
  };
  highlightedClauses: Array<{
    id: string;
    text: string;
    section: string;
  }>;
}

export function DocumentViewer({ document, highlightedClauses }: DocumentViewerProps) {
  const [zoom, setZoom] = useState([100]);
  const [showHighlights, setShowHighlights] = useState(true);
  const [selectedClause, setSelectedClause] = useState<string | null>(null);

  // Mock document content for demonstration
  const mockDocumentContent = {
    title: "Health Insurance Policy - Comprehensive Coverage Plan",
    sections: [
      {
        id: "section-1",
        title: "1. Coverage Overview",
        content: "This comprehensive health insurance policy provides coverage for medical, dental, and vision care services. The policy is designed to offer financial protection against healthcare costs while ensuring access to quality medical care."
      },
      {
        id: "section-4-2-1",
        title: "4.2.1 Dental Benefits",
        content: "Dental coverage includes preventive care, basic restorative procedures, and emergency treatments up to the annual maximum benefit of $2,500 per covered individual. Preventive services such as cleanings, examinations, and fluoride treatments are covered at 100% of the allowed amount. Basic restorative procedures including fillings, extractions, and oral surgery are covered at 80% of the allowed amount after deductible.",
        highlighted: true
      },
      {
        id: "section-4-2-2",
        title: "4.2.2 Dental Limitations",
        content: "Certain limitations apply to dental coverage. Orthodontic treatment is limited to dependent children under age 19. Cosmetic dental procedures are not covered unless deemed medically necessary. Pre-authorization is required for major dental procedures exceeding $500."
      },
      {
        id: "section-4-2-3",
        title: "4.2.3 Benefit Periods",
        content: "Coverage resets annually on the policy anniversary date. Unused benefits do not carry over to the following year. The annual maximum applies to the calendar year from January 1st through December 31st. All claims must be submitted within 12 months of the date of service.",
        highlighted: true
      },
      {
        id: "section-5",
        title: "5. Claims and Reimbursement",
        content: "Claims should be submitted promptly after receiving services. The insurance company will process claims within 30 days of receipt. Reimbursement will be made directly to the healthcare provider when possible, or to the insured member when payment has already been made."
      },
      {
        id: "section-6",
        title: "6. Member Responsibilities",
        content: "Members are responsible for paying deductibles, copayments, and coinsurance amounts as specified in the policy. It is important to verify that healthcare providers are in-network to maximize benefits and minimize out-of-pocket costs."
      }
    ]
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const scrollToClause = (clauseId: string) => {
    setSelectedClause(clauseId);
    const element = document.getElementById(`clause-${clauseId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flash highlight
      setTimeout(() => setSelectedClause(null), 2000);
    }
  };

  const handleZoomChange = (value: number[]) => {
    setZoom(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200">
      {/* Header */}
      <div className="border-b border-stone-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <FileText className="h-5 w-5 text-slate-500" />
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{document.name}</h3>
              <p className="text-sm text-slate-500">
                {formatFileSize(document.size)} • {document.type}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHighlights(!showHighlights)}
              className={showHighlights ? 'bg-amber-50 border-amber-300' : ''}
            >
              {showHighlights ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              <span className="ml-2">Highlights</span>
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleZoomChange([Math.max(50, zoom[0] - 10)])}
                disabled={zoom[0] <= 50}
                aria-label="Zoom out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2 min-w-[120px]">
                <Slider
                  value={zoom}
                  onValueChange={handleZoomChange}
                  max={200}
                  min={50}
                  step={10}
                  className="flex-1"
                  aria-label="Zoom level"
                />
                <span className="text-sm text-gray-600 min-w-[40px]">{zoom[0]}%</span>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() => handleZoomChange([Math.min(200, zoom[0] + 10)])}
                disabled={zoom[0] >= 200}
                aria-label="Zoom in"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleZoomChange([100])}
                aria-label="Reset zoom"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Referenced Clauses Navigation */}
          {highlightedClauses.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">Jump to:</span>
              {highlightedClauses.map((clause, index) => (
                <Button
                  key={clause.id}
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToClause(clause.id)}
                  className="text-xs"
                >
                  Ref {index + 1}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Document Content */}
      <div 
        className="p-6 max-h-[600px] overflow-y-auto"
        style={{ fontSize: `${zoom[0] / 100}rem` }}
      >
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Document Title */}
          <div className="text-center border-b border-stone-200 pb-6">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              {mockDocumentContent.title}
            </h1>
            <Badge variant="secondary">Policy Document</Badge>
          </div>

          {/* Document Sections */}
          <div className="space-y-6">
            {mockDocumentContent.sections.map((section) => {
              const isHighlighted = section.highlighted && showHighlights;
              const isSelected = selectedClause === section.id;
              const isReferenced = highlightedClauses.some(clause => clause.id === section.id);
              
              return (
                <div
                  key={section.id}
                  id={`clause-${section.id}`}
                  className={cn(
                    "p-4 rounded-lg border transition-all duration-300",
                    isHighlighted && "bg-amber-50 border-amber-300 shadow-sm",
                    isSelected && "ring-2 ring-slate-500 bg-slate-50",
                    isReferenced && showHighlights && "border-l-4 border-l-slate-500",
                    !isHighlighted && !isSelected && "border-stone-200"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-lg font-semibold text-slate-800">
                      {section.title}
                    </h2>
                    {isReferenced && showHighlights && (
                      <Badge variant="secondary" className="ml-2">
                        Referenced
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-slate-700 leading-relaxed">
                    {section.content}
                  </p>
                  
                  {isHighlighted && showHighlights && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="text-xs text-amber-800">
                        This section was referenced in your query results
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-stone-200 p-4 bg-stone-50">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            {showHighlights && highlightedClauses.length > 0 
              ? `${highlightedClauses.length} section${highlightedClauses.length !== 1 ? 's' : ''} highlighted`
              : 'Document viewer ready'
            }
          </span>
          <span>Zoom: {zoom[0]}%</span>
        </div>
      </div>
    </div>
  );
}