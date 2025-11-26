from sqlalchemy.orm import Session
from app import models, database, auth

def create_ceo():
    db = database.SessionLocal()
    
    username = "ceo"
    password = "ceo123"
    role = "ceo"
    
    existing = db.query(models.User).filter(models.User.username == username).first()
    if existing:
        print(f"User {username} already exists.")
        db.close()
        return

    hashed_pw = auth.get_password_hash(password)
    new_user = models.User(
        username=username,
        password_hash=hashed_pw,
        role=role,
        created_by="system"
    )
    
    db.add(new_user)
    db.commit()
    print(f"User {username} created successfully.")
    db.close()

if __name__ == "__main__":
    create_ceo()
