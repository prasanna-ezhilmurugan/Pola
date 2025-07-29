'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, File, AlertCircle, CheckCircle2, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UploadProgress } from '@/lib/types';

interface DocumentUploaderProps {
  onUpload?: (files: File[]) => void;
  className?: string;
}

export default function DocumentUploader({ onUpload, className }: DocumentUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    progress: 0,
    status: 'idle'
  });
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = ['.pdf', '.docx', '.doc', '.eml', '.msg'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `File type ${extension} not supported. Please upload PDF, DOCX, or email files.`;
    }
    if (file.size > maxFileSize) {
      return `File size exceeds 10MB limit. Please choose a smaller file.`;
    }
    return null;
  };

  const simulateUpload = useCallback(async (files: File[]) => {
    setUploadProgress({ progress: 0, status: 'uploading' });
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setUploadProgress({ progress: i, status: 'uploading' });
    }

    // Simulate processing
    setUploadProgress({ progress: 100, status: 'processing' });
    await new Promise(resolve => setTimeout(resolve, 1500));

    setUploadProgress({ progress: 100, status: 'completed' });
    setUploadedFiles(prev => [...prev, ...files]);
    
    if (onUpload) {
      onUpload(files);
    }

    // Reset after 2 seconds
    setTimeout(() => {
      setUploadProgress({ progress: 0, status: 'idle' });
    }, 2000);
  }, [onUpload]);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    let errorMessage = '';

    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errorMessage = error;
        setUploadProgress({ progress: 0, status: 'error', error });
        return;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      await simulateUpload(validFiles);
    }
  }, [simulateUpload]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const handleRetry = useCallback(() => {
    setUploadProgress({ progress: 0, status: 'idle' });
  }, []);

  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  const getStatusIcon = () => {
    switch (uploadProgress.status) {
      case 'uploading':
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-policy-accent animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-policy-accent-teal" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Upload className="w-5 h-5 text-policy-text-muted" />;
    }
  };

  const getStatusText = () => {
    switch (uploadProgress.status) {
      case 'uploading':
        return `Uploading... ${uploadProgress.progress}%`;
      case 'processing':
        return 'Processing document...';
      case 'completed':
        return 'Upload completed!';
      case 'error':
        return uploadProgress.error || 'Upload failed';
      default:
        return 'Drop files here or click to browse';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Upload Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-32 min-h-[300px] text-center transition-all duration-300 ease-in-out',
          dragActive 
            ? 'border-policy-accent bg-policy-accent/10' 
            : 'border-policy-text-muted hover:border-policy-accent hover:bg-policy-card/50',
          uploadProgress.status === 'error' && 'border-red-400 bg-red-400/10'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="File upload area"
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          className="hidden"
          aria-label="File input"
        />

        <div className="flex flex-col items-center gap-4">
          {getStatusIcon()}
          
          <div>
            <p className="text-policy-text font-medium mb-2">
              {getStatusText()}
            </p>
            {uploadProgress.status === 'idle' && (
              <p className="text-policy-text-muted text-sm">
                Supports PDF, DOCX, and email files up to 10MB
              </p>
            )}
          </div>

          {/* Progress Bar */}
          {(uploadProgress.status === 'uploading' || uploadProgress.status === 'processing') && (
            <div className="w-full max-w-xs">
              <div className="bg-policy-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-policy-accent transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress.progress}%` }}
                  role="progressbar"
                  aria-valuenow={uploadProgress.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Upload progress: ${uploadProgress.progress}%`}
                />
              </div>
            </div>
          )}

          {/* Error Actions */}
          {uploadProgress.status === 'error' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRetry();
              }}
              className="px-4 py-2 bg-policy-accent text-policy-primary rounded-lg hover:bg-policy-accent/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent"
            >
              Try Again
            </button>
          )}
        </div>
      </div>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-policy-text font-medium text-sm">Uploaded Files</h3>
          {uploadedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-policy-card rounded-lg"
            >
              <div className="flex items-center gap-3">
                <File className="w-4 h-4 text-policy-accent" />
                <div>
                  <p className="text-policy-text text-sm font-medium">{file.name}</p>
                  <p className="text-policy-text-muted text-xs">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-policy-text-muted hover:text-policy-text transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-policy-accent rounded"
                aria-label={`Remove ${file.name}`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}