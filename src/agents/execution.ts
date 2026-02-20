import { LLMClient } from '../utils/llm';
import { UploadedFile, ChartPlan, GeneratedChart, AnalysisPlan } from '../types';

function computeStats(data: Record<string, unknown>[], col: string): Record<string, unknown> {
  const values = data
    .map((row) => row[col])
    .filter((v) => v !== null && v !== undefined);

  const numericValues = values
    .map((v) => {
      const num = Number(v);
      return isNaN(num) ? null : num;
    })
    .filter((v) => v !== null) as number[];

  if (numericValues.length === 0) {
    return {
      unique: new Set(values).size,
      count: values.length,
    };
  }

  const sorted = numericValues.sort((a, b) => a - b);
  const mean = sorted.reduce((a, b) => a + b, 0) / sorted.length;
  const median = sorted[Math.floor(sorted.length / 2)];

  return {
    mean: Math.round(mean * 100) / 100,
    median: Math.round(median * 100) / 100,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    count: values.length,
    stddev: Math.round(Math.sqrt(sorted.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / sorted.length) * 100) / 100,
  };
}

function prepareChartData(file: UploadedFile, plan: ChartPlan): unknown {
  const data = file.data;

  if (plan.type === 'histogram') {
    const col = plan.x_col!;
    const bins = 20;
    const values = data
      .map((row) => {
        const v = row[col];
        const num = Number(v);
        return isNaN(num) ? null : num;
      })
      .filter((v) => v !== null) as number[];

    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;

    const histogram: Record<string, number> = {};
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binSize;
      const binEnd = binStart + binSize;
      const count = values.filter((v) => v >= binStart && v < binEnd).length;
      histogram[`${Math.round(binStart)}-${Math.round(binEnd)}`] = count;
    }

    return Object.entries(histogram).map(([range, count]) => ({
      range,
      count,
    }));
  }

  if (plan.type === 'bar') {
    const col = plan.x_col!;
    const countCol = plan.y_col;

    const groups: Record<string, number> = {};
    for (const row of data) {
      const key = String(row[col]);
      if (countCol) {
        groups[key] = (groups[key] || 0) + Number(row[countCol] || 1);
      } else {
        groups[key] = (groups[key] || 0) + 1;
      }
    }

    return Object.entries(groups)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([category, count]) => ({
        category,
        count,
      }));
  }

  if (plan.type === 'scatter') {
    const xCol = plan.x_col!;
    const yCol = plan.y_col!;

    return data
      .filter((row) => {
        const x = Number(row[xCol]);
        const y = Number(row[yCol]);
        return !isNaN(x) && !isNaN(y);
      })
      .slice(0, 500)
      .map((row) => ({
        x: Number(row[xCol]),
        y: Number(row[yCol]),
        ...(plan.color_col && { color: row[plan.color_col] }),
      }));
  }

  if (plan.type === 'line') {
    const xCol = plan.x_col!;
    const yCol = plan.y_col!;

    return data
      .filter((row) => row[xCol] !== null && row[yCol] !== null)
      .slice(0, 100)
      .map((row) => ({
        x: row[xCol],
        y: Number(row[yCol]),
      }));
  }

  if (plan.type === 'box') {
    const col = plan.y_col!;
    const groupCol = plan.x_col;

    const groups: Record<string, number[]> = {};
    for (const row of data) {
      const val = Number(row[col]);
      if (!isNaN(val)) {
        const key = groupCol ? String(row[groupCol]) : 'all';
        if (!groups[key]) groups[key] = [];
        groups[key].push(val);
      }
    }

    return Object.entries(groups).map(([group, values]) => {
      const sorted = values.sort((a, b) => a - b);
      return {
        group,
        min: sorted[0],
        q1: sorted[Math.floor(sorted.length * 0.25)],
        median: sorted[Math.floor(sorted.length * 0.5)],
        q3: sorted[Math.floor(sorted.length * 0.75)],
        max: sorted[sorted.length - 1],
      };
    });
  }

  return data.slice(0, 100);
}

async function generateChartInsight(
  llm: LLMClient,
  plan: ChartPlan,
  data: unknown,
  fileData: Record<string, unknown>[]
): Promise<string> {
  const statsText = plan.x_col ? `X-column stats: ${JSON.stringify(computeStats(fileData, plan.x_col))}` : '';
  const statsTextY = plan.y_col ? `Y-column stats: ${JSON.stringify(computeStats(fileData, plan.y_col))}` : '';

  const prompt = `Generate a brief, data-driven insight (2-3 sentences) for this chart:

Title: ${plan.title}
Type: ${plan.type}
Description: ${plan.description}
${statsText}
${statsTextY}

Sample data: ${JSON.stringify(Array.isArray(data) ? data.slice(0, 3) : data)}

Provide only the insight text, no additional formatting.`;

  return llm.generateText(prompt);
}

export async function executeAnalysis(
  llm: LLMClient,
  files: Map<string, UploadedFile>,
  plan: AnalysisPlan
): Promise<GeneratedChart[]> {
  const charts: GeneratedChart[] = [];

  for (const chartPlan of plan.charts) {
    const file = files.get(chartPlan.file);
    if (!file) continue;

    const chartData = prepareChartData(file, chartPlan);
    const insight = await generateChartInsight(llm, chartPlan, chartData, file.data);

    charts.push({
      plan: chartPlan,
      data: chartData,
      insight,
      plotConfig: generatePlotConfig(chartPlan, chartData),
    });
  }

  return charts;
}

function generatePlotConfig(plan: ChartPlan, data: unknown): Record<string, unknown> {
  const baseConfig = {
    title: plan.title,
    type: plan.type,
  };

  if (plan.type === 'histogram' && Array.isArray(data)) {
    return {
      ...baseConfig,
      xAxisKey: 'range',
      yAxisKey: 'count',
    };
  }

  if (plan.type === 'bar' && Array.isArray(data)) {
    return {
      ...baseConfig,
      xAxisKey: 'category',
      yAxisKey: 'count',
    };
  }

  if (plan.type === 'scatter' && Array.isArray(data)) {
    return {
      ...baseConfig,
      xAxisKey: 'x',
      yAxisKey: 'y',
    };
  }

  return baseConfig;
}

export async function generateExecutiveSummary(
  llm: LLMClient,
  plan: AnalysisPlan,
  charts: GeneratedChart[]
): Promise<string> {
  const insightsText = charts.map((c) => `- ${c.plan.title}: ${c.insight}`).join('\n');

  const prompt = `Based on these analysis results, generate a 3-4 sentence executive summary addressing the focus: "${plan.focus}"

Key Insights:
${insightsText}

Provide only the summary text, no additional formatting.`;

  return llm.generateText(prompt);
}
