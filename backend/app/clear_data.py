from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app import models
from sqlalchemy import text

def clear_data():
    db = SessionLocal()
    try:
        # Disable foreign key checks temporarily to allow truncation in any order (if needed, but delete is safer)
        # But we can just delete in order: Master -> Projects/Clients?
        # Master has FK to nothing? 
        # Actually, let's check models.
        # Master doesn't seem to have FKs defined in the models provided in previous turns (no ForeignKey usage shown in models.py snippet, just columns).
        # But logically:
        # Master depends on nothing?
        # Projects depends on nothing?
        # Clients depends on nothing?
        
        # Let's just delete all.
        num_master = db.query(models.Master).delete()
        num_projects = db.query(models.Project).delete()
        num_clients = db.query(models.Client).delete()
        
        db.commit()
        print(f"Deleted {num_master} rows from Master.")
        print(f"Deleted {num_projects} rows from Projects.")
        print(f"Deleted {num_clients} rows from Clients.")
        print("Database cleared successfully.")
        
    except Exception as e:
        print(f"Error clearing data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_data()
