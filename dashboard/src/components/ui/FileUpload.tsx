"use client";

import React, { useRef, useState } from "react";
import { validateFile, getAcceptString, FileValidationResult } from "@/utils/fileValidation";

interface FileUploadProps {
  label?: string;
  onFileSelect?: (file: File | null) => void;
  accept?: string;
  allowedTypes?: ('image' | 'video' | 'document')[];
  onValidationError?: (error: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  onFileSelect,
  accept,
  allowedTypes = ['image'],
  onValidationError,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    setIsLoading(true);
    
    if (file) {
      // Validate file
      const validation: FileValidationResult = validateFile(file, allowedTypes);
      
      if (!validation.isValid) {
        const errorMessage = validation.error || 'Invalid file type';
        setError(errorMessage);
        setIsLoading(false);
        onValidationError?.(errorMessage);
        // Reset input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Create preview for images and videos
      if (validation.fileType === 'image' || validation.fileType === 'video') {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError('Failed to load file preview');
          setIsLoading(false);
        };
        if (validation.fileType === 'image') {
          reader.readAsDataURL(file);
        } else {
          // For videos, create object URL
          const videoUrl = URL.createObjectURL(file);
          setPreview(videoUrl);
          setIsLoading(false);
        }
      } else {
        // For documents, just show file name
        setPreview(null);
        setIsLoading(false);
      }
      
      onFileSelect?.(file);
    } else {
      setPreview(null);
      setIsLoading(false);
      onFileSelect?.(null);
    }
  };

  // Get accept string from allowedTypes if accept prop is not provided
  const acceptString = accept || getAcceptString(allowedTypes);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#002F45] mb-2">
          {label}
        </label>
      )}
      {error && (
        <div className="mb-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div
        onClick={handleClick}
        className={`w-full h-72 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gray-50 transition-colors duration-150 hover:border-[#002F45] hover:bg-[#002F45]/5 focus-within:border-[#002F45] focus-within:ring-2 focus-within:ring-[#002F45]/30 ${
          error ? 'border-red-300' : 'border-gray-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptString}
          onChange={handleFileChange}
          className="hidden"
        />
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <svg
              className="animate-spin h-12 w-12 text-[#002F45] mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-sm text-gray-600">Processing file...</p>
          </div>
        ) : preview ? (
          <div className="w-full h-full relative">
            {allowedTypes.includes('video') && preview.startsWith('blob:') ? (
              <video
                src={preview}
                controls
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>
        ) : (
          <>
            <svg
              className="w-12 h-12 text-gray-400 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm text-gray-500">
              Click to upload {allowedTypes.join(' or ')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Allowed: {allowedTypes.join(', ')}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

