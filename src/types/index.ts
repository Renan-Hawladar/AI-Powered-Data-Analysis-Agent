export interface UploadedFile {
  name: string;
  data: Record<string, unknown>[];
  columns: string[];
  shape: [number, number];
}

export interface AnalysisState {
  files: UploadedFile[];
  focus: string;
  apiKey: string;
  provider: 'openai' | 'gemini';
  model: string;
  analysisResults: AnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export interface SchemaCompressed {
  [fileName: string]: {
    description: string;
    rows: number;
    columns: Record<string, string>;
  };
}

export interface AnalysisPlan {
  focus: string;
  charts: ChartPlan[];
  summary_points: string[];
}

export interface ChartPlan {
  type: 'histogram' | 'bar' | 'scatter' | 'violin' | 'box' | 'line' | 'heatmap';
  x_col?: string;
  y_col?: string;
  color_col?: string;
  file: string;
  title: string;
  description: string;
}

export interface AnalysisResult {
  plan: AnalysisPlan;
  charts: GeneratedChart[];
  executive_summary: string;
  insights: string[];
}

export interface GeneratedChart {
  plan: ChartPlan;
  data: unknown;
  insight: string;
  plotConfig: unknown;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
