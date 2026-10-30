# Finlytics AI — Quantitative Valuation & Qualitative Financial Report RAG

An institutional-grade investment research platform combining:
1. **Quantitative Valuation Engine & Principle Rules** (Django REST Framework + React/Vite/Tailwind)
2. **Qualitative Fundamental RAG Architecture for Indian Listed Companies** (MarketPing Remote MCP + Section-Aware Chunking + Embeddings + LLM Analysis)

---

## 🏗 Architecture Overview

```
HHG-challenge/
├── backend/                  # Quantitative Valuation & Auth Service
│   ├── manage.py             # Django CLI
│   ├── finolitics_project/   # Core settings, routing, WSGI/ASGI
│   ├── api/                  # Application models, views, serializers, auth
│   │   ├── auth_views.py     # Google OAuth, Django credentials, groups
│   │   ├── models.py         # InvestmentPrinciple Django ORM model
│   │   ├── views.py          # APIView endpoints
│   │   ├── tests.py          # Automated test suite
│   │   └── services/         # Pure Python quantitative engines
│   └── requirements.txt
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # ValuationDashboard, ValuationMetricCard, etc.
│   │   ├── pages/            # Dashboard.jsx, LoginPage.jsx
│   │   └── services/         # api.js
│   ├── package.json
│   └── vite.config.js
├── companies/                # Company resolution & ticker mapping (MarketPing MCP)
├── documents/                # Indian filing discovery, ingestion, chunking, embeddings
├── research/                 # Evidence retrieval, qualitative LLM analysis, faithfulness
├── core/                     # MarketPing MCP integration, embedding & LLM providers
├── config/                   # Qualitative backend Django configuration
├── docker-compose.yml        # PostgreSQL & pgAdmin services
└── discovered_tools_schema.json
```

---

## 🚀 Key Modules & Capabilities

### 1. Quantitative Valuation Dashboard
- **8 Earnings Valuation Multiples**: P/E, Forward P/E, PEG, P/S, P/B, EV/EBITDA, EV/EBIT, EV/Sales.
- **Accessible Beginner-Friendly Tooltips**: Educational popovers with formulas, units, and interpretation guidelines.
- **6 Expandable Modules with Independent Eye Icons**:
  1. Earnings-Based Valuation
  2. Growth-Adjusted Valuation (Rule of 40, P/FCF)
  3. Historical Valuation Trends
  4. Relative / Sector Peer Benchmarking
  5. Discounted Cash Flow (DCF) with Margin of Safety
  6. Valuation Quality & Solvency Risk
- **Institutional Authentication & Django Groups**: Google OAuth and Django user accounts mapped to `user group_1`, `Investment Analysts`, and `Administrators`.

### 2. Qualitative Fundamental RAG Backend (MarketPing MCP)
- **MarketPing Remote MCP Integration**: Connects via the official Python MCP SDK with strict read-only tool restrictions.
- **Section-Aware Chunking**: Detects Indian filing sections (MD&A, Auditor's Report, Balance Sheet, Notes, BRSR, Concall Transcripts) with exact page attribution.
- **Evidence Retrieval & Evaluation**: RAG faithfulness and retrieval hit rate scoring.

---

## ⚡ Quick Start

### 1. Database (PostgreSQL)
Ensure local PostgreSQL is running with database `finolitics`:
```bash
createdb finolitics
```

### 2. Backend Service
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

### 3. Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) to launch the platform.

---

## 🧪 Testing

### Backend Unit Tests
```bash
cd backend
python manage.py test api
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | API status & version check |
| `GET` | `/api/principles` | List all institutional investment principles |
| `PUT` | `/api/principles/<id>` | Update threshold for a principle |
| `GET` | `/api/company/<ticker>` | Fetch normalized Yfinance statements |
| `POST` | `/api/analyze` | Single company deep-dive analysis (`{"ticker": "AAPL"}`) |
| `POST` | `/api/ask` | Interactive Q&A on company financial context |
| `GET` | `/admin/` | Django Administration portal |
| `GET` | `/api/core/health/` | Qualitative RAG service health check |
| `GET` | `/api/docs/` | Interactive Swagger OpenAPI documentation |



<img width="1600" height="940" alt="WhatsApp Image 2026-10-30 at 09 50 41" src="https://github.com/user-attachments/assets/010f245e-d263-4545-8bc6-00af45d6b157" />
