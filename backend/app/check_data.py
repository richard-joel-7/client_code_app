from app.database import SessionLocal
from app import models

def check_data():
    db = SessionLocal()
    try:
        n_master = db.query(models.Master).count()
        n_projects = db.query(models.Project).count()
        n_clients = db.query(models.Client).count()
        
        print(f"Master rows: {n_master}")
        print(f"Projects rows: {n_projects}")
        print(f"Clients rows: {n_clients}")
        
        if n_projects > 0:
            print("\nExample Projects:")
            for p in db.query(models.Project).all():
                print(f" - {p.project_name} (Show Code: {p.show_code})")
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
