from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
import json
from datetime import datetime
from .. import database, models, auth

router = APIRouter(
    prefix="/api/business",
    tags=["business"],
    dependencies=[Depends(auth.get_current_ceo_user)]
)

@router.get("/analytics")
def get_business_analytics(db: Session = Depends(database.get_db)):
    """
    Returns aggregated analytics for the Business Dashboard matching Power BI depth.
    """
    data = db.query(models.Business).all()
    
    # Initialize Aggregates
    total_revenue = 0
    awarded_count = 0
    awarded_value = 0
    opportunity_value = 0
    near_win_value = 0
    potential_weighted_value = 0
    total_weighted_pipeline = 0
    
    # Regional & Client Data
    region_revenue = {}
    client_revenue = {}
    
    # Time Series Data (Monthly)
    monthly_revenue = {
        "FY24-25": {},
        "FY25-26": {}
    }
    
    # Quarterly Data
    quarterly_revenue = {"Q1": 0, "Q2": 0, "Q3": 0, "Q4": 0}

    # Helper to map month codes to full names/order
    month_map = {
        "AP": "Apr", "MY": "May", "JN": "Jun", "JL": "Jul", "AG": "Aug", "SP": "Sep",
        "OC": "Oct", "NV": "Nov", "DC": "Dec", "JA": "Jan", "FB": "Feb", "MR": "Mar"
    }
    
    # Helper to map month codes to Quarter
    quarter_map = {
        "AP": "Q1", "MY": "Q1", "JN": "Q1",
        "JL": "Q2", "AG": "Q2", "SP": "Q2",
        "OC": "Q3", "NV": "Q3", "DC": "Q3",
        "JA": "Q4", "FB": "Q4", "MR": "Q4"
    }

    awarded_statuses = ["Awarded", "Awd", "Awd FY24", "AWD FY24", "Awd FY24-25"]

    for row in data:
        amount = row.amount_usd or 0
        status = row.project_status or ""
        win_pct = row.winning_percent or 0
        
        # Normalize status for comparison
        status_norm = status.strip()
        
        # 1. KPI Calculations (Power BI Logic)
        
        # Total Amount (All Business)
        total_revenue += amount

        if status_norm in awarded_statuses:
            awarded_count += 1
            awarded_value += amount
            
            # Regional Split (Awarded only?) or All? Power BI usually shows breakdown of Total or Awarded.
            # Let's show breakdown of Total Revenue for now, or Awarded if specified.
            # Usually "Revenue by Region" implies Awarded/Won revenue.
            region = row.region_type or "Unknown"
            region_revenue[region] = region_revenue.get(region, 0) + amount
            
            client = row.client_name or "Unknown"
            client_revenue[client] = client_revenue.get(client, 0) + amount
            
        elif status_norm == "Opportunity":
            opportunity_value += amount
            
        elif status_norm == "Near Win":
            near_win_value += amount
            
        elif status_norm == "Potential":
            # Potential Weighted Value = Amount * Winning %
            weighted = amount * win_pct
            potential_weighted_value += weighted
            
        # Total Weighted Pipeline (for Potential %)
        # Assuming this includes Opportunity, Near Win, Potential?
        # Or just Potential? The formula was: Potential_Value_Business% = Potential_Weighted_Value / Total weighted pipeline
        # Let's assume Total Weighted Pipeline = Sum(Amount * Win%) for ALL pipeline stages (Opp, Near Win, Potential)
        if status_norm not in awarded_statuses and status_norm not in ["Lost", "Dropped"]:
             total_weighted_pipeline += (amount * win_pct)

        # 2. Quarterly Data Aggregation
        # Using explicit columns
        quarterly_revenue["Q1"] += row.q1 or 0
        quarterly_revenue["Q2"] += row.q2 or 0
        quarterly_revenue["Q3"] += row.q3 or 0
        quarterly_revenue["Q4"] += row.q4 or 0

        # 3. Time Series Aggregation (from JSON blob)
        if row.fy_data:
            try:
                # fy_data is already a dict in the model (JSON type), but if SQLite it might be string?
                # We defined it as JSON type in models.py, so SQLAlchemy handles it.
                # But let's be safe.
                fy_dict = row.fy_data
                if isinstance(fy_dict, str):
                    fy_dict = json.loads(fy_dict)
                
                if fy_dict:
                    for key, val in fy_dict.items():
                        if not isinstance(val, (int, float)):
                            continue
                        
                        clean_key = key.upper()
                        if clean_key in month_map:
                            month_name = month_map[clean_key]
                            monthly_revenue["FY25-26"][month_name] = monthly_revenue["FY25-26"].get(month_name, 0) + val
            except:
                pass

    # 3. Final Metrics
    potential_pct = (potential_weighted_value / total_weighted_pipeline * 100) if total_weighted_pipeline > 0 else 0
    
    # 4. Format Charts
    
    # Revenue Trend (Line Chart)
    month_order = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"]
    revenue_trend = []
    for m in month_order:
        revenue_trend.append({
            "name": m,
            "FY25-26": monthly_revenue["FY25-26"].get(m, 0),
        })

    return {
        "kpis": {
            "total_pipeline": total_revenue, # Wait, Total Amount Business = SUM(Amount). Is this Pipeline? Usually Total = Won + Pipeline + Lost.
            # Let's rename to match Power BI measure names
            "total_amount": total_revenue,
            "awarded_value": awarded_value,
            "awarded_count": awarded_count,
            "opportunity_value": opportunity_value,
            "near_win_value": near_win_value,
            "potential_weighted_value": potential_weighted_value,
            "potential_pct": round(potential_pct, 1),
            "last_refreshed": datetime.now().isoformat() # Mock for now, or get from DB
        },
        "charts": {
            "revenue_by_region": [{"name": k, "value": v} for k, v in region_revenue.items()],
            "revenue_by_client": [{"name": k, "value": v} for k, v in sorted(client_revenue.items(), key=lambda item: item[1], reverse=True)[:10]],
            "revenue_trend": revenue_trend,
            "quarterly_performance": [{"name": k, "value": v} for k, v in sorted(quarterly_revenue.items())],
            "funnel": [
                {"name": "Potential", "value": potential_weighted_value}, # Using weighted for funnel? Or raw? Usually raw count/value. Let's use Value.
                # Actually funnel usually: Potential -> Opportunity -> Near Win -> Awarded
                {"name": "Opportunity", "value": opportunity_value},
                {"name": "Near Win", "value": near_win_value},
                {"name": "Awarded", "value": awarded_value}
            ]
        }
    }
