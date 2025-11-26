import pandas as pd
import hashlib
import json
from sqlalchemy.orm import Session
from sqlalchemy.dialects.postgresql import insert
from .. import models
from .adapters import DataSourceAdapter, LocalExcelAdapter
from datetime import datetime

def generate_surrogate_key(row) -> str:
    # Natural Key: Office + Client + Project + CloseDate
    # Handle NaNs by converting to string "None" or empty
    office = str(row.get('Office', '') or '')
    client = str(row.get('Client', '') or '')
    project = str(row.get('Project', '') or '')
    
    close_date = row.get('Close Date')
    if pd.isna(close_date):
        c_date = "Unknown"
    else:
        c_date = str(close_date)
        
    raw_key = f"{office}|{client}|{project}|{c_date}"
    return hashlib.md5(raw_key.encode()).hexdigest()

def validate_and_clean(df: pd.DataFrame) -> pd.DataFrame:
    # 1. Date Parsing
    date_cols = ['Close Date', 'AP Date', 'MY Date', 'JN Date', 'JL Date', 'AG Date', 'SP Date', 'OC Date', 'NV Date', 'DC Date', 'JA Date', 'FB Date', 'MR Date']
    for col in date_cols:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')

    # 2. Numeric Casting
    numeric_cols = ['Amount in USD', 'Value', 'Winning %', 'Profit %', 'Q1', 'Q2', 'Q3', 'Q4']
    for col in numeric_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    # 3. String Normalization
    str_cols = ['Project Status', 'Region Type', 'Territory', 'Biz PoC']
    for col in str_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip()
            
    return df

def upsert_data(db: Session, adapter: DataSourceAdapter):
    print("Fetching data from source...")
    df = adapter.fetch_data()
    
    print("Validating and cleaning data...")
    df = validate_and_clean(df)
    
    print("Generating keys and deduplicating...")
    # Generate keys
    df['surrogate_key'] = df.apply(generate_surrogate_key, axis=1)
    
    # Deduplicate: Keep last row for each surrogate_key
    initial_count = len(df)
    df = df.drop_duplicates(subset=['surrogate_key'], keep='last')
    dedup_count = len(df)
    print(f"Deduplicated: {initial_count} -> {dedup_count} rows")
    
    print("Clearing existing data (Full Load)...")
    db.query(models.Business).delete()
    
    print("Preparing bulk insert...")
    objects = []
    for _, row in df.iterrows():
        # Extract FY Data
        fy_data = row.to_dict()
        # Clean for JSON
        clean_fy = {}
        for k, v in fy_data.items():
            if isinstance(v, pd.Timestamp):
                clean_fy[k] = v.isoformat()
            elif pd.isna(v):
                clean_fy[k] = None
            else:
                clean_fy[k] = v
                
        business_obj = models.Business(
            surrogate_key=row['surrogate_key'],
            office=row.get('Office'),
            client_name=row.get('Client'),
            project_name=row.get('Project'),
            close_date=row.get('Close Date') if pd.notna(row.get('Close Date')) else None,
            
            region_type=row.get('Region Type'),
            territory=row.get('Territory'),
            biz_poc=row.get('Biz PoC'),
            project_status=row.get('Project Status'),
            bidding=bool(row.get('Bidding')) if pd.notna(row.get('Bidding')) else False,
            winning_percent=row.get('Winning %'),
            value=row.get('Value'),
            profit_percent=row.get('Profit %'),
            currency=row.get('Currency'),
            amount_usd=row.get('Amount in USD'),
            
            q1=row.get('Q1', 0),
            q2=row.get('Q2', 0),
            q3=row.get('Q3', 0),
            q4=row.get('Q4', 0),
            
            fy_data=clean_fy
        )
        objects.append(business_obj)
        
    print(f"Inserting {len(objects)} rows...")
    db.bulk_save_objects(objects)
    db.commit()
    print("Ingestion complete.")

def run_ingestion():
    from .. import database
    
    file_path = r"c:\Users\richardjoel.d\.gemini\antigravity\playground\prime-bohr\Master Sheets - Dashboard Data.xlsx"
    adapter = LocalExcelAdapter(file_path)
    
    db = database.SessionLocal()
    try:
        upsert_data(db, adapter)
    finally:
        db.close()
