'use client';

import React, { useState, useEffect } from 'react';
import { Clock, FileText, ChevronLeft, ChevronRight, Search, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockRecentQueries, mockDocumentHistory } from '@/lib/mockData';
import { RecentQuery, DocumentHistoryItem } from '@/lib/types';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !isCollapsed) {
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isCollapsed]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getStatusColor = (status: DocumentHistoryItem['status']) => {
    switch (status) {
      case 'processed':
        return 'bg-policy-accent-teal';
      case 'processing':
        return 'bg-policy-accent';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-policy-text-muted';
    }
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-policy-sidebar border-r border-policy-secondary transition-all duration-300 ease-in-out z-40',
        isCollapsed ? 'w-16' : 'w-60',
        className
      )}
      role="complementary"
      aria-label="Navigation sidebar"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 bg-policy-card border border-policy-secondary rounded-full p-1.5 text-policy-text hover:bg-policy-secondary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      <div className="p-4 border-b border-policy-secondary">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-policy-card rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-policy-accent-teal" />
          </div>
          {!isCollapsed && (
            <h1 className="text-policy-text font-semibold text-lg">
              Policy Search
            </h1>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!isCollapsed ? (
          <div className="p-4 space-y-6">
            {/* Recent Queries Section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-policy-accent-teal" />
                <h2 className="text-policy-text font-medium text-sm">
                  Recent Queries
                </h2>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mockRecentQueries.map((query: RecentQuery) => (
                  <button
                    key={query.id}
                    className="w-full text-left p-3 rounded-lg bg-policy-card hover:bg-policy-secondary transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-policy-accent"
                    aria-label={`Recent query: ${query.query}`}
                  >
                    <p className="text-policy-text text-xs line-clamp-2 mb-1">
                      {query.query}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-policy-text-muted text-xs">
                        {formatTimeAgo(query.timestamp)}
                      </span>
                      <span className="bg-policy-accent text-policy-text text-xs px-2 py-0.5 rounded-full">
                        {query.entityCount}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Document History Section */}
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-policy-accent-teal" />
                <h2 className="text-policy-text font-medium text-sm">
                  Document History
                </h2>
              </div>
              <div className="space-y-2">
                {mockDocumentHistory.map((doc: DocumentHistoryItem) => (
                  <button
                    key={doc.id}
                    className="w-full text-left p-3 rounded-lg bg-policy-card hover:bg-policy-secondary transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-policy-accent-teal"
                    aria-label={`Document: ${doc.name}`}
                  >
                    <div className="flex items-start gap-2">
                    
                      <div className="flex-1 min-w-0">
                        <p className="text-policy-text text-xs font-medium truncate">
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-policy-text-muted text-xs">
                            {doc.size}
                          </span>
                          <div
                            className={cn(
                              'w-2 h-2 rounded-full',
                              getStatusColor(doc.status)
                            )}
                            aria-label={`Status: ${doc.status}`}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : (
          <div className="p-2 space-y-4 mt-4">
            {/* Collapsed Icons */}
            <div 
              className="flex flex-col items-center space-y-3"
              role="toolbar"
              aria-label="Sidebar shortcuts"
            >
              <button
                className="w-10 h-10 bg-policy-card hover:bg-policy-secondary rounded-lg flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent"
                title="Recent Queries"
                aria-label="Show recent queries"
              >
                <Clock className="w-5 h-5 text-policy-accent-teal" />
              </button>
              <button
                className="w-10 h-10 bg-policy-card hover:bg-policy-secondary rounded-lg flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent-teal"
                title="Document History"
                aria-label="Show document history"
              >
                <FileText className="w-5 h-5 text-policy-accent-teal" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}