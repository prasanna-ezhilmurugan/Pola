'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface QueryInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export function QueryInput({ value, onChange, onSubmit, isLoading, disabled }: QueryInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && value.trim() && !isLoading) {
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const placeholder = disabled 
    ? "Please upload a document first to begin querying..."
    : "Ask a question about your policy documents... (e.g., 'What is the maximum coverage for dental procedures?')";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="query-input" className="text-sm font-medium text-slate-700">
          Policy Query
        </label>
        <div className="relative">
          <Textarea
            id="query-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className={`min-h-[120px] pr-12 resize-none transition-all duration-200 ${
              isFocused ? 'ring-2 ring-slate-500 border-slate-500' : ''
            } ${disabled ? 'bg-stone-50 cursor-not-allowed' : ''}`}
            aria-describedby="query-help"
          />
          <div className="absolute right-3 top-3">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
        </div>
        <p id="query-help" className="text-xs text-slate-500">
          Use natural language to ask questions about policy coverage, limits, requirements, and procedures.
          {!disabled && " Press Ctrl+Enter to submit quickly."}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">
          {value.length > 0 && (
            <span>
              {value.length} characters
              {value.length > 500 && (
                <span className="text-amber-700 ml-1">
                  (Consider shortening for better results)
                </span>
              )}
            </span>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={disabled || !value.trim() || isLoading}
          className="min-w-[120px]"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Run Query
            </>
          )}
        </Button>
      </div>

      {disabled && (
        <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <div className="bg-amber-200 rounded-full p-1">
              <Search className="h-4 w-4 text-amber-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-amber-900">
                No Documents Available
              </p>
              <p className="text-sm text-amber-800 mt-1">
                Upload policy documents above to start querying for information and coverage details.
              </p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}