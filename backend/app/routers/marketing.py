from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import database, schemas, models, auth, logic
import pandas as pd
from io import BytesIO

router = APIRouter(
    prefix="/api/marketing",
    tags=["marketing"],
    dependencies=[Depends(auth.get_current_marketing_user)]
)

@router.post("/projects", response_model=schemas.MasterResponse)
def create_project(project: schemas.ProjectCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    # 1. Validate duplicates
    existing_project = db.query(models.Project).filter(
        (models.Project.show_code == project.show_code) | 
        (models.Project.project_name == project.project_name)
    ).first()
    
    if existing_project:
        raise HTTPException(status_code=400, detail="Project with this Show Code or Project Name already exists.")

    # 2. Generate client_code (or reuse)
    client_code = logic.generate_unique_client_code(
        db, 
        project.client_name, 
        project.region, 
        project.territory, 
        project.misc_info
    )

    # 3. Insert/Update Clients table
    existing_client = db.query(models.Client).filter(
        models.Client.client_name == project.client_name,
        models.Client.misc_info == project.misc_info
    ).first()
    
    if not existing_client:
        new_client = models.Client(
            client_name=project.client_name, 
            client_code=client_code,
            misc_info=project.misc_info,
            created_by=current_user.username
        )
        db.add(new_client)
    
    # 4. Insert into Master
    new_master = models.Master(
        client_name=project.client_name,
        region=project.region,
        territory=project.territory,
        currency=project.currency,
        show_code=project.show_code,
        project_name=project.project_name,
        misc_info=project.misc_info,
        client_code=client_code,
        source=project.source,
        brand=project.brand,
        country=project.country,
        created_by=current_user.username
    )
    db.add(new_master)

    # 5. Insert into Projects (if not exists)
    new_project_entry = models.Project(
        project_name=project.project_name,
        show_code=project.show_code,
        created_by=current_user.username
    )
    db.add(new_project_entry)
    
    db.commit()
    db.refresh(new_master)
    
    return new_master

@router.get("/projects", response_model=List[schemas.MasterResponse])
def get_projects(
    skip: int = 0, 
    limit: int = 100, 
    client_name: Optional[str] = None,
    project_name: Optional[str] = None,
    show_code: Optional[str] = None,
    brand: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Master)
    if client_name:
        query = query.filter(models.Master.client_name.ilike(f"%{client_name}%"))
    if project_name:
        query = query.filter(models.Master.project_name.ilike(f"%{project_name}%"))
    if show_code:
        query = query.filter(models.Master.show_code.ilike(f"%{show_code}%"))
    if brand:
        query = query.filter(models.Master.brand.ilike(f"%{brand}%"))
        
    projects = query.offset(skip).limit(limit).all()
    return projects

@router.put("/projects/{master_id}", response_model=schemas.MasterResponse)
def update_project(master_id: int, project_update: schemas.ProjectUpdate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_project = db.query(models.Master).filter(models.Master.master_id == master_id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # If client_name or misc_info changes, we might need to update client_code?
    # The prompt says: "Respect new client-code reuse logic if client_name or misc_info changes"
    
    recalc_code = False
    if (project_update.client_name and project_update.client_name != db_project.client_name) or \
       (project_update.misc_info and project_update.misc_info != db_project.misc_info):
        recalc_code = True
        
    # Update fields
    update_data = project_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)
        
    if recalc_code:
        # Recalculate client code
        new_code = logic.generate_unique_client_code(
            db,
            db_project.client_name,
            db_project.region,
            db_project.territory,
            db_project.misc_info
        )
        db_project.client_code = new_code
        
        # Also ensure this new client combo exists in Clients table
        existing_client = db.query(models.Client).filter(
            models.Client.client_name == db_project.client_name,
            models.Client.misc_info == db_project.misc_info
        ).first()
        
        if not existing_client:
            new_client = models.Client(
                client_name=db_project.client_name, 
                client_code=new_code,
                misc_info=db_project.misc_info,
                created_by=current_user.username
            )
            db.add(new_client)

    # Update Project table if names changed
    if project_update.project_name:
        existing_p = db.query(models.Project).filter(models.Project.project_name == project_update.project_name).first()
        if existing_p and existing_p.project_name != db_project.project_name:
             raise HTTPException(status_code=400, detail="Project Name already exists")
        
        p_entry = db.query(models.Project).filter(models.Project.project_name == db_project.project_name).first()
        if p_entry:
            p_entry.project_name = project_update.project_name
            p_entry.updated_by = current_user.username
            
    if project_update.show_code:
        existing_s = db.query(models.Project).filter(models.Project.show_code == project_update.show_code).first()
        if existing_s and existing_s.show_code != db_project.show_code:
             raise HTTPException(status_code=400, detail="Show Code already exists")
             
        p_entry = db.query(models.Project).filter(models.Project.show_code == db_project.show_code).first()
        if p_entry:
            p_entry.show_code = project_update.show_code
            p_entry.updated_by = current_user.username

    db_project.updated_by = current_user.username
    db.commit()
    db.refresh(db_project)
    return db_project

@router.get("/projects/export")
def export_projects(db: Session = Depends(database.get_db)):
    projects = db.query(models.Master).all()
    data = [p.__dict__ for p in projects]
    for d in data:
        d.pop('_sa_instance_state', None)
    
    df = pd.DataFrame(data)
    stream = BytesIO()
    df.to_csv(stream, index=False)
    
    return Response(
        content=stream.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=projects.csv"}
    )

@router.get("/preview-client-code", response_model=schemas.ClientCodePreview)
def preview_client_code(
    client_name: str,
    region: str,
    territory: str,
    misc_info: str,
    db: Session = Depends(database.get_db)
):
    code = logic.preview_client_code_logic(db, client_name, region, territory, misc_info)
    return {"client_code": code}
@router.get("/validate-project")
def validate_project(
    project_name: Optional[str] = None,
    show_code: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    errors = {}
    if project_name:
        exists = db.query(models.Project).filter(models.Project.project_name == project_name).first()
        if exists:
            errors["project_name"] = "Project Name already exists"
            
    if show_code:
        exists = db.query(models.Project).filter(models.Project.show_code == show_code).first()
        if exists:
            errors["show_code"] = "Show Code already exists"
            
    return {"errors": errors}
