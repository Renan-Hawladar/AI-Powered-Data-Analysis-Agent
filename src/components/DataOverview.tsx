import React from 'react';
import { ChevronDown } from 'lucide-react';
import { UploadedFile } from '../types';

interface DataOverviewProps {
  files: UploadedFile[];
}

export const DataOverview: React.FC<DataOverviewProps> = ({ files }) => {
  const [expanded, setExpanded] = React.useState<string | null>(null);

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-slate-300 font-semibold">Data Overview</h3>
      {files.map((file) => (
        <div key={file.name} className="border border-slate-700 rounded-lg overflow-hidden">
          <button
            onClick={() => setExpanded(expanded === file.name ? null : file.name)}
            className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 transition-colors"
          >
            <span className="text-slate-300 font-medium">{file.name}</span>
            <ChevronDown
              size={20}
              className={`text-cyan-400 transition-transform ${
                expanded === file.name ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expanded === file.name && (
            <div className="p-4 space-y-3 bg-slate-900/50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Rows</p>
                  <p className="text-xl font-semibold text-cyan-400">{file.shape[0]}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-wide">Columns</p>
                  <p className="text-xl font-semibold text-cyan-400">{file.shape[1]}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Column Types:</p>
                <div className="space-y-1">
                  {file.columns.slice(0, 8).map((col) => {
                    const samples = file.data
                      .map((row) => row[col])
                      .filter((v) => v !== null && v !== undefined)
                      .slice(0, 3);

                    const types = new Set(
                      samples.map((v) => {
                        const num = Number(v);
                        if (!isNaN(num)) return 'number';
                        if (v === 'true' || v === 'false') return 'boolean';
                        return 'string';
                      })
                    );

                    return (
                      <div key={col} className="text-xs">
                        <span className="text-slate-400">{col}:</span>
                        <span className="text-cyan-400 ml-2">
                          {Array.from(types).join('/')}
                        </span>
                      </div>
                    );
                  })}
                  {file.columns.length > 8 && (
                    <p className="text-xs text-slate-500">
                      +{file.columns.length - 8} more columns
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-300 mb-2">Sample Data (First Row):</p>
                <div className="bg-slate-950 p-2 rounded text-xs text-slate-400 overflow-x-auto">
                  {Object.entries(file.data[0] || {})
                    .slice(0, 5)
                    .map(([key, value]) => (
                      <div key={key}>
                        <span className="text-cyan-400">{key}:</span> {String(value)}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
