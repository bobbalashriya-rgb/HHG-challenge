# Finlytics AI (HHG Challenge)

Institutional-grade investment research platform powered by **Django REST Framework (DRF)** and **React (Vite)**. Evaluates real financial statements from Yahoo Finance against institutional principles with complete calculation transparency, peer comparison, AI research theses, and an interactive company abbreviation directory.

---

## 🏗 Architecture Overview

```
HHG Challenge/
├── backend/                  # Django & Django REST Framework Service
│   ├── manage.py             # Django CLI
│   ├── finolitics_project/   # Core settings, routing, WSGI/ASGI
│   ├── api/                  # Application models, views, serializers
│   │   ├── models.py         # InvestmentPrinciple Django ORM model
│   │   ├── serializers.py    # Request/Response validators
│   │   ├── views.py          # APIView endpoints
│   │   ├── tests.py          # Automated test suite
│   │   └── services/         # Pure Python quantitative engines
│   │       ├── company_data.py
│   │       ├── financial_metrics.py
│   │       ├── investment_principles.py
│   │       └── ai_research.py
│   └── requirements.txt
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/       # MetricGrid, PrincipleEvaluations, CompanyDirectory, etc.
│   │   ├── data/             # companyDirectory.js (Yfinance abbreviation mappings)
│   │   ├── pages/            # Dashboard.jsx
│   │   └── services/         # api.js
│   ├── package.json
│   └── vite.config.js
└── wisprflow/                # Financial workflow service
```

---

## ⚡ Quick Start

### 1. Backend Setup (Django & PostgreSQL)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

# Ensure PostgreSQL is running and database exists:
# createdb finolitics (or docker compose up -d)

python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

The Django server will run at `http://127.0.0.1:8000/`. Default investment principles are automatically seeded into PostgreSQL on migration.

### 2. Frontend Setup (React)

In a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.

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



<img width="1600" height="940" alt="WhatsApp Image 2026-10-30 at 09 50 41" src="https://github.com/user-attachments/assets/010f245e-d263-4545-8bc6-00af45d6b157" />

