from .database import SessionLocal, engine
from . import models, auth

def seed():
    db = SessionLocal()
    
    users = [
        ("marketing_user", "password123", "marketing"),
        ("team2_user", "password123", "team2"),
        ("team3_user", "password123", "team3"),
    ]
    
    for username, pwd, role in users:
        existing = db.query(models.User).filter(models.User.username == username).first()
        if not existing:
            print(f"Creating user {username}")
            hashed = auth.get_password_hash(pwd)
            user = models.User(username=username, password_hash=hashed, role=role)
            db.add(user)
        else:
            print(f"User {username} already exists")
            
    db.commit()
    db.close()

if __name__ == "__main__":
    seed()
