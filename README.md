# Finlytics AI — Quantitative Valuation & Qualitative Financial Report RAG

An institutional-grade investment research platform combining:
1. **Quantitative Valuation Engine & Principle Rules** (Django REST Framework + React 18 / Vite / Tailwind CSS)
2. **Qualitative Fundamental RAG Architecture for Indian Listed Companies** (MarketPing Remote MCP + Section-Aware Chunking + Embeddings + LLM Analysis)

<img width="1600" height="940" alt="Finlytics Valuation Dashboard" src="https://github.com/user-attachments/assets/010f245e-d263-4545-8bc6-00af45d6b157" />

---

## 🏗 Architecture Overview

```
HHG-challenge/
├── backend/                   # Quantitative Valuation, Principles & Auth Engine
│   ├── manage.py              # Django CLI
│   ├── finolitics_project/    # Core settings, WSGI/ASGI, unified URL routing
│   ├── api/                   # Valuation models, serializers, views, auth
│   │   ├── auth_views.py      # Google OAuth (GIS), Django credentials, groups
│   │   ├── models.py          # InvestmentPrinciple Django ORM model
│   │   ├── views.py           # Single-company analysis, interactive Q&A
│   │   ├── tests.py           # Automated unit test suite (16 tests)
│   │   └── services/          # Quantitative financial engines
│   │       ├── company_data.py         # Concurrent Yahoo Finance data extraction & caching
│   │       ├── financial_metrics.py    # 6 quantitative valuation modules & DCF engine
│   │       ├── investment_principles.py # Principle evaluation engine
│   │       └── ai_research.py          # Gemini 3.8 Flash Interactions API & fallback
│   └── requirements.txt
├── frontend/                  # Modern Financial Research Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── components/        # ValuationDashboard, ValuationMetricCard, ValuationTooltip, etc.
│   │   ├── pages/             # Dashboard.jsx, LoginPage.jsx
│   │   ├── services/          # api.js
│   │   └── utils/             # formatters.js (₹ Indian rupee, ratios, safe fallbacks)
│   ├── package.json
│   └── vite.config.js
├── companies/                 # [QUALITATIVE RAG] Company resolution & MarketPing ticker mapping
│   ├── models.py              # Company ORM model
│   ├── services.py            # Resolution service via MarketPing MCP
│   ├── views.py               # Company detail and lookup API
│   └── tests.py
├── documents/                 # [QUALITATIVE RAG] Discovery, ingestion, chunking, and embeddings
│   ├── models.py              # FinancialDocument, DocumentPage, DocumentChunk
│   ├── ingestion.py           # Content ingestion and text normalization
│   ├── chunking.py            # Section-aware chunking and vector indexing service
│   ├── views.py               # Ingestion, indexing, and chunk inspection APIs
│   └── tests.py
├── research/                  # [QUALITATIVE RAG] Evidence retrieval, LLM analysis, faithfulness
│   ├── services.py            # Hybrid dense + lexical evidence retrieval service
│   ├── prompts.py             # Version-controlled prompt (v1.0) & system rules
│   ├── analysis.py            # Grounded analysis orchestrator & citation validator
│   ├── evaluation.py          # Faithfulness and retrieval evaluation engine
│   ├── views.py               # Retrieve, Analyze, and Evaluate endpoints
│   └── tests.py
├── core/                      # [QUALITATIVE RAG] Infrastructure, MCP client, LLM providers
│   ├── integrations/          # MarketPing MCP client wrapper (read-only tools, retries)
│   ├── embeddings/            # Local (768-dim hashing), OpenAI, and Gemini embedding providers
│   ├── llm/                   # Gemini 3.8 Flash, OpenAI, and Mock LLM providers
│   └── views.py               # Health check and MCP status views
├── config/                    # Standalone qualitative Django configuration
├── docker-compose.yml         # Local PostgreSQL, pgweb, and pgAdmin 4 services
├── pytest.ini                 # Pytest test suite configuration
├── discovered_tools_schema.json
└── requirements.txt
```

---

## 🚀 Key Modules & Capabilities

### 1. Quantitative Valuation Dashboard
- **8 Earnings Valuation Multiples**:
  - **P/E** — Price-to-Earnings Ratio
  - **Forward P/E** — Forward Price-to-Earnings Ratio
  - **PEG** — Price/Earnings-to-Growth Ratio
  - **P/S** — Price-to-Sales Ratio
  - **P/B** — Price-to-Book Ratio
  - **EV/EBITDA** — Enterprise Value to EBITDA
  - **EV/EBIT** — Enterprise Value to EBIT
  - **EV/Sales** — Enterprise Value to Sales
- **Accessible Beginner-Friendly Tooltips (`ValuationTooltip.jsx`)**:
  - Info icons (`ℹ`) beside every metric with plain-English definitions, mathematical formulas, and practical interpretations.
  - Fully accessible via mouse hover, mobile tap, and keyboard navigation (`Tab` + `Enter`/`Space` + `Escape`).
  - Displays `"Not available"` when data is missing or calculations are invalid — never invents values.
  - Formatted in Indian Rupees (`₹`, Lakhs, Crores) for NSE/BSE tickers.
- **6 Expandable Modules with Independent Eye Icons (`👁`)**:
  1. **Earnings-Based Valuation**: 8 metric cards with tooltips and status badges.
  2. **Growth-Adjusted Valuation**: PEG Ratio, Rule of 40 (SaaS/Tech), Price-to-Free-Cash-Flow, and YoY growth.
  3. **Historical Valuation**: Statement multi-year trends and historical P/E trend comparison.
  4. **Relative / Sector Peer Benchmarking**: Sector and industry multiples benchmarking with discount/premium %.
  5. **Discounted Cash Flow (DCF)**: 5-year projected FCF, WACC (10.5%), terminal growth (3.0%), intrinsic per-share value vs. market price, and margin of safety. Marked safely as `"Not available"` with honest disclaimers when FCF is negative.
  6. **Valuation Quality & Solvency Risk**: Interest Coverage, Debt-to-Equity, FCF-to-Net-Income cash conversion, and Beta.

