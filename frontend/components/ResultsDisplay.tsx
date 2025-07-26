'use client';

import { CheckCircle, DollarSign, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ResultsDisplayProps {
  results: {
    decision: string;
    amount: string;
    justification: string;
    referencedClauses: Array<{
      id: string;
      text: string;
      section: string;
    }>;
  } | null;
  isLoading: boolean;
}

export function ResultsDisplay({ results, isLoading }: ResultsDisplayProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <h2 className="text-xl font-semibold text-gray-900">Processing Query...</h2>
        </div>
        
        <div className="space-y-6">
          {/* Decision Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-48" />
          </div>
          
          {/* Amount Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
          
          {/* Justification Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* Referenced Clauses Skeleton */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-36" />
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="border rounded-lg p-4 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const getDecisionColor = (decision: string) => {
    if (decision.toLowerCase().includes('approved') || decision.toLowerCase().includes('covered')) {
      return 'text-emerald-800 bg-emerald-50 border-emerald-300';
    }
    if (decision.toLowerCase().includes('denied') || decision.toLowerCase().includes('not covered')) {
      return 'text-rose-800 bg-rose-50 border-rose-300';
    }
    return 'text-slate-800 bg-slate-50 border-slate-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6" role="region" aria-label="Query results">
      <h2 className="text-xl font-semibold text-slate-800 mb-6">Query Results</h2>
      
      <div className="space-y-6">
        {/* Decision Summary */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
            Decision
          </h3>
          <div className={`inline-flex items-center px-4 py-2 rounded-lg border font-semibold text-lg ${getDecisionColor(results.decision)}`}>
            <CheckCircle className="h-5 w-5 mr-2" />
            {results.decision}
          </div>
        </div>

        {/* Amount */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
            Coverage Amount
          </h3>
          <div className="inline-flex items-center px-4 py-2 bg-emerald-50 border border-emerald-300 rounded-lg">
            <DollarSign className="h-5 w-5 text-emerald-700 mr-2" />
            <span className="text-lg font-bold text-emerald-800">{results.amount}</span>
          </div>
        </div>

        {/* Justification */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
            Justification
          </h3>
          <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
            <p className="text-slate-800 leading-relaxed">{results.justification}</p>
          </div>
        </div>

        {/* Referenced Clauses */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-slate-700 uppercase tracking-wide">
            Referenced Policy Clauses
          </h3>
          <div className="space-y-4">
            {results.referencedClauses.map((clause, index) => (
              <Card key={clause.id} className="border-l-4 border-l-slate-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" />
                      {clause.section}
                    </Badge>
                    <span className="text-xs text-slate-500">Reference #{index + 1}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-slate-700 italic leading-relaxed border-l-2 border-stone-300 pl-4">
                    "{clause.text}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-slate-50 border border-slate-300 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-700 font-medium">Query processed successfully</span>
            <span className="text-slate-600">
              {results.referencedClauses.length} clause{results.referencedClauses.length !== 1 ? 's' : ''} referenced
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}