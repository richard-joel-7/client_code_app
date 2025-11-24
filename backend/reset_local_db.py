import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import subprocess

# Load environment variables
load_dotenv()

# Get database URL
db_url = os.getenv("DATABASE_URL")

if not db_url:
    print("Error: DATABASE_URL not found in .env")
    exit(1)

print(f"Connecting to: {db_url}")

try:
    # We don't need to drop the table anymore, we just need to tell Alembic where we are.
    # The error "relation already exists" means the tables are there, but Alembic doesn't know.
    # We will 'stamp' the DB to the baseline revision (33a614ca3359), then upgrade.

    print("Stamping database to baseline (33a614ca3359)...")
    subprocess.run(["alembic", "stamp", "33a614ca3359"], check=True)
    
    print("Running alembic upgrade head...")
    subprocess.run(["alembic", "upgrade", "head"], check=True)
    print("Database sync complete!")

except Exception as e:
    print(f"An error occurred: {e}")
