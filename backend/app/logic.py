import random
from sqlalchemy.orm import Session
from . import models

def clean_string(s: str) -> str:
    return "".join(c for c in s if c.isalnum()).upper()

def get_region_char(region: str) -> str:
    r = region.lower()
    if "domestic" in r:
        return "D"
    if "international" in r:
        return "I"
    # Fallback
    return clean_string(region)[:1] if region else "X"

def get_territory_char(territory: str) -> str:
    t = territory.lower()
    if "others" in t:
        return "W"
    if "usa" in t:
        return "U"
    if "uk" in t:
        return "K"
    # Fallback: First letter
    return clean_string(territory)[:1] if territory else "X"

def get_random_3_letters(name: str) -> str:
    """
    Picks 3 random letters from the name, preserving original order.
    Example: Kabilarasan -> KBL, KBS, KAA, etc.
    """
    cleaned = clean_string(name)
    if len(cleaned) < 3:
        return cleaned.ljust(3, 'X')
    
    # Pick 3 indices
    indices = sorted(random.sample(range(len(cleaned)), 3))
    return "".join(cleaned[i] for i in indices)

def construct_code(slice_3: str, region: str, territory: str, misc_info: str) -> str:
    r_code = get_region_char(region)
    t_code = get_territory_char(territory)
    
    # Misc info: take as is (cleaned), usually 2 chars like ID, TS
    m_code = clean_string(misc_info)
    if not m_code:
        m_code = "XX"
    
    # Format: XXX-RT-MI
    # Example: KBL-DC-ID
    return f"{slice_3}-{r_code}{t_code}-{m_code}"

def generate_unique_client_code(db: Session, client_name: str, region: str, territory: str, misc_info: str) -> str:
    # Rule 1: Reuse existing client code if client_name + misc_info matches
    existing_client = db.query(models.Client).filter(
        models.Client.client_name.ilike(client_name),
        models.Client.misc_info.ilike(misc_info)
    ).first()
    
    if existing_client:
        return existing_client.client_code

    # Rule 2: Generate new code with random 3 letters
    # Try up to 50 times to find a unique random combination
    for _ in range(50):
        slice_3 = get_random_3_letters(client_name)
        code = construct_code(slice_3, region, territory, misc_info)
        
        # Check collision
        collision = db.query(models.Client).filter(models.Client.client_code == code).first()
        if not collision:
            return code
            
    # Fallback if random attempts fail (unlikely unless name is very short):
    # Use a suffix
    base_slice = get_random_3_letters(client_name)
    base_code = construct_code(base_slice, region, territory, misc_info)
    
    suffix = 1
    while True:
        code = f"{base_code}{suffix}"
        collision = db.query(models.Client).filter(models.Client.client_code == code).first()
        if not collision:
            return code
        suffix += 1

def preview_client_code_logic(db: Session, client_name: str, region: str, territory: str, misc_info: str) -> str:
    # For preview, we just generate one. 
    # NOTE: Since it's random, the preview might differ from the final save if not passed explicitly.
    # The frontend should capture this preview and send it.
    return generate_unique_client_code(db, client_name, region, territory, misc_info)
