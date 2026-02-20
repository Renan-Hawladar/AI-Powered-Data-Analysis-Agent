import { LLMClient } from '../utils/llm';
import { SchemaCompressed, AnalysisPlan } from '../types';
import { getSchemaContext } from './schema';

export async function planAnalysis(
  llm: LLMClient,
  schema: SchemaCompressed,
  focus: string,
  fileNames: string[]
): Promise<AnalysisPlan> {
  const schemaContext = getSchemaContext(schema);

  const prompt = `You are an expert data analyst. Based on the following schema and user focus, create an analysis plan.

${schemaContext}

USER FOCUS: ${focus}

Available files: ${fileNames.join(', ')}

Generate a JSON object with this exact structure:
{
  "focus": "${focus}",
  "charts": [
    {
      "type": "chart_type",
      "x_col": "column_name or null",
      "y_col": "column_name or null",
      "color_col": "column_name or null",
      "file": "filename",
      "title": "Chart title",
      "description": "What this chart shows"
    }
  ],
  "summary_points": ["insight 1", "insight 2"]
}

Chart types to choose from: histogram, bar, scatter, violin, box, line, heatmap

Create 3-5 relevant charts that help answer the user's focus. Make sure columns actually exist in the data.`;

  return llm.generateJSON<AnalysisPlan>(prompt);
}
