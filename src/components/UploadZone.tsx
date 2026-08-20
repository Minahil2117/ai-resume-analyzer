"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

interface UploadZoneProps {
  file: File | null;
  onFileSelected: (file: File | null) => void;
}

export default function UploadZone({ file, onFileSelected }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const candidate = files?.[0];
      if (!candidate) return;
      if (candidate.type !== "application/pdf") return;
      onFileSelected(candidate);
    },
    [onFileSelected]
  );

  return (
    <div>
      <label
        htmlFor="resume-upload"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-sm border-2 border-dashed p-8 text-center transition-colors ${
          isDragging
            ? "border-teal bg-paper-dim/10"
            : "border-ink-700 bg-paper text-ink-950 hover:border-teal/60"
        } ${file ? "bg-paper" : "bg-paper"}`}
      >
        {isDragging && <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-teal animate-scan-sweep" />}

        {file ? (
          <>
            <FileText className="h-9 w-9 text-ink-800" strokeWidth={1.5} />
            <div className="max-w-full">
              <p className="truncate font-mono text-sm font-medium text-ink-950">{file.name}</p>
              <p className="mt-1 text-xs text-ink-700/70">{(file.size / 1024).toFixed(0)} KB · click to replace</p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onFileSelected(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="absolute right-3 top-3 rounded-full bg-ink-950/5 p-1.5 text-ink-800 hover:bg-ink-950/10"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <UploadCloud className="h-9 w-9 text-ink-800" strokeWidth={1.5} />
            <div>
              <p className="font-medium text-ink-950">Drop your resume here</p>
              <p className="mt-1 text-sm text-ink-700/70">PDF only, or click to browse</p>
            </div>
          </>
        )}

        <input
          ref={inputRef}
          id="resume-upload"
          type="file"
          accept="application/pdf"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>
    </div>
  );
}
