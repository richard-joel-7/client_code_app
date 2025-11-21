import random
from sqlalchemy.orm import Session
from . import models

def clean_string(s: str) -> str:
    return "".join(c for c in s if c.isalnum()).upper()

def get_client_code_candidates(client_name: str):
    """Yields possible 3-letter slices from client_name."""
    cleaned = clean_string(client_name)
    if len(cleaned) < 3:
        yield cleaned.ljust(3, 'X')
        return

    # Strategy: All contiguous 3-letter substrings first
    for i in range(len(cleaned) - 2):
        yield cleaned[i:i+3]

def construct_code(slice_3: str, region: str, territory: str, misc_info: str) -> str:
    # First letter of region
    r_code = clean_string(region)[:1] if region else "X"
    
    # First 2 letters of territory
    t_code = clean_string(territory)[:2] if territory else "XX"
    t_code = t_code.ljust(2, 'X')

    # First 2 letters of misc_info
    m_code = clean_string(misc_info)[:2] if misc_info else "XX"
    m_code = m_code.ljust(2, 'X')
    
    return f"{slice_3}{r_code}{t_code}{m_code}"

def generate_unique_client_code(db: Session, client_name: str, region: str, territory: str, misc_info: str) -> str:
    # Rule 1: Reuse existing client code if client_name + misc_info matches
    # Check 'clients' table
    existing_client = db.query(models.Client).filter(
        models.Client.client_name.ilike(client_name),
        models.Client.misc_info.ilike(misc_info)
    ).first()
    
    if existing_client:
        return existing_client.client_code

    # Rule 2 & 3: Generate new code
    candidates = get_client_code_candidates(client_name)
    
    # Try candidates
    for slice_3 in candidates:
        code = construct_code(slice_3, region, territory, misc_info)
        # Check collision in Clients table (it must be unique globally in Clients table)
        collision = db.query(models.Client).filter(models.Client.client_code == code).first()
        if not collision:
            return code
            
    # If all slices used (or collision on all), append suffix
    base_candidates = get_client_code_candidates(client_name)
    first_slice = next(base_candidates) # Should exist
    base_code = construct_code(first_slice, region, territory, misc_info)
    
    suffix = 1
    while True:
        code = f"{base_code}{suffix}"
        collision = db.query(models.Client).filter(models.Client.client_code == code).first()
        if not collision:
            return code
        suffix += 1

def preview_client_code_logic(db: Session, client_name: str, region: str, territory: str, misc_info: str) -> str:
    # Same logic as generation, but just returning the value
    return generate_unique_client_code(db, client_name, region, territory, misc_info)
