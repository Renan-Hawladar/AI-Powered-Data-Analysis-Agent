import React from 'react';
import { Upload, X } from 'lucide-react';
import { UploadedFile } from '../types';
import { parseFile } from '../utils/parser';

interface FileUploadProps {
  files: UploadedFile[];
  onFilesAdded: (files: UploadedFile[]) => void;
  onFileRemoved: (fileName: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesAdded,
  onFileRemoved,
}) => {
  const [dragActive, setDragActive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList) => {
    setLoading(true);
    try {
      const newFiles: UploadedFile[] = [];
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const parsed = await parseFile(file);
        newFiles.push(parsed);
      }
      onFilesAdded(newFiles);
    } catch (error) {
      alert(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-cyan-500 bg-cyan-500/10'
            : 'border-slate-600 bg-slate-800/30 hover:border-cyan-500/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".csv,.xlsx,.xls"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={loading}
        />

        <Upload className="mx-auto mb-3 text-cyan-400" size={32} />
        <h3 className="text-slate-300 font-medium mb-1">Upload Data Files</h3>
        <p className="text-slate-400 text-sm mb-4">
          Drag and drop CSV or Excel files, or click to browse
        </p>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Browse Files'}
        </button>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-slate-300 font-medium">Uploaded Files</h4>
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded border border-slate-700"
            >
              <div>
                <p className="text-slate-300 font-medium">{file.name}</p>
                <p className="text-sm text-slate-400">
                  {file.shape[0]} rows × {file.shape[1]} columns
                </p>
              </div>
              <button
                onClick={() => onFileRemoved(file.name)}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
