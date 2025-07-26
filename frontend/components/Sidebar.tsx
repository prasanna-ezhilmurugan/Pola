'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Clock, 
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  recentQueries: string[];
  uploadedDocuments: any[];
  onQuerySelect: (query: string) => void;
  onDocumentSelect: (document: any) => void;
}

export function Sidebar({ 
  collapsed, 
  onToggle, 
  recentQueries, 
  uploadedDocuments,
  onQuerySelect,
  onDocumentSelect 
}: SidebarProps) {
  const [activeSection, setActiveSection] = useState<'queries' | 'documents'>('queries');

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TooltipProvider>
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-slate-50 border-r border-slate-200 transition-all duration-300 ease-in-out z-10 flex flex-col shadow-sm",
          collapsed ? "w-16" : "w-80"
        )}
        role="complementary"
        aria-label="Navigation sidebar"
      >
        {/* Toggle Button */}
        <div className="p-4 border-b border-slate-200">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggle}
                className="w-8 h-8"
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-hidden">
          {collapsed ? (
            // Collapsed View - Icons Only
            <div className="p-2 space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeSection === 'queries' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="w-12 h-12"
                    onClick={() => setActiveSection('queries')}
                    aria-label="Recent queries"
                  >
                    <Clock className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Recent Queries</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={activeSection === 'documents' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="w-12 h-12"
                    onClick={() => setActiveSection('documents')}
                    aria-label="Document history"
                  >
                    <FileText className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Documents</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            // Expanded View
            <div className="p-4 space-y-4">
              {/* Section Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <Button
                  variant={activeSection === 'queries' ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "flex-1 text-xs transition-colors",
                    activeSection === 'queries' 
                      ? "bg-slate-600 text-white hover:bg-slate-700" 
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                  onClick={() => setActiveSection('queries')}
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Recent
                </Button>
                <Button
                  variant={activeSection === 'documents' ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "flex-1 text-xs transition-colors",
                    activeSection === 'documents' 
                      ? "bg-slate-600 text-white hover:bg-slate-700" 
                      : "text-slate-600 hover:bg-slate-100"
                  )}
                  onClick={() => setActiveSection('documents')}
                >
                  <FileText className="h-3 w-3 mr-1" />
                  Documents
                </Button>
              </div>

              {/* Recent Queries */}
              {activeSection === 'queries' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Recent Queries</h3>
                  {recentQueries.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No recent queries</p>
                  ) : (
                    <div className="space-y-2">
                      {recentQueries.map((query, index) => (
                        <button
                          key={index}
                          onClick={() => onQuerySelect(query)}
                          className="w-full text-left p-3 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors group border border-transparent hover:border-slate-300"
                          title={query}
                        >
                          <div className="flex items-start space-x-2">
                            <Search className="h-3 w-3 text-slate-400 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700 line-clamp-2 leading-relaxed">
                              {query}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Document History */}
              {activeSection === 'documents' && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-700 mb-3">Documents</h3>
                  {uploadedDocuments.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No documents uploaded</p>
                  ) : (
                    <div className="space-y-2">
                      {uploadedDocuments.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => onDocumentSelect(doc)}
                          className="w-full text-left p-3 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-transparent hover:border-slate-300"
                        >
                          <div className="flex items-start space-x-2">
                            <FileText className="h-3 w-3 text-slate-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-slate-700 font-medium truncate">
                                {doc.name}
                              </p>
                              <div className="text-xs text-slate-500 mt-1">
                                <span>{formatFileSize(doc.size)}</span>
                                <span className="mx-1">•</span>
                                <span>{formatDate(doc.uploadDate)}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}