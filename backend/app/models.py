from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field

class RecordBase(BaseModel):
    id: str
    name: Optional[str] = None
    split: Optional[str] = "validation"
    lat: Optional[float] = None
    lon: Optional[float] = None
    crs: Optional[str] = None
    land_cover_superclass: Optional[str] = None
    land_cover_detail: Optional[str] = None
    LC_superclass_text: Optional[str] = None
    LC_detail_text: Optional[str] = None
    s2_date: Optional[str] = None
    neon_date: Optional[str] = None
    lr_width: Optional[int] = None
    lr_height: Optional[int] = None
    hr_2_5m_width: Optional[int] = None
    hr_2_5m_height: Optional[int] = None
    psnr: Optional[float] = None
    psnr_gain_db: Optional[float] = None
    ssim: Optional[float] = None
    scale_factor: Optional[str] = "4x"

    class Config:
        extra = "allow"

class DataResponse(BaseModel):
    success: bool = True
    total: int
    count: int
    page: int
    total_pages: int
    limit: int
    skip: int
    data: List[Dict[str, Any]]

class HealthResponse(BaseModel):
    status: str
    database: str
    collection: str
    total_documents: int
    connected: bool

class StatsResponse(BaseModel):
    total_records: int
    superclasses: Dict[str, int]
    avg_psnr: float
    avg_ssim: float
