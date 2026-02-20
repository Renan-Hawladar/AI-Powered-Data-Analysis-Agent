# Data Analysis Agent

An intelligent, LLM-powered Exploratory Data Analysis agent built with React and TypeScript. Upload CSV or XLSX files and get instant, automated interactive visualizations with AI-driven insights — powered by OpenAI, Google Gemini (including gemini-2.5-flash), or any compatible LLM.

Featuring **automatic line chart generation**, **real-time data insights**, **interactive Q&A chat**, and **seamless multi-file analysis** — all in a modern, responsive web interface.

---

## Features

### Smart Data Analysis
- **Automatic Chart Generation** — Upload CSV/XLSX files and instantly see line charts for every numeric column
- **AI-Driven Planning** — Define your analysis focus and let the LLM create a tailored analysis plan
- **Data-Driven Insights** — Every chart includes AI-generated insights based on actual data statistics
- **Real-Time Processing** — Charts appear immediately upon file upload

### Interactive Exploration
- **Q&A Chat Panel** — Ask follow-up questions about your data and get instant, data-backed answers
- **Multi-File Support** — Analyze multiple datasets simultaneously and compare across files
- **Data Overview Dashboard** — View file statistics, row counts, column types, and data samples
- **Interactive Charts** — Hover for details, zoom, and explore data trends

### Flexible LLM Integration
- **OpenAI Support** — gpt-4o, gpt-4-turbo, gpt-3.5-turbo
- **Google Gemini** — gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-pro, gemini-1.5-flash
- **Easy Provider Switching** — Toggle between providers in the settings panel
- **Custom Model Selection** — Choose any available model per provider

### Professional UI/UX
- **Dark Mode Theme** — Modern, easy-on-the-eyes interface with cyan and blue accents
- **Responsive Design** — Works seamlessly on desktop and tablet
- **Real-Time Feedback** — Loading states, error handling, and instant visual feedback
- **Accessible Settings** — Simple API key configuration with provider-specific guidance

---

## Architecture

The system follows a **three-agent pipeline** architecture:

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Schema Agent    │     │  Planning Agent  │     │  Execution Agent │
│                  │     │                  │     │                  │
│  • Compresses    │────▶│  • LLM generates │────▶│  • Computes      │
│    schemas       │     │    analysis plan │     │    statistics    │
│  • Minimizes     │     │  • Tailored to   │     │  • Renders       │
│    token usage   │     │    user focus    │     │    charts        │
│                  │     │  • Defines chart │     │  • Generates     │
│                  │     │    types & axes  │     │    insights      │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                            │
                                                ┌───────────▼───────────┐
                                                │  Chat & Reporting     │
                                                │                       │
                                                │  • Q&A Chat with LLM  │
                                                │  • Executive Summary  │
                                                │  • Context-Aware QA   │
                                                └───────────────────────┘
```

| Component | File | Responsibility |
|-----------|------|-----------------|
| **Schema Compression** | `src/agents/schema.ts` | Compresses file schemas to minimize token usage and improve performance |
| **Analysis Planning** | `src/agents/planning.ts` | Generates structured EDA plan based on schemas and user intent |
| **Execution Agent** | `src/agents/execution.ts` | Computes statistics, generates chart data, and creates data-driven insights |
| **LLM Client** | `src/utils/llm.ts` | Unified interface for OpenAI and Google Gemini APIs |
| **Parser** | `src/utils/parser.ts` | Handles CSV/XLSX parsing and data transformation |
| **Main App** | `src/App.tsx` | Orchestrates workflow, manages state, and handles UI |

---

## Project Structure

```
project/
├── src/
│   ├── agents/
│   │   ├── schema.ts          # Schema compression agent
│   │   ├── planning.ts         # Analysis planning agent
│   │   ├── execution.ts        # Execution and insight generation
│   │
│   ├── components/
│   │   ├── Settings.tsx        # API configuration panel
│   │   ├── FileUpload.tsx      # File upload handler
│   │   ├── DataOverview.tsx    # Data statistics display
│   │   ├── ChartDisplay.tsx    # Chart rendering with recharts
│   │   └── ChatPanel.tsx       # Q&A chat interface
│   │
│   ├── utils/
│   │   ├── llm.ts             # OpenAI and Gemini client wrapper
│   │   └── parser.ts          # CSV/XLSX parsing utilities
│   │
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   │
│   ├── App.tsx                # Main application component
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles with Tailwind
│
├── .env                       # Environment variables
├── vite.config.ts             # Vite configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

---

## Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- An LLM API key:
  - **OpenAI**: Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
  - **Google Gemini**: Get from [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd project

# Install dependencies
npm install

# Create .env file
touch .env
```

### Configuration

Add your LLM API key to `.env`:

```env
# For OpenAI
VITE_OPENAI_API_KEY=sk-your-key-here

# For Google Gemini (Recommended)
VITE_GEMINI_API_KEY=your-gemini-key-here
```

### Running Locally

```bash
# Start development server (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## Usage Workflow

### Step 1: Configure API
Click **"API Configuration"** in the left sidebar:
- Select your LLM provider (OpenAI or Google Gemini)
- Choose a model (default: gemini-2.5-flash)
- Enter your API key

### Step 2: Upload Files
Use **"Upload Data"** to select one or more CSV/XLSX files. Upon upload:
- Files are parsed and validated
- **Automatic line charts** are generated for all numeric columns
- Data overview shows row counts, columns, and statistics

### Step 3: (Optional) Run Custom Analysis
1. Enter an analysis focus (e.g., *"Identify top products by revenue"*)
2. Click **"Run Analysis"**
3. The system generates:
   - A tailored analysis plan
   - Specialized charts based on your focus
   - An executive summary

### Step 4: Explore & Ask Questions
- **View Charts**: Hover over charts for detailed tooltips
- **Ask Questions**: Use the chat panel to ask follow-up questions
  - Example: *"What's the average value in column X?"*
  - Example: *"Compare product sales across regions"*
- Chat answers are grounded in your actual data

---

## Supported File Formats

| Format | Status | Notes |
|--------|:------:|-------|
| CSV | ✅ | Comma-separated values with auto-delimiter detection |
| XLSX | ✅ | Excel workbooks (first sheet imported) |
| TSV | ✅ | Tab-separated values (auto-detected) |
| JSON | ❌ | Not currently supported |

---

## Chart Types & Auto-Generation

When you upload a file, the app automatically:

1. **Detects numeric columns** (integers, floats)
2. **Creates a line chart** for each numeric column
3. **Uses row index** as X-axis
4. **Shows up to 100 rows** per chart (for performance)
5. **Displays immediate insights** (data point count, trends)

### Example
Upload `sales.csv` with columns: `date`, `product`, `revenue`, `units_sold`

Automatic charts generated:
- `revenue - Line Chart` (line chart showing revenue trend)
- `units_sold - Line Chart` (line chart showing unit sales trend)

---

## LLM Configuration

### OpenAI Models
- **gpt-4o** (latest, recommended for complex analysis)
- **gpt-4-turbo** (fast, good balance)
- **gpt-3.5-turbo** (fast, budget-friendly)

### Google Gemini Models
- **gemini-2.5-flash** (latest, fast, recommended)
- **gemini-2.0-flash** (stable, good performance)
- **gemini-1.5-pro** (most capable, slower)
- **gemini-1.5-flash** (fast, lightweight)

### Switching Providers
- Click **"API Configuration"**
- Toggle between **OpenAI** and **Google Gemini**
- Select a model from the dropdown
- Enter your API key for that provider
- All future analysis uses the selected provider

---

## Data Privacy & Security

- **No Data Storage**: Files are processed in-memory only; nothing is persisted to a database
- **API Key Safety**: API keys are never logged or transmitted except to the LLM provider
- **Client-Side Processing**: File parsing and visualization happen entirely in your browser
- **Secure Transmission**: All API calls use HTTPS

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling |
| **Recharts** | Interactive chart library |
| **Lucide React** | Icon library |
| **PapaParse** | CSV parsing |
| **XLSX** | Excel file parsing |
| **OpenAI SDK** | ChatGPT integration |
| **Google Generative AI** | Gemini integration |

---

## Dependencies

### Core Dependencies
```json
{
  "@supabase/supabase-js": "^2.57.4",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "recharts": "^2.12.7",
  "lucide-react": "^0.344.0",
  "papaparse": "^5.4.1",
  "xlsx": "^0.18.5",
  "openai": "^4.63.0",
  "@google/generative-ai": "^0.15.0"
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.5.3",
  "vite": "^5.4.2",
  "@vitejs/plugin-react": "^4.3.1",
  "tailwindcss": "^3.4.1",
  "eslint": "^9.9.1"
}
```

---

## API Rate Limits & Costs

### OpenAI
- **gpt-4o**: ~$0.015/1K input tokens, ~$0.06/1K output tokens
- **gpt-4-turbo**: ~$0.01/1K input tokens, ~$0.03/1K output tokens
- **gpt-3.5-turbo**: ~$0.50/1M input tokens, ~$1.50/1M output tokens

### Google Gemini
- **gemini-2.5-flash / 2.0-flash**: Free tier available; 2M free tokens/month
- **gemini-1.5-pro**: Same as 2.5-flash

Check [OpenAI Pricing](https://openai.com/pricing) and [Gemini Pricing](https://ai.google.dev/pricing) for latest rates.

---

## Troubleshooting

### Issue: "API Key Required" Error
**Solution**: Click **"API Configuration"**, select a provider, and enter your valid API key.

### Issue: Chart Not Appearing
**Solution**: Ensure the column contains numeric values. Non-numeric columns are skipped.

### Issue: Chat Not Responding
**Solution**:
- Verify API key is correct
- Check that a file is uploaded and displayed
- Ensure the LLM provider is correctly configured

### Issue: Large File Upload Fails
**Solution**: Browser file parsing is limited to ~10MB. For larger files, split into multiple CSVs.

---

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Roadmap

- [ ] Support for JSON and Parquet file formats
- [ ] Data filtering and transformation UI
- [ ] Custom chart styling options
- [ ] Export charts as PNG/SVG
- [ ] Batch analysis across multiple folders
- [ ] Advanced statistical tests (correlation, regression, ANOVA)
- [ ] Dark/light theme toggle
- [ ] Collaborative analysis sessions
- [ ] Database integration for persistent analysis history

---

## License

This project is open source and available under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Support & Feedback

Found a bug? Have a feature request?

- Open an issue on GitHub
- Check existing issues before creating a new one
- Include reproducible steps and expected behavior

---

## Acknowledgments

Built with modern web technologies and powered by cutting-edge LLMs from OpenAI and Google.

**Key Libraries**:
- [React](https://react.dev/) — UI framework
- [Recharts](https://recharts.org/) — Chart visualization
- [Vite](https://vitejs.dev/) — Fast build tool
- [Tailwind CSS](https://tailwindcss.com/) — Styling

---

**Made by Renan Hawladar**
