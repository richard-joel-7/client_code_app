from app.database import SessionLocal
from app import models, logic

def debug():
    db = SessionLocal()
    try:
        # 1. Check Master table
        print("--- Checking Master Table ---")
        projects = db.query(models.Master).all()
        print(f"Total Projects: {len(projects)}")
        for p in projects:
            print(f"ID: {p.master_id}, Client: {p.client_name}, Brand: {p.brand}, Region: {p.region}")
            
        # 2. Test Logic
        print("\n--- Testing Preview Logic ---")
        try:
            code = logic.preview_client_code_logic(db, "Sofia", "India", "Chennai", "00")
            print(f"Preview Code for Sofia/India/Chennai/00: {code}")
        except Exception as e:
            print(f"Logic Error: {e}")
            
    except Exception as e:
        print(f"DB Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug()
