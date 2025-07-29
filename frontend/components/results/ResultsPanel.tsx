'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, Clock, TrendingUp, FileText, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PolicyResult, ClauseMapping } from '@/lib/types';

interface ResultsPanelProps {
  result: PolicyResult;
  onClauseSelect?: (clause: ClauseMapping) => void;
  className?: string;
}

export default function ResultsPanel({ result, onClauseSelect, className }: ResultsPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getDecisionIcon = (decision: PolicyResult['decision']) => {
    switch (decision) {
      case 'approved':
        return <CheckCircle2 className="w-6 h-6 text-policy-accent-teal" />;
      case 'rejected':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-policy-text-muted" />;
    }
  };

  const getDecisionColor = (decision: PolicyResult['decision']) => {
    switch (decision) {
      case 'approved':
        return 'bg-policy-accent-teal/20 border-policy-accent-teal text-policy-accent-teal';
      case 'rejected':
        return 'bg-red-500/20 border-red-500 text-red-400';
      case 'pending':
        return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      default:
        return 'bg-policy-text-muted/20 border-policy-text-muted text-policy-text-muted';
    }
  };

  const getRelevanceColor = (relevance: ClauseMapping['relevance']) => {
    switch (relevance) {
      case 'high':
        return 'bg-policy-accent text-policy-primary';
      case 'medium':
        return 'bg-yellow-500 text-policy-primary';
      case 'low':
        return 'bg-policy-text-muted text-policy-text';
      default:
        return 'bg-policy-text-muted text-policy-text';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-policy-accent-teal';
    if (confidence >= 70) return 'text-yellow-500';
    return 'text-red-400';
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="bg-policy-card rounded-xl shadow-lg border border-policy-secondary overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-policy-secondary">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getDecisionIcon(result.decision)}
              <div>
                <h2 className="text-policy-text font-semibold text-lg capitalize">
                  {result.decision}
                </h2>
                {result.amount && (
                  <p className="text-policy-accent font-medium text-xl">
                    {result.amount}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-policy-text-muted text-sm">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-policy-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all duration-1000 ease-out',
                        getConfidenceColor(result.confidence).replace('text-', 'bg-')
                      )}
                      style={{ width: `${result.confidence}%` }}
                      role="progressbar"
                      aria-valuenow={result.confidence}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <span className={cn('font-medium', getConfidenceColor(result.confidence))}>
                    {result.confidence}%
                  </span>
                </div>
              </div>
              
              <div className={cn('px-3 py-1 rounded-full border text-sm font-medium', getDecisionColor(result.decision))}>
                {result.decision.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Justification */}
          <div className="space-y-2">
            <h3 className="text-policy-text font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Decision Justification
            </h3>
            <p className="text-policy-text-muted leading-relaxed">
              {result.justification}
            </p>
          </div>
        </div>

        {/* Clause Mappings Preview */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-policy-text font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Referenced Clauses ({result.clauseMappings.length})
            </h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-1 text-property-accent hover:text-policy-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent rounded-lg px-2 py-1"
              aria-expanded={showDetails}
              aria-label={showDetails ? 'Hide details' : 'Show details'}
            >
              <span className="text-sm font-medium">
                {showDetails ? 'Hide Details' : 'Show Details'}
              </span>
              {showDetails ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Quick Preview */}
          {!showDetails && (
            <div className="flex flex-wrap gap-2">
              {result.clauseMappings.slice(0, 3).map((clause) => (
                <button
                  key={clause.id}
                  onClick={() => onClauseSelect?.(clause)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-policy-card',
                    getRelevanceColor(clause.relevance)
                  )}
                  aria-label={`View clause: ${clause.clause}`}
                >
                  {clause.section}
                </button>
              ))}
              {result.clauseMappings.length > 3 && (
                <span className="px-3 py-1 bg-policy-secondary text-policy-text-muted rounded-lg text-xs">
                  +{result.clauseMappings.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Detailed View */}
          {showDetails && (
            <div className="space-y-4 animate-fade-in">
              {/* Policy Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-policy-primary rounded-lg">
                <div>
                  <h4 className="text-policy-text font-medium text-sm mb-2">Policy Section</h4>
                  <p className="text-policy-text-muted text-sm">{result.details.policySection}</p>
                </div>
                <div>
                  <h4 className="text-policy-text font-medium text-sm mb-2">Risk Assessment</h4>
                  <p className="text-policy-text-muted text-sm">{result.details.riskAssessment}</p>
                </div>
                {result.details.additionalNotes && (
                  <div className="md:col-span-2">
                    <h4 className="text-policy-text font-medium text-sm mb-2">Additional Notes</h4>
                    <p className="text-policy-text-muted text-sm">{result.details.additionalNotes}</p>
                  </div>
                )}
              </div>

              {/* Clause Mappings List */}
              <div className="space-y-3">
                {result.clauseMappings.map((clause, index) => (
                  <button
                    key={clause.id}
                    onClick={() => onClauseSelect?.(clause)}
                    className="w-full text-left p-4 bg-policy-primary rounded-lg border border-policy-secondary hover:border-policy-accent transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-policy-text font-medium text-sm group-hover:text-policy-text-muted transition-colors duration-200">
                        {clause.clause}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', getRelevanceColor(clause.relevance))}>
                          {clause.relevance}
                        </span>
                        <span className="text-policy-text-muted text-xs">
                          Page {clause.pageNumber}
                        </span>
                      </div>
                    </div>
                    <p className="text-policy-text-muted text-sm">
                      Section: {clause.section}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}