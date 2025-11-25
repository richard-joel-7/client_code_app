import sqlalchemy
from sqlalchemy import create_engine, inspect, text

# URL from alembic.ini
DB_URL = "postgresql+psycopg2://postgres.qwuuumfcdhvjfvmivbix:postgres@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"

try:
    print(f"Connecting to Production DB...")
    engine = create_engine(DB_URL)
    inspector = inspect(engine)
    
    print("Checking 'master' table columns...")
    columns = [c['name'] for c in inspector.get_columns('master')]
    
    if 'creation_mode' in columns:
        print("SUCCESS: 'creation_mode' column exists!")
    else:
        print("FAILURE: 'creation_mode' column is MISSING!")
        print(f"Existing columns: {columns}")

except Exception as e:
    print(f"Connection failed: {e}")
