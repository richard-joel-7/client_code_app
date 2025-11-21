from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"

    username = Column(String, primary_key=True, unique=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)  # "marketing", "team2", "team3"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String, nullable=True)

class Client(Base):
    __tablename__ = "clients"

    client_id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False) # Not unique anymore globally, but unique per misc_info? No, name+misc is unique.
    client_code = Column(String, unique=True, nullable=False)
    misc_info = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String, nullable=True)

class Project(Base):
    __tablename__ = "projects"

    project_id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String, unique=True, nullable=False)
    show_code = Column(String, unique=True, nullable=False)
    created_by = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    updated_by = Column(String, nullable=True)

class Master(Base):
    __tablename__ = "master"

    master_id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String, nullable=False)
    region = Column(String, nullable=False) # "Global" | "India"
    territory = Column(String, nullable=False)
    currency = Column(String, nullable=False)
    show_code = Column(String, nullable=False)
    project_name = Column(String, nullable=False)
    misc_info = Column(String, nullable=False)
    client_code = Column(String, nullable=False) # Not unique in Master? Multiple projects can share client code? Yes.
    source = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    country = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    created_by = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    updated_by = Column(String, nullable=True)