### 2. Qualitative Fundamental RAG Backend (MarketPing MCP)
- **Official MarketPing Remote MCP Integration**: Connects via the Python MCP SDK with strict read-only tool restrictions, exponential backoff retries, and rate-limit detection.
- **Section-Aware Financial Chunking**: Detects Indian corporate filing sections (MD&A, Auditor's Report, Balance Sheet, P&L, Notes to Financial Statements, Corporate Governance, BRSR, and Concall Transcripts) while preserving exact page number attribution.
- **Flexible Embeddings**:
  - `DeterministicLocalEmbeddingProvider`: Fast, 768-dimensional token & n-gram feature hashing for 100% offline development with zero API costs.
  - `OpenAIEmbeddingProvider` (`text-embedding-3-small`) & `GeminiEmbeddingProvider` (`text-embedding-004`).
- **Hybrid Evidence Retrieval**: Dense cosine similarity combined with lexical keyword boosts, strictly enforced company isolation, and document-type / fiscal-period filtering.
- **Three-Tier Epistemic Analysis**:
  - `reported_fact`: Audited numbers, balance sheet figures, contractual commitments.
  - `management_statement`: Leadership assertions, forward-looking guidance, executive claims.
  - `analytical_interpretation`: Objective financial reasoning connecting facts or evaluating statements.
- **Hallucination Prevention & Citation Verification**: Every claim cites specific chunk IDs with document titles and page ranges. Hallucinated chunk IDs are stripped and flagged.
- **Quantitative Evaluation Engine**: Evaluates retrieval relevance (hit rate, keyword coverage) and answer faithfulness (citation verification rate, supported claims ratio).
- **Prohibits Buy/Sell Recommendations**: Dedicated strictly to objective fundamental research.

### 3. Institutional Authentication & PostgreSQL Groups Gateway
- **Gatekeeper First**: Unauthenticated users see the **Institutional Authentication Gateway** before any valuation dashboards or analytics can be viewed.
- **Google OAuth**: Integrated with Google Identity Services (GIS) and backend verification (`google.oauth2.id_token`).
- **PostgreSQL Authorization Groups**:
  - Users are automatically provisioned in PostgreSQL and mapped to authorization groups (`user group_1`, `Investment Analysts`, `Administrators`).
  - Active group badge and username displayed prominently in the top navigation bar.

---

## ⚡ Quick Start

### 1. Prerequisites
- **Python**: 3.11 – 3.14
- **Node.js**: 18+
- **PostgreSQL**: 16+

### 2. Database Setup (PostgreSQL)
Ensure your local PostgreSQL service is running and create the `finolitics` database:
```bash
createdb finolitics
```
*(Or use Docker: `docker compose up -d`)*

### 3. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) to access the dashboard.

---

## ⚙️ Configuration (`.env`)

Create a `.env` file in the project root:

```env
# Django Settings
DEBUG=True
SECRET_KEY=your-secure-django-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1,*

# Database Configuration (PostgreSQL)
DB_ENGINE=django.db.backends.postgresql
DB_NAME=finolitics
DB_USER=postgres
DB_PASSWORD=your_postgres_password
DB_HOST=127.0.0.1
DB_PORT=5432
DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/finolitics

# Google OAuth Authentication
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com

# MarketPing Remote MCP for Indian Listed Filings
MARKETPING_MCP_URL=https://mcp.marketping.in/mcp

# Embedding Provider Configuration
# Options: "local" (deterministic offline hashing - default), "openai", or "gemini"
EMBEDDING_PROVIDER=local

# Google Gemini API & Interactions API
GEMINI_API_KEY=your_gemini_api_key
GEMINI_LLM_MODEL=gemini-3.8-flash

# OpenAI API (Optional)
OPENAI_API_KEY=your_openai_api_key
OPENAI_LLM_MODEL=gpt-4o-mini
```

---

## 🔌 Unified API Reference

### 1. Quantitative Valuation & Authentication Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | System status, database health, and active modules check |
| `POST` | `/api/analyze` | Full single-company analysis (multiples, DCF, principles, thesis) |
| `POST` | `/api/ask` | Interactive Q&A on company context with Gemini 3.8 Flash & fallback |
| `GET` | `/api/principles` | List all institutional investment principles |
| `PUT` | `/api/principles/<id>` | Update threshold for a principle |
| `GET` | `/api/company/<ticker>` | Fetch normalized company profile and financial statements |
| `POST` | `/api/auth/login` | Django credentials login with group serialization |
| `POST` | `/api/auth/oauth` | Google/GitHub OAuth authentication & group auto-mapping |
| `GET` | `/api/auth/me` | Current authenticated session profile & permissions |
| `POST` | `/api/auth/logout` | Invalidate active Django session |
| `GET` | `/api/auth/groups` | List PostgreSQL authorization groups and members |
| `GET` | `/api/auth/users` | List registered Django users and assigned groups |
| `GET` | `/admin/` | Django Administration portal |

### 2. Qualitative RAG & MarketPing MCP Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/core/health/` | Service health and PostgreSQL connectivity check |
| `GET` | `/api/core/integrations/marketping/status/` | MarketPing MCP connection status & permitted read-only tools |
| `GET` | `/api/companies/<ticker>/` | Resolve and save an Indian listed company |
| `GET` | `/api/companies/<ticker>/documents/available/` | Discover verified Annual Reports, Results, and Transcripts |
| `POST` | `/api/companies/<ticker>/documents/<id>/ingest/` | Ingest report pages with text normalization & SHA-256 deduplication |
| `GET` | `/api/companies/<ticker>/documents/<id>/pages/` | Inspect ingested pages with exact page attribution |
| `POST` | `/api/documents/<id>/index/` | Section-aware chunking, embeddings computation, and idempotent indexing |
| `GET` | `/api/documents/<id>/chunks/` | Inspect generated chunks with section headings and page spans |
| `POST` | `/api/research/retrieve/` | Ranked evidence retrieval with lexical boost and citations |
| `POST` | `/api/research/analyze/` | Grounded fundamental analysis categorized into facts, statements & interpretations |
| `POST` | `/api/research/evaluate/` | Retrieval hit rate, keyword coverage, and citation faithfulness evaluation |
| `GET` | `/api/docs/` | Interactive OpenAPI 3 / Swagger UI |
| `GET` | `/api/redoc/` | ReDoc Documentation |

---

## 🧪 Automated Test Suite

The platform includes **71 automated tests** covering quantitative valuation, edge cases, authentication, and qualitative RAG pipelines:

### 1. Run Quantitative Valuation & Auth Tests
```bash
cd backend
python manage.py test api
```
*16 tests passing (0.490s)*

### 2. Run Qualitative RAG & Resilience Tests
```bash
pytest
```
*55 tests passing across `companies`, `documents`, `research`, and `core` (100% pass rate).*

---

## 📄 License & Disclaimer

This platform is developed strictly for fundamental research and educational purposes. It does not provide buy, sell, or hold financial recommendations.
