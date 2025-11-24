from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

# Project/Master Schemas
class ProjectCreate(BaseModel):
    client_name: str
    region: str
    territory: str
    currency: str
    show_code: str
    project_name: str
    misc_info: str
    source: Optional[str] = None
    brand: Optional[str] = None
    country: str

class ProjectUpdate(BaseModel):
    client_name: Optional[str] = None
    region: Optional[str] = None
    territory: Optional[str] = None
    currency: Optional[str] = None
    show_code: Optional[str] = None
    project_name: Optional[str] = None
    misc_info: Optional[str] = None
    source: Optional[str] = None
    brand: Optional[str] = None
    country: Optional[str] = None

class MasterResponse(BaseModel):
    master_id: int
    client_name: Optional[str] = None
    region: Optional[str] = None
    territory: Optional[str] = None
    currency: Optional[str] = None
    show_code: Optional[str] = None
    project_name: Optional[str] = None
    misc_info: Optional[str] = None
    client_code: Optional[str] = None
    source: Optional[str] = None
    brand: Optional[str] = None
    country: Optional[str] = None
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True

class ClientCodePreview(BaseModel):
    client_code: str

class ClientDetailsResponse(BaseModel):
    region: Optional[str] = None
    territory: Optional[str] = None
    country: Optional[str] = None
