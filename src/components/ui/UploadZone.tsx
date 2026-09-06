import React, { useState, useRef } from 'react';
import { UploadCloud, File, FileText, Image, Film, X, Check, Link as LinkIcon, Globe, BookOpen, Code2 } from 'lucide-react';
import { Button } from './Button';

export interface UploadedFile {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'ppt' | 'image' | 'video' | 'doc';
  progress: number;
}

interface UploadZoneProps {
  onFilesChange?: (files: UploadedFile[]) => void;
  onUrlsChange?: (urls: { github: string; website: string; research: string }) => void;
  className?: string;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesChange,
  onUrlsChange,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([
    { id: '1', name: 'SmartRoadVision_Architecture_PitchDeck.pptx', size: '14.2 MB', type: 'ppt', progress: 100 },
    { id: '2', name: 'Field_Evaluation_Telemetry_Results.pdf', size: '4.8 MB', type: 'pdf', progress: 100 },
    { id: '3', name: 'Jetson_Orin_Edge_Inference_Benchmark.mp4', size: '48.5 MB', type: 'video', progress: 100 },
  ]);

  const [urls, setUrls] = useState({
    github: 'https://github.com/visiongrid-labs/smart-road-vision',
    website: 'https://smartroadvision.mit.edu',
    research: 'https://arxiv.org/abs/2403.18920',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleNewFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleNewFiles(Array.from(e.target.files));
    }
  };

  const handleNewFiles = (rawFiles: globalThis.File[]) => {
    const newFiles: UploadedFile[] = rawFiles.map((f, i) => {
      let type: UploadedFile['type'] = 'doc';
      if (f.name.endsWith('.ppt') || f.name.endsWith('.pptx')) type = 'ppt';
      else if (f.name.endsWith('.pdf')) type = 'pdf';
      else if (f.name.match(/\.(png|jpg|jpeg|webp)$/i)) type = 'image';
      else if (f.name.match(/\.(mp4|mov|avi|webm)$/i)) type = 'video';

      return {
        id: `${Date.now()}-${i}`,
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type,
        progress: 100,
      };
    });

    const updated = [...files, ...newFiles];
    setFiles(updated);
    onFilesChange?.(updated);
  };

  const removeFile = (id: string) => {
    const updated = files.filter(f => f.id !== id);
    setFiles(updated);
    onFilesChange?.(updated);
  };

  const handleUrlChange = (key: keyof typeof urls, value: string) => {
    const updated = { ...urls, [key]: value };
    setUrls(updated);
    onUrlsChange?.(updated);
  };

  const getFileIcon = (type: UploadedFile['type']) => {
    switch (type) {
      case 'ppt':
        return <FileText className="w-5 h-5 text-amber-400" />;
      case 'pdf':
        return <File className="w-5 h-5 text-rose-400" />;
      case 'video':
        return <Film className="w-5 h-5 text-cyan-400" />;
      case 'image':
        return <Image className="w-5 h-5 text-emerald-400" />;
      default:
        return <FileText className="w-5 h-5 text-violet-400" />;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20'
            : 'border-slate-700/80 hover:border-cyan-500/60 bg-slate-900/40 hover:bg-slate-900/70'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".ppt,.pptx,.pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov,.webm,.zip"
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-cyan-400 mb-3 border border-slate-700">
          <UploadCloud className="w-6 h-6" />
        </div>

        <h4 className="text-base font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900">
          Drop pitch slides, documentation or demo media here
        </h4>
        <p className="mt-1 text-xs text-slate-400">
          Supports PPTX, PDF, High-Res Images, Technical Docs, and MP4 Video (up to 500MB)
        </p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" type="button">
            Browse Local Files
          </Button>
        </div>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            <span>Staged Artifacts ({files.length})</span>
            <span className="text-cyan-400 font-mono">Ready for AI Ingestion</span>
          </div>

          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded bg-slate-800 flex-shrink-0">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-200 truncate">{file.name}</p>
                    <span className="text-[11px] text-slate-400 font-mono">{file.size}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                    <Check className="w-3.5 h-3.5" /> Uploaded
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(file.id);
                    }}
                    className="text-slate-400 hover:text-rose-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* External Repository & Research Link Inputs */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>External Source Repositories & Links (Optional)</span>
        </h5>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
              <Code2 className="w-3 h-3 text-cyan-400" /> GitHub Repository
            </label>
            <input
              type="url"
              value={urls.github}
              onChange={(e) => handleUrlChange('github', e.target.value)}
              placeholder="https://github.com/..."
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
              <Globe className="w-3 h-3 text-slate-400" /> Live Website / Demo
            </label>
            <input
              type="url"
              value={urls.website}
              onChange={(e) => handleUrlChange('website', e.target.value)}
              placeholder="https://..."
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
              <BookOpen className="w-3 h-3 text-slate-400" /> Research Paper / ArXiv
            </label>
            <input
              type="url"
              value={urls.research}
              onChange={(e) => handleUrlChange('research', e.target.value)}
              placeholder="https://arxiv.org/..."
              className="w-full text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
