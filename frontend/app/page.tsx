"use client";

import React, { useState, useCallback } from "react";
import Sidebar from "@/components/layout/Sidebar";
import DocumentUploader from "@/components/upload/DocumentUploader";
import QueryInput from "@/components/query/QueryInput";
import QueryDetails from "@/components/query/QueryDetails";
import ResultsPanel from "@/components/results/ResultsPanel";
import DocumentViewer from "@/components/viewer/DocumentViewer";
import { mockQueryEntities, mockPolicyResult } from "@/lib/mockData";
import {
  QueryEntity,
  PolicyResult,
  ClauseMapping,
  DocumentHighlight,
} from "@/lib/types";

export default function Home() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [entities, setEntities] = useState<QueryEntity[]>(mockQueryEntities);
  const [result, setResult] = useState<PolicyResult | null>(null);
  const [selectedClause, setSelectedClause] = useState<ClauseMapping | null>(
    null
  );
  const [showResults, setShowResults] = useState(false);

  const handleQuerySubmit = useCallback(async (query: string) => {
    setIsLoading(true);
    setShowResults(false);
    setResult(null);
    setSelectedClause(null);

    // Simulate API call
    try {
      const response = await fetch("http://localhost:5000/api/query", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Query failed");
      }

      const data = await response.json();
      setResult(data);
      setShowResults(true);
    } catch (error) {
      console.error("Query error : ", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClauseSelect = useCallback((clause: ClauseMapping) => {
    setSelectedClause(clause);
  }, []);

  const handleHighlightSelect = useCallback((highlight: DocumentHighlight) => {
    console.log("Highlight selected:", highlight);
  }, []);

  const handleUpload = useCallback(async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      const data = await response.json();
      console.log("Upload successful:", data);
      // Handle successful upload (e.g., update state, show success message)
    } catch (error) {
      console.error("Upload error:", error);
      // Handle upload error (e.g., show error message)
    }
  }, []);

  return (
    <div className="min-h-screen bg-policy-primary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main
        className="transition-all duration-300 ease-in-out ml-16 lg:ml-60"
        style={{ minHeight: "100vh" }}
      >
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-policy-text mb-2">
              POLA -  Policy Language Assistant
            </h1>
            <p className="text-policy-text-muted">
              Analyze documents and process queries with AI-powered insights
            </p>
          </header>

          {/* Upload Section */}
          <section className="mb-8" aria-labelledby="upload-heading">
            <h2
              id="upload-heading"
              className="text-xl font-semibold text-policy-text mb-4"
            >
              Document Upload
            </h2>
            <DocumentUploader onUpload={handleUpload} />
          </section>

          {/* Query Section */}
          <section className="mb-8" aria-labelledby="query-heading">
            <h2
              id="query-heading"
              className="text-xl font-semibold text-policy-text mb-4"
            >
              Policy Query
            </h2>
            <div className="space-y-6">
              <QueryInput onSubmit={handleQuerySubmit} isLoading={isLoading} />

              {/* {entities.length > 0 && (
                <QueryDetails
                  entities={entities}
                  onEntitiesChange={setEntities}
                />
              )} */}
            </div>
          </section>

          {/* Results Section */}
          {showResults && result && (
            <section className="mb-8" aria-labelledby="results-heading">
              <h2
                id="results-heading"
                className="text-xl font-semibold text-policy-text mb-4"
              >
                Analysis Results
              </h2>
              <ResultsPanel
                result={result}
                onClauseSelect={handleClauseSelect}
              />
            </section>
          )}

          {/* Document Viewer Section */}
          {showResults && (
            <section aria-labelledby="viewer-heading">
              <h2
                id="viewer-heading"
                className="text-xl font-semibold text-policy-text mb-4"
              >
                Document Analysis
              </h2>
              <DocumentViewer
                selectedClause={selectedClause}
                onHighlightSelect={handleHighlightSelect}
              />
            </section>
          )}

          {/* Loading State */}
          {isLoading && (
            <section
              className="mb-8"
              aria-live="polite"
              aria-label="Loading results"
            >
              <div className="bg-policy-card rounded-xl p-8 border border-policy-secondary">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-8 h-8 border-4 border-policy-accent border-t-transparent rounded-full animate-spin" />
                  <div className="text-policy-text">
                    <p className="font-medium">Analyzing your query...</p>
                    <p className="text-sm text-policy-text-muted mt-1">
                      This may take a few moments
                    </p>
                  </div>
                </div>

                {/* Loading Steps */}
                <div className="mt-6 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-policy-accent rounded-full animate-pulse" />
                    <span className="text-sm text-policy-text-muted">
                      Processing entities...
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-2 h-2 bg-policy-accent-teal rounded-full animate-pulse"
                      style={{ animationDelay: "0.5s" }}
                    />
                    <span className="text-sm text-policy-text-muted">
                      Searching policy documents...
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"
                      style={{ animationDelay: "1s" }}
                    />
                    <span className="text-sm text-policy-text-muted">
                      Generating recommendations...
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
