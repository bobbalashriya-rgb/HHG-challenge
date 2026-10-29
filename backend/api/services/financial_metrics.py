import logging
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from .company_data import NormalizedCompanyData

logger = logging.getLogger(__name__)

# ---------------------------------------------------------
# Output Models
# ---------------------------------------------------------

class HistoricalMetric(BaseModel):
    date: str
    revenue: Optional[float]
    net_profit: Optional[float]
    operating_margin: Optional[float]

class CalculatedMetrics(BaseModel):
    revenue: Optional[float] = None
    revenue_growth: Optional[float] = None
    net_profit: Optional[float] = None
    profit_growth: Optional[float] = None
    roe: Optional[float] = None
    roce: Optional[float] = None
    debt_to_equity: Optional[float] = None
    operating_margin: Optional[float] = None
    free_cash_flow: Optional[float] = None
    pe_ratio: Optional[float] = None

class FinancialMetricsResult(BaseModel):
    metrics: CalculatedMetrics
    historical_data: List[HistoricalMetric]

# ---------------------------------------------------------
# Service Implementation
# ---------------------------------------------------------

def _get_val(data_dict: Dict[str, Any], date_key: str, possible_keys: List[str]) -> Optional[float]:
    """
    Helper to extract a metric from a specific date's dictionary using possible key variations.
    Returns None if the data is unavailable or cannot be parsed.
    """
    if not data_dict or date_key not in data_dict:
        return None
        
    period_data = data_dict[date_key]
    for key in possible_keys:
        if key in period_data and period_data[key] is not None:
            try:
                return float(period_data[key])
            except (ValueError, TypeError):
                pass
    return None

def calculate_metrics(data: NormalizedCompanyData) -> FinancialMetricsResult:
    """
    Calculates derived financial metrics strictly using raw data retrieved from yfinance.
    Missing inputs result in null/None values rather than fabricated estimates.
    """
    logger.info(f"Calculating metrics for {data.profile.ticker}")
    
    inc_stmt = data.financials.income_statement
    bal_sheet = data.financials.balance_sheet
    cash_flw = data.financials.cash_flow

    # yfinance dates are dictionary keys (e.g., '2023-12-31'). 
    # Sort descending to find the most recent period for current metrics.
    dates_desc = sorted(list(inc_stmt.keys()), reverse=True)
    
    if not dates_desc:
        logger.warning(f"No income statement dates found for {data.profile.ticker}. Cannot calculate metrics.")
        return FinancialMetricsResult(metrics=CalculatedMetrics(), historical_data=[])

    recent_date = dates_desc[0]
    prev_date = dates_desc[1] if len(dates_desc) > 1 else None

    # --- 1. Source Data Extraction (Most Recent Period) ---
    
    # Income Statement Items
    revenue = _get_val(inc_stmt, recent_date, ['Total Revenue', 'Operating Revenue'])
    prev_revenue = _get_val(inc_stmt, prev_date, ['Total Revenue', 'Operating Revenue']) if prev_date else None
    
    net_profit = _get_val(inc_stmt, recent_date, ['Net Income', 'Net Income Common Stockholders'])
    prev_net_profit = _get_val(inc_stmt, prev_date, ['Net Income', 'Net Income Common Stockholders']) if prev_date else None
    
    ebit = _get_val(inc_stmt, recent_date, ['EBIT', 'Operating Income'])
    operating_income = _get_val(inc_stmt, recent_date, ['Operating Income', 'EBIT'])

    # Balance Sheet Items
    equity = _get_val(bal_sheet, recent_date, ['Stockholders Equity', 'Total Stockholder Equity'])
    total_assets = _get_val(bal_sheet, recent_date, ['Total Assets'])
    current_liab = _get_val(bal_sheet, recent_date, ['Current Liabilities', 'Total Current Liabilities'])
    total_debt = _get_val(bal_sheet, recent_date, ['Total Debt'])

    # Cash Flow Items
    ocf = _get_val(cash_flw, recent_date, ['Operating Cash Flow', 'Cash Flow From Continuing Operating Activities'])
    capex = _get_val(cash_flw, recent_date, ['Capital Expenditure'])

    # --- 2. Derived Calculations ---
    
    # Growth Metrics (Avoid division by zero)
    revenue_growth = None
    if revenue is not None and prev_revenue:
        revenue_growth = (revenue - prev_revenue) / abs(prev_revenue)
        
    profit_growth = None
    if net_profit is not None and prev_net_profit:
        profit_growth = (net_profit - prev_net_profit) / abs(prev_net_profit)

    # Return on Equity (ROE) = Net Profit / Equity
    roe = None
    if net_profit is not None and equity:
        roe = net_profit / equity
        
    # Return on Capital Employed (ROCE) = EBIT / (Total Assets - Current Liabilities)
    roce = None
    if ebit is not None and total_assets is not None and current_liab is not None:
        capital_employed = total_assets - current_liab
        if capital_employed != 0:
            roce = ebit / capital_employed
            
    # Debt to Equity = Total Debt / Equity
    debt_to_equity = None
    if total_debt is not None and equity:
        debt_to_equity = total_debt / equity
        
    # Operating Margin = Operating Income / Revenue
    operating_margin = None
    if operating_income is not None and revenue:
        operating_margin = operating_income / revenue

    # Free Cash Flow = Operating Cash Flow - abs(Capital Expenditure)
    free_cash_flow = None
    if ocf is not None and capex is not None:
        free_cash_flow = ocf - abs(capex)

    # Price to Earnings (P/E) Ratio = Market Cap / Net Profit
    pe_ratio = None
    market_cap = data.profile.market_cap
    if market_cap is not None and net_profit:
        pe_ratio = market_cap / net_profit

    # Compile current metrics
    metrics = CalculatedMetrics(
        revenue=revenue,
        revenue_growth=revenue_growth,
        net_profit=net_profit,
        profit_growth=profit_growth,
        roe=roe,
        roce=roce,
        debt_to_equity=debt_to_equity,
        operating_margin=operating_margin,
        free_cash_flow=free_cash_flow,
        pe_ratio=pe_ratio
    )

    # --- 3. Historical Datasets (for charting) ---
    historical_data = []
    
    # Sort ascending for chronological chart plotting
    for d in sorted(dates_desc):
        hist_rev = _get_val(inc_stmt, d, ['Total Revenue', 'Operating Revenue'])
        hist_np = _get_val(inc_stmt, d, ['Net Income', 'Net Income Common Stockholders'])
        hist_op_inc = _get_val(inc_stmt, d, ['Operating Income', 'EBIT'])
        
        hist_op_margin = None
        if hist_op_inc is not None and hist_rev:
            hist_op_margin = hist_op_inc / hist_rev
            
        historical_data.append(HistoricalMetric(
            date=d,
            revenue=hist_rev,
            net_profit=hist_np,
            operating_margin=hist_op_margin
        ))

    logger.info(f"Successfully calculated metrics for {data.profile.ticker}")
    return FinancialMetricsResult(
        metrics=metrics,
        historical_data=historical_data
    )

