'use client';

import React, { useState, useCallback } from 'react';
import { ArrowUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QueryInputProps {
  onSubmit?: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export default function QueryInput({ 
  onSubmit, 
  isLoading = false, 
  placeholder = "Enter your policy query in natural language...",
  className 
}: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading && onSubmit) {
      onSubmit(query.trim());
    }
  }, [query, isLoading, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const isDisabled = !query.trim() || isLoading;

  return (
    <div className={cn('w-full', className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={cn(
            'relative flex items-center bg-policy-card border rounded-xl transition-all duration-200',
            isFocused 
              ? 'border-policy-accent shadow-lg shadow-policy-accent/20' 
              : 'border-policy-secondary hover:border-policy-text-muted'
          )}
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              'flex-1 bg-transparent px-4 py-3 text-policy-text placeholder-policy-text-muted',
              'focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
              'text-base'
            )}
            aria-label="Policy query input"
            aria-describedby="query-help"
          />
          
          <button
            type="submit"
            disabled={isDisabled}
            className={cn(
              'mr-2 p-2 rounded-lg transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-policy-accent focus:ring-offset-2 focus:ring-offset-policy-card',
              isDisabled
                ? 'bg-policy-secondary text-policy-text-muted cursor-not-allowed'
                : 'bg-policy-accent text-policy-primary hover:bg-policy-accent/90 hover:scale-105'
            )}
            aria-label={isLoading ? 'Processing query' : 'Submit query'}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ArrowUp className="w-5 h-5 text-policy-accent-teal" />
            )}
          </button>
        </div>
        
        {/* Helper Text */}
        <p 
          id="query-help" 
          className="mt-2 text-xs text-policy-text-muted"
        >
          Try: "Approve claim for 35-year-old from California, $15,000 medical expense"
        </p>
      </form>

      {/* Loading State Indicator */}
      {isLoading && (
        <div className="mt-4 flex items-center gap-2 text-policy-accent animate-fade-in">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Analyzing your query...</span>
        </div>
      )}
    </div>
  );
}