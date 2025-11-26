import pandas as pd
import hashlib
import os
from abc import ABC, abstractmethod

class DataSourceAdapter(ABC):
    @abstractmethod
    def fetch_data(self) -> pd.DataFrame:
        pass

    @abstractmethod
    def get_source_hash(self) -> str:
        pass

class LocalExcelAdapter(DataSourceAdapter):
    def __init__(self, file_path: str, sheet_name: str = "Biz"):
        self.file_path = file_path
        self.sheet_name = sheet_name

    def fetch_data(self) -> pd.DataFrame:
        if not os.path.exists(self.file_path):
            raise FileNotFoundError(f"Excel file not found at {self.file_path}")
        
        # Read Excel
        # Using openpyxl engine for xlsx
        df = pd.read_excel(self.file_path, sheet_name=self.sheet_name, engine='openpyxl')
        return df

    def get_source_hash(self) -> str:
        if not os.path.exists(self.file_path):
            return "0"
        
        # Simple hash based on file modification time and size for speed
        # For stricter content hashing, we'd read the file, but that's slow for large files
        stats = os.stat(self.file_path)
        identifier = f"{stats.st_mtime}-{stats.st_size}"
        return hashlib.md5(identifier.encode()).hexdigest()

class OneDriveAdapter(DataSourceAdapter):
    def __init__(self, config: dict):
        self.config = config

    def fetch_data(self) -> pd.DataFrame:
        # Scaffold: Future implementation using MS Graph API
        raise NotImplementedError("OneDrive adapter is not yet implemented.")

    def get_source_hash(self) -> str:
        raise NotImplementedError("OneDrive adapter is not yet implemented.")
