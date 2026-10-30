# Financial Report RAG & Quantitative Valuation Platform for Indian Listed Companies

A unified institutional-grade investment research platform for quantitative valuation and qualitative fundamental analysis of Indian listed companies using financial reports (Annual Reports, Quarterly Results, and Earnings Call Transcripts) retrieved through **MarketPing MCP** and analyzed via an evidence-grounded Retrieval-Augmented Generation (RAG) architecture.

<img width="1600" height="940" alt="Finlytics Valuation Dashboard" src="https://github.com/user-attachments/assets/010f245e-d263-4545-8bc6-00af45d6b157" />

---

## 1. Architectural Highlights

- **Single Modular Django Backend**: Classical Django architecture with modular business applications (`companies`, `documents`, `research`, `core`, and `api`), without microservice complexity.
- **Official MarketPing Remote MCP Integration**: Connects via the official Python MCP SDK with strict read-only tool restrictions, exponential backoff retries, and rate-limit detection.
- **Section-Aware Financial Chunking**: Detects Indian corporate filing sections (MD&A, Auditor's Report, Balance Sheet, P&L, Notes to Financial Statements, Corporate Governance, BRSR, and Earnings Call Q&As) while preserving exact page number attribution.
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
- **Comprehensive Quantitative Valuation Engine**:
  - 8 core earnings multiples (P/E, Forward P/E, PEG, P/S, P/B, EV/EBITDA, EV/EBIT, EV/Sales) with accessible educational tooltips, formulas, and interpretations.
  - 6 collapsible modules: Earnings Valuation, Growth-Adjusted Valuation (Rule of 40), Historical Valuation, Relative Peer Benchmarking, DCF Model with Margin of Safety, and Valuation Quality & Risk.
- **Institutional Authentication & Access Control**: Gatekeeper authentication required before analytics access; supports Google Identity Services (OAuth) and Django user accounts mapped to PostgreSQL authorization groups (`user group_1`, `Investment Analysts`, `Administrators`).

---

## 2. Directory Structure

```
StockQualitativeAnalysis / Finlytics AI
├── companies/                 # Company resolution, ticker mapping, and persistence
│   ├── models.py              # Company model
│   ├── services.py            # Resolution service via MarketPing MCP
│   ├── views.py               # Company detail and lookup API
│   └── tests.py               # Company resolution test cases
├── documents/                 # Report discovery, ingestion, chunking, and embedding
│   ├── models.py              # FinancialDocument, DocumentPage, DocumentChunk
│   ├── ingestion.py           # Content ingestion and text normalization
│   ├── chunking.py            # Section-aware chunking and indexing service
│   ├── views.py               # Ingestion, indexing, and chunk inspection APIs
│   ├── test_chunking.py       # Section heading & chunk boundary tests
│   ├── test_ingestion.py      # Page extraction and normalization tests
│   └── test_resilience.py     # Fault-tolerant document tests
├── research/                  # Evidence retrieval, LLM analysis, and evaluation
│   ├── services.py            # Hybrid evidence retrieval service
│   ├── prompts.py             # Version-controlled prompt (v1.0) & system rules
│   ├── analysis.py            # Grounded analysis orchestrator & citation validator
│   ├── evaluation.py          # Faithfulness and retrieval evaluation engine
│   ├── views.py               # Retrieve, Analyze, and Evaluate endpoints
│   ├── test_evaluation.py     # Faithfulness scoring & hallucination detection tests
│   └── tests.py               # Retrieval ranking & company isolation tests
├── core/                      # Shared infrastructure, MCP client, and LLM providers
│   ├── integrations/          # MarketPing MCP client wrapper and adapter
│   ├── embeddings/            # Local, OpenAI, and Gemini embedding providers
│   ├── llm/                   # Gemini 3.8 Flash, OpenAI, and Mock LLM providers
│   ├── test_integrations.py   # MCP tool whitelisting and protocol tests
│   └── test_resilience.py     # Rate limit & connection error tests
├── backend/                   # Quantitative Valuation, Principle Rules & Auth Engine
│   ├── finolitics_project/    # Core Django settings, WSGI/ASGI, unified URL routing
│   ├── api/                   # Valuation models, serializers, views, auth
│   │   ├── auth_views.py      # Google OAuth (GIS), Django credentials, groups
│   │   ├── models.py          # InvestmentPrinciple Django ORM model
│   │   ├── views.py           # Single-company analysis, interactive Q&A
│   │   ├── tests.py           # Automated quantitative test suite (16 tests)
│   │   └── services/          # Pure Python financial engines
│   │       ├── company_data.py         # Concurrent Yahoo Finance data extraction & caching
│   │       ├── financial_metrics.py    # 6 quantitative valuation modules & DCF engine
│   │       ├── investment_principles.py # Principle evaluation engine
│   │       └── ai_research.py          # Gemini 3.8 Flash Interactions API & context fallback
│   └── requirements.txt
├── frontend/                  # React 18 + Vite + Tailwind CSS Dashboard
│   ├── src/
│   │   ├── components/        # ValuationDashboard, ValuationMetricCard, ValuationTooltip, etc.
│   │   ├── pages/             # Dashboard.jsx, LoginPage.jsx
│   │   ├── services/          # api.js (unified quantitative, qualitative & auth calls)
│   │   └── utils/             # formatters.js (₹ Indian rupee, ratios, safe fallbacks)
│   ├── package.json
│   └── vite.config.js
├── config/                    # Django project settings, ASGI/WSGI, and root URLs
├── docker-compose.yml         # PostgreSQL & pgAdmin services
├── pytest.ini                 # Pytest test configuration
├── requirements.txt           # Project dependencies
└── README.md                  # System documentation
```

---

## 3. Prerequisites & Installation

### Requirements
- **Python**: 3.11 – 3.14
- **Node.js**: 18+
- **PostgreSQL**: 16+
- **Virtual Environment Tool**: `venv`

### Step 1: Clone and Create Virtual Environment

```bash
git clone https://github.com/bobbalashriya-rgb/HHG-challenge.git
cd HHG-challenge

# Create virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate    # On Windows: .\backend\venv\Scripts\activate
```

### Step 2: Install Backend Dependencies

```bash
pip install -r backend/requirements.txt
```

### Step 3: Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## 4. Configuration (`.env`)

Create a `.env` file in the project root (see `.env.example`):

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
DATABASE_URL=postgresql://postgres:your_postgres_password@127.0.0.1:5432/finolitics

# MarketPing Remote MCP
MARKETPING_MCP_URL=https://mcp.marketping.in/mcp

# Embedding Provider Configuration
# Options: "local" (default offline hashing), "openai", or "gemini"
EMBEDDING_PROVIDER=local

# LLM Provider Configuration
# Options: "gemini" (default if key present), "openai", or "mock" (offline fallback)
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_LLM_MODEL=gemini-3.8-flash

# OpenAI Settings (required only if LLM_PROVIDER=openai or EMBEDDING_PROVIDER=openai)
OPENAI_API_KEY=your_openai_api_key
OPENAI_LLM_MODEL=gpt-4o-mini

# Google OAuth Authentication
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

---

## 5. Database Setup & Migrations

Ensure PostgreSQL is running and database `finolitics` exists:

```bash
createdb finolitics
```

Run database migrations:

```bash
cd backend
python manage.py migrate

# (Optional) Verify system configuration
python manage.py check
```

---

## 6. Running the Application

### 1. Start Django Backend Server

```bash
cd backend
python manage.py runserver 0.0.0.0:8000
```

- API Base: `http://127.0.0.1:8000/api/`
- Interactive Swagger UI: `http://127.0.0.1:8000/api/docs/`
- ReDoc Documentation: `http://127.0.0.1:8000/api/redoc/`

### 2. Start React Frontend Dashboard

```bash
cd frontend
npm run dev
```

- Web Application: `http://localhost:5173/`

---

## 7. API Reference & Postman Workflows

### Phase 1: System Health

- **`GET /api/core/health/`** (or `GET /api/health/`)
  - Verifies application and PostgreSQL database connectivity.
  - Response:
    ```json
    {
      "status": "ok",
      "service": "financial-research-api",
      "database": "healthy"
    }
    ```

### Phase 2: MarketPing Connection Status

- **`GET /api/core/integrations/marketping/status/`**
  - Verifies MCP connection and lists discoverable read-only tools.
- **`GET /api/core/integrations/marketping/tools/`**
  - Lists permitted read-only tools and JSON schemas.

### Phase 3: Company Resolution & Document Discovery

- **`GET /api/companies/{ticker}/`**
  - Resolves and saves an Indian listed company (e.g. `/api/companies/INFY/`).
- **`GET /api/companies/{ticker}/documents/available/`**
  - Discovers verified Annual Reports, Results, and Transcripts.
  - Query parameters: `?doc_type=annual_report&sync=true`

### Phase 4: Report Content Ingestion

- **`POST /api/companies/{ticker}/documents/{document_id}/ingest/`**
  - Ingests report pages with text normalization and SHA-256 deduplication.
  - Payload:
    ```json
    {
      "page_from": 1,
      "page_to": 24,
      "max_pages": 24
    }
    ```
- **`GET /api/companies/{ticker}/documents/{document_id}/pages/`**
  - Inspects ingested pages with exact page numbering and character counts.

### Phase 5: Document Chunking & Vector Indexing

- **`POST /api/documents/{document_id}/index/`**
  - Chunks stored pages by section boundaries, computes embeddings, and saves chunks idempotently.
  - Payload:
    ```json
    {
      "force_reindex": false,
      "target_chunk_chars": 1000,
      "overlap_chars": 150
    }
    ```
- **`GET /api/documents/{document_id}/chunks/`**
  - Inspects generated chunks with section headings, page spans, and metadata.

### Phase 6: Evidence Retrieval API

- **`POST /api/research/retrieve/`** *(or GET with query params)*
  - Retrieves ranked, deduplicated evidence passages with citations.
  - Payload:
    ```json
    {
      "ticker": "INFY",
      "question": "What are the major risks to revenue growth and margins?",
      "document_types": ["annual_report"],
      "top_k": 5,
      "min_score": 0.15
    }
    ```

### Phase 7: Qualitative Fundamental Analysis API

- **`POST /api/research/analyze/`** *(or GET with query params)*
  - Generates evidence-grounded fundamental analysis with citations.
  - Payload:
    ```json
    {
      "ticker": "INFY",
      "question": "What are the company's main competitive advantages and long-term risks?",
      "document_types": ["annual_report"],
      "top_k": 8
    }
    ```
  - Response includes:
    - `executive_summary`
    - `key_findings` (categorized into `reported_fact`, `management_statement`, `analytical_interpretation`)
    - `citations` (verified chunk IDs, document titles, page spans)
    - `risks_and_uncertainties`
    - `missing_information_and_limitations`
    - `metrics` (retrieval time, LLM time, total execution time)

### Phase 8: RAG Evaluation & Faithfulness API

- **`POST /api/research/evaluate/`** *(or GET with query params)*
  - Executes retrieval, analysis, and formal quantitative evaluation in a single call.
  - Payload:
    ```json
    {
      "ticker": "INFY",
      "question": "What are the major risks to revenue growth?",
      "top_k": 5
    }
    ```
  - Response includes:
    - Full `analysis`
    - `evaluation`:
      - `overall_quality_score` (0.0 to 1.0)
      - `retrieval_metrics` (`retrieval_hit_rate`, `mean_relevance_score`, `keyword_coverage_ratio`)
      - `faithfulness_metrics` (`citation_verification_rate`, `supported_claims_ratio`, `hallucinated_citations_count`, `limitations_disclosed`)

### Phase 9: Quantitative Valuation & Authentication API

- **`POST /api/analyze`**
  - Executes real-time financial statements analysis, computing all 6 valuation modules, 8 earnings multiples, DCF model, and principle checks.
  - Payload: `{"ticker": "TCS.NS"}`
- **`POST /api/ask`**
  - Interactive financial context Q&A powered by Google Gemini 3.8 Flash with deterministic financial context fallback.
  - Payload: `{"question": "Why did the company fail my valuation principle?", "context": {...}}`
- **`GET /api/principles`** & **`PUT /api/principles/{id}`**
  - Retrieve and dynamically update mathematical investment principle thresholds.
- **`POST /api/auth/login`** & **`POST /api/auth/oauth`**
  - Authenticate Django credentials or Google OAuth and receive session and assigned groups (`user group_1`, `Investment Analysts`).
- **`GET /api/auth/groups`** & **`GET /api/auth/users`**
  - List PostgreSQL Django groups, membership counts, and user roles.

---

## 8. Automated Test Suite

All tests can be executed offline using pytest and Django test runners:

### Run Complete Qualitative RAG Suite

```bash
pytest
```

### Test Suite Structure
- `companies/tests.py`: Company resolution, persistence, and error handling.
- `documents/tests.py` & `documents/test_ingestion.py`: Metadata discovery, page retrieval, and text normalization.
- `documents/test_chunking.py` & `documents/test_resilience.py`: Section-aware chunking, giant page wrapping, empty page skipping, and indexing idempotency.
- `core/test_integrations.py` & `core/test_resilience.py`: MarketPing tool whitelisting, timeouts, connection errors, and HTTP 429 rate limits.
- `research/tests.py`: Evidence retrieval, company filter isolation, and qualitative analysis.
- `research/test_evaluation.py`: Faithfulness scoring, hallucinated citation detection, and evaluation endpoint verification.

**Qualitative Test Status**: **55 passed in 6.96s** (100% pass rate).

### Run Quantitative Valuation & Auth Test Suite

```bash
cd backend
python manage.py test api
```

**Quantitative Test Status**: **16 passed in 0.490s** (100% pass rate).

**Combined Total Coverage**: **71 automated unit & integration tests**.

---

## 9. Regulatory Disclaimer

This system is strictly designed for fundamental investment research and educational purposes. It prohibits and does not generate buy, sell, or hold financial recommendations.
