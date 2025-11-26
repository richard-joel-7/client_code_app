from app.ingestion.pipeline import run_ingestion
from app import models, database

if __name__ == "__main__":
    # Ensure tables exist (including new Business table)
    models.Base.metadata.create_all(bind=database.engine)
    run_ingestion()
