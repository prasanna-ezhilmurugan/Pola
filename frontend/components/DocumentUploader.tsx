'use client';

import { useState, useCallback } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface DocumentUploaderProps {
  onUpload: (files: File[]) => void;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export function DocumentUploader({ onUpload }: DocumentUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  const acceptedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ];

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return 'File type not supported. Please upload PDF, DOC, DOCX, or TXT files.';
    }
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      return 'File size must be less than 10MB.';
    }
    return null;
  };

  const simulateUpload = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          // Simulate occasional failures for demo
          if (Math.random() > 0.9) {
            reject(new Error('Upload failed due to network error'));
          } else {
            resolve();
          }
        }
        
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { ...uf, progress: Math.min(progress, 100) }
              : uf
          )
        );
      }, 200);
    });
  };

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const newUploadingFiles: UploadingFile[] = [];

    fileArray.forEach(file => {
      const error = validateFile(file);
      if (error) {
        newUploadingFiles.push({
          file,
          progress: 0,
          status: 'error',
          error
        });
      } else {
        validFiles.push(file);
        newUploadingFiles.push({
          file,
          progress: 0,
          status: 'uploading'
        });
      }
    });

    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

    // Process valid files
    for (const file of validFiles) {
      try {
        await simulateUpload(file);
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { ...uf, status: 'success' as const, progress: 100 }
              : uf
          )
        );
      } catch (error) {
        setUploadingFiles(prev => 
          prev.map(uf => 
            uf.file === file 
              ? { 
                  ...uf, 
                  status: 'error' as const, 
                  error: error instanceof Error ? error.message : 'Upload failed' 
                }
              : uf
          )
        );
      }
    }

    // Call onUpload with successful files after a delay
    setTimeout(() => {
      const successfulFiles = fileArray.filter(file => {
        const uploadingFile = newUploadingFiles.find(uf => uf.file === file);
        return uploadingFile && !uploadingFile.error;
      });
      if (successfulFiles.length > 0) {
        onUpload(successfulFiles);
      }
    }, 1000);
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
    // Reset input value to allow re-uploading same file
    e.target.value = '';
  }, [handleFiles]);

  const removeUploadingFile = (file: File) => {
    setUploadingFiles(prev => prev.filter(uf => uf.file !== file));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Document Upload</h2>
      
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
          isDragOver 
            ? "border-slate-400 bg-slate-50" 
            : "border-stone-300 hover:border-stone-400 hover:bg-stone-50"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload documents by clicking or dragging files here"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            document.getElementById('file-input')?.click();
          }
        }}
      >
        <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-slate-700 mb-2">
          {isDragOver ? 'Drop files here' : 'Upload Policy Documents'}
        </p>
        <p className="text-sm text-slate-500 mb-4">
          Drag and drop files here, or click to browse
        </p>
        <p className="text-xs text-slate-400">
          Supports PDF, DOC, DOCX, TXT files up to 10MB each
        </p>
        
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileInput}
          className="hidden"
          aria-hidden="true"
        />
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-medium text-slate-700">Upload Progress</h3>
          {uploadingFiles.map((uploadingFile, index) => (
            <div key={index} className="bg-stone-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2 min-w-0 flex-1">
                  <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {uploadingFile.file.name}
                  </span>
                  <span className="text-xs text-slate-500 flex-shrink-0">
                    ({formatFileSize(uploadingFile.file.size)})
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadingFile.status === 'success' && (
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  )}
                  {uploadingFile.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeUploadingFile(uploadingFile.file)}
                    aria-label={`Remove ${uploadingFile.file.name}`}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {uploadingFile.status === 'uploading' && (
                <Progress value={uploadingFile.progress} className="h-2" />
              )}
              
              {uploadingFile.status === 'error' && (
                <p className="text-xs text-rose-600 mt-1">
                  {uploadingFile.error}
                </p>
              )}
              
              {uploadingFile.status === 'success' && (
                <p className="text-xs text-emerald-600 mt-1">
                  Upload completed successfully
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}