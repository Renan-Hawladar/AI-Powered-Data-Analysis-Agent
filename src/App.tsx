import React from 'react';
import { Loader, Zap } from 'lucide-react';
import { Settings } from './components/Settings';
import { FileUpload } from './components/FileUpload';
import { DataOverview } from './components/DataOverview';
import { ChartDisplay } from './components/ChartDisplay';
import { ChatPanel } from './components/ChatPanel';
import { LLMClient } from './utils/llm';
import { compressSchema } from './agents/schema';
import { planAnalysis } from './agents/planning';
import { executeAnalysis, generateExecutiveSummary } from './agents/execution';
import { UploadedFile, AnalysisResult, ChatMessage, ChartPlan, GeneratedChart } from './types';

function App() {
  const [files, setFiles] = React.useState<UploadedFile[]>([]);
  const [focus, setFocus] = React.useState('');
  const [provider, setProvider] = React.useState<'openai' | 'gemini'>('gemini');
  const [model, setModel] = React.useState('gemini-2.5-flash');
  const [apiKey, setApiKey] = React.useState('');
  const [analysisResults, setAnalysisResults] = React.useState<AnalysisResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = React.useState(false);

  const llmClient = React.useMemo(() => {
    if (!apiKey) return null;
    return new LLMClient(provider, apiKey, model);
  }, [provider, apiKey, model]);

  const generateAutoCharts = React.useCallback((uploadedFiles: UploadedFile[]) => {
    const autoCharts: GeneratedChart[] = [];

    uploadedFiles.forEach((file) => {
      const numericColumns = file.columns.filter((col) => {
        const sample = file.data.slice(0, 10).map((row) => row[col]);
        return sample.some((val) => {
          const num = Number(val);
          return !isNaN(num) && val !== null && val !== '';
        });
      });

      if (numericColumns.length > 0) {
        const lineData = file.data.slice(0, 100).map((row, index) => {
          const dataPoint: Record<string, unknown> = { index: index + 1 };
          numericColumns.forEach((col) => {
            const val = Number(row[col]);
            if (!isNaN(val)) {
              dataPoint[col] = val;
            }
          });
          return dataPoint;
        });

        numericColumns.forEach((col) => {
          const chartPlan: ChartPlan = {
            type: 'line',
            x_col: 'index',
            y_col: col,
            file: file.name,
            title: `${col} - Line Chart`,
            description: `Trend analysis of ${col} from ${file.name}`,
          };

          autoCharts.push({
            plan: chartPlan,
            data: lineData,
            insight: `Time series visualization of ${col} showing ${lineData.length} data points.`,
            plotConfig: {
              title: chartPlan.title,
              type: 'line',
              xAxisKey: 'index',
              yAxisKey: col,
            },
          });
        });
      }
    });

    if (autoCharts.length > 0) {
      setAnalysisResults({
        plan: {
          focus: 'Auto-generated line charts for all numeric columns',
          charts: autoCharts.map((c) => c.plan),
          summary_points: ['Automatic visualization of uploaded data'],
        },
        charts: autoCharts,
        executive_summary: `Generated ${autoCharts.length} line chart${autoCharts.length > 1 ? 's' : ''} from your uploaded data files. These charts show the trends of all numeric columns.`,
        insights: ['Automatic visualization created for all numeric columns'],
      });
    }
  }, []);

  const handleFilesAdded = (newFiles: UploadedFile[]) => {
    const updatedFiles = [...files, ...newFiles];
    setFiles(updatedFiles);
    generateAutoCharts(updatedFiles);
  };

  const handleFileRemoved = (fileName: string) => {
    const updatedFiles = files.filter((f) => f.name !== fileName);
    setFiles(updatedFiles);
    if (updatedFiles.length > 0) {
      generateAutoCharts(updatedFiles);
    } else {
      setAnalysisResults(null);
    }
  };

  const handleRunAnalysis = async () => {
    if (!llmClient) {
      setError('Please configure API key first');
      return;
    }

    if (files.length === 0) {
      setError('Please upload at least one data file');
      return;
    }

    if (!focus.trim()) {
      setError('Please enter an analysis focus');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const schema = compressSchema(files);
      const fileMap = new Map(files.map((f) => [f.name, f]));
      const fileNames = Array.from(fileMap.keys());

      const plan = await planAnalysis(llmClient, schema, focus, fileNames);
      const charts = await executeAnalysis(llmClient, fileMap, plan);
      const summary = await generateExecutiveSummary(llmClient, plan, charts);

      setAnalysisResults({
        plan,
        charts,
        executive_summary: summary,
        insights: plan.summary_points,
      });

      setMessages([]);
    } catch (err) {
      setError(`Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChatMessage = async (message: string) => {
    if (!llmClient || !analysisResults) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatLoading(true);

    try {
      const dataContext = analysisResults.charts
        .map(
          (c) =>
            `Chart: ${c.plan.title}\nInsight: ${c.insight}`
        )
        .join('\n\n');

      const filesContext = files
        .map(
          (f) =>
            `File: ${f.name}, Rows: ${f.shape[0]}, Columns: ${f.columns.join(', ')}`
        )
        .join('\n');

      const sampleData = files
        .map(
          (f) =>
            `${f.name} sample:\n${JSON.stringify(f.data.slice(0, 2), null, 2)}`
        )
        .join('\n\n');

      const prompt = `You are analyzing data. Here's the context from the analysis:

Focus: ${analysisResults.plan.focus}

Files:
${filesContext}

Sample Data:
${sampleData}

Charts and Insights:
${dataContext}

Executive Summary: ${analysisResults.executive_summary}

User question: ${message}

Provide a concise, data-driven answer based on the analysis results.`;

      const response = await llmClient.generateText(prompt);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="text-cyan-400" size={32} />
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Data Analysis Agent
            </h1>
          </div>
          <p className="text-slate-400">
            AI-powered exploratory data analysis with interactive insights
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 rounded-lg border border-slate-700 overflow-hidden">
              <Settings
                provider={provider}
                model={model}
                apiKey={apiKey}
                onProviderChange={setProvider}
                onModelChange={setModel}
                onApiKeyChange={setApiKey}
              />

              <div className="p-4 space-y-4 border-t border-slate-700">
                <FileUpload
                  files={files}
                  onFilesAdded={handleFilesAdded}
                  onFileRemoved={handleFileRemoved}
                />

                <DataOverview files={files} />

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Analysis Focus
                  </label>
                  <textarea
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                    placeholder="e.g., Find the hero product, Analyze price trends..."
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded focus:outline-none focus:border-cyan-500 placeholder-slate-500 h-24 resize-none"
                  />
                </div>

                <button
                  onClick={handleRunAnalysis}
                  disabled={loading || !apiKey || files.length === 0}
                  className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader size={20} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Run Analysis'
                  )}
                </button>

                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded text-sm text-red-300">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {analysisResults && (
              <>
                {/* Executive Summary */}
                <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-cyan-400 mb-3">Executive Summary</h2>
                  <p className="text-slate-200 leading-relaxed">
                    {analysisResults.executive_summary}
                  </p>
                </div>

                {/* Charts */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-slate-300">Analysis Results</h2>
                  {analysisResults.charts.map((chart, idx) => (
                    <ChartDisplay key={idx} chart={chart} />
                  ))}
                </div>

                {/* Chat Panel */}
                <div className="sticky bottom-0 h-96">
                  <ChatPanel
                    messages={messages}
                    loading={chatLoading}
                    onSendMessage={handleChatMessage}
                  />
                </div>
              </>
            )}

            {!analysisResults && !loading && (
              <div className="flex items-center justify-center h-64 bg-slate-800/30 rounded-lg border border-slate-700">
                <div className="text-center">
                  <p className="text-slate-400 mb-2">Upload files and click "Run Analysis" to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
