import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

interface SettingsProps {
  provider: 'openai' | 'gemini';
  model: string;
  apiKey: string;
  onProviderChange: (provider: 'openai' | 'gemini') => void;
  onModelChange: (model: string) => void;
  onApiKeyChange: (key: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({
  provider,
  model,
  apiKey,
  onProviderChange,
  onModelChange,
  onApiKeyChange,
}) => {
  const [showSettings, setShowSettings] = React.useState(false);

  const models = {
    openai: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    gemini: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  };

  return (
    <div className="border-b border-slate-700">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 transition-colors"
      >
        <SettingsIcon size={20} />
        <span className="font-medium">API Configuration</span>
      </button>

      {showSettings && (
        <div className="px-4 py-4 space-y-4 bg-slate-800/50">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              LLM Provider
            </label>
            <div className="flex gap-3">
              {(['openai', 'gemini'] as const).map((prov) => (
                <button
                  key={prov}
                  onClick={() => {
                    onProviderChange(prov);
                    onModelChange(models[prov][0]);
                  }}
                  className={`px-4 py-2 rounded font-medium transition-colors ${
                    provider === prov
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {prov === 'openai' ? 'OpenAI' : 'Google Gemini'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => onModelChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded focus:outline-none focus:border-cyan-500"
            >
              {models[provider].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              {provider === 'openai' ? 'OpenAI API Key' : 'Gemini API Key'}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder={`Enter your ${provider === 'openai' ? 'OpenAI' : 'Gemini'} API key`}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
            <p className="text-xs text-slate-400 mt-2">
              {provider === 'openai'
                ? 'Get your key from https://platform.openai.com/api-keys'
                : 'Get your key from https://aistudio.google.com/app/apikey'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
