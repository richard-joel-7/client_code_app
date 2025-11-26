import pandas as pd
import json
import os
from sqlalchemy.orm import Session
from app import models, database

# Setup DB connection
SessionLocal = database.SessionLocal

def import_data():
    file_path = r"c:\Users\richardjoel.d\.gemini\antigravity\playground\prime-bohr\Master Sheets - Dashboard Data.xlsx"
    
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return

    print("Reading Excel file...")
    try:
        df = pd.read_excel(file_path, sheet_name="Biz")
    except Exception as e:
        print(f"Error reading sheet 'Biz': {e}")
        return

    db = SessionLocal()
    
    # Clear existing data? Or just append? For this demo, let's clear to avoid duplicates on re-run
    print("Clearing existing Business Data...")
    db.query(models.BusinessData).delete()
    db.commit()

    print("Importing rows...")
    count = 0
    for _, row in df.iterrows():
        # Extract core fields
        # Handle NaN values safely
        def get_val(col):
            val = row.get(col)
            if pd.isna(val):
                return None
            return val

        # Extract FY/Quarterly data
        # All columns after "Amount in USD" seem to be time-series data
        # We'll capture everything that is NOT in the core list
        core_cols = [
            'Office', 'Region Type', 'Territory', 'Biz PoC', 'Client', 'Project', 
            'Project Status', 'Bidding', 'Winning %', 'Value', 'Close Date', 
            'Profit %', 'Currency', 'Amount in USD'
        ]
        
        fy_data = {}
        for col in df.columns:
            if col not in core_cols:
                val = get_val(col)
                if val is not None:
                    # Convert timestamps to string if needed
                    if isinstance(val, pd.Timestamp):
                        val = val.isoformat()
                    fy_data[col] = val
        
        business_entry = models.BusinessData(
            office=get_val('Office'),
            region=get_val('Region Type'),
            territory=get_val('Territory'),
            biz_poc=get_val('Biz PoC'),
            client_name=get_val('Client'),
            project_name=get_val('Project'),
            project_status=get_val('Project Status'),
            bidding=get_val('Bidding'),
            winning_percent=get_val('Winning %'),
            value=get_val('Value'),
            close_date=get_val('Close Date'),
            profit_percent=get_val('Profit %'),
            currency=get_val('Currency'),
            amount_usd=get_val('Amount in USD'),
            fy_data=json.dumps(fy_data)
        )
        
        db.add(business_entry)
        count += 1

    db.commit()
    print(f"Successfully imported {count} rows.")
    db.close()

if __name__ == "__main__":
    # Ensure tables exist
    models.Base.metadata.create_all(bind=database.engine)
    import_data()
