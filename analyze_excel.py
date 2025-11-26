import pandas as pd
import os

file_path = r"c:\Users\richardjoel.d\.gemini\antigravity\playground\prime-bohr\Master Sheets - Dashboard Data.xlsx"

try:
    # Read all sheets to understand the structure
    xls = pd.ExcelFile(file_path)
    print(f"Sheets found: {xls.sheet_names}")

    for sheet_name in xls.sheet_names:
        print(f"\n--- Analyzing Sheet: {sheet_name} ---")
        df = pd.read_excel(file_path, sheet_name=sheet_name, nrows=5) # Read first 5 rows
        print("Columns:")
        for col in df.columns:
            print(f"  - {col}")
        
        print("\n--- Sample Data for Natural Key & Measures ---")
        key_cols = ['Office', 'Client', 'Project', 'Close Date', 'Amount in USD', 'Project Status', 'Winning %', 'Value', 'Bidding']
        # Check if columns exist
        existing_cols = [c for c in key_cols if c in df.columns]
        print(df[existing_cols].head(5).to_dict(orient='records'))
        
except Exception as e:
    print(f"Error reading Excel file: {e}")
