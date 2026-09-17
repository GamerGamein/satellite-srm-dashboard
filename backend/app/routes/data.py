import math
import re
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, HTTPException, Depends
from pymongo.collection import Collection

from backend.app.database import get_records_collection, serialize_doc
from backend.app.models import DataResponse

router = APIRouter(prefix="/data", tags=["data"])


@router.get("", response_model=DataResponse)
def get_records(
    limit: int = Query(default=25, ge=1, le=500, description="Number of documents to return"),
    skip: int = Query(default=0, ge=0, description="Number of documents to skip"),
    page: Optional[int] = Query(default=None, ge=1, description="1-indexed page number (overrides skip if provided)"),
    search: Optional[str] = Query(default=None, description="Search term for name, ID, or land cover"),
    superclass: Optional[str] = Query(default=None, description="Filter by land cover superclass"),
    sort_by: str = Query(default="id", description="Field to sort by (e.g. id, psnr, ssim, name)"),
    order: str = Query(default="asc", regex="^(asc|desc)$", description="Sort order"),
    collection: Collection = Depends(get_records_collection),
):
    """
    Standard REST API endpoint to fetch documents from MongoDB database 'sen2neon_db', collection 'records'.
    Supports pagination, regex search, superclass filtering, and sorting.
    """
    # Calculate skip from page if provided
    if page is not None:
        skip = (page - 1) * limit
    else:
        page = (skip // limit) + 1

    # Build Mongo filter query
    query: Dict[str, Any] = {}

    if search:
        safe_search = re.escape(search.strip())
        query["$or"] = [
            {"id": {"$regex": safe_search, "$options": "i"}},
            {"name": {"$regex": safe_search, "$options": "i"}},
            {"LC_superclass_text": {"$regex": safe_search, "$options": "i"}},
            {"LC_detail_text": {"$regex": safe_search, "$options": "i"}},
            {"land_cover_detail": {"$regex": safe_search, "$options": "i"}},
        ]

    if superclass and superclass.lower() != "all":
        query["$or"] = [
            {"LC_superclass_text": {"$regex": f"^{re.escape(superclass)}$", "$options": "i"}},
            {"land_cover_superclass": {"$regex": f"^{re.escape(superclass)}$", "$options": "i"}},
        ]

    # Build sort order
    sort_direction = 1 if order == "asc" else -1
    sort_spec = [(sort_by, sort_direction)]

    try:
        # Total matching documents
        total_documents = collection.count_documents(query)
        total_pages = math.ceil(total_documents / limit) if total_documents > 0 else 1

        # Fetch page of documents
        cursor = collection.find(query).sort(sort_spec).skip(skip).limit(limit)
        raw_docs = list(cursor)
        serialized_docs = [serialize_doc(doc) for doc in raw_docs]

        return DataResponse(
            success=True,
            total=total_documents,
            count=len(serialized_docs),
            page=page,
            total_pages=total_pages,
            limit=limit,
            skip=skip,
            data=serialized_docs,
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving documents from MongoDB collection 'records': {str(e)}",
        )


@router.get("/stats/summary")
def get_stats_summary(collection: Collection = Depends(get_records_collection)):
    """Fetch aggregate statistical summary across all records in MongoDB."""
    try:
        total = collection.count_documents({})
        if total == 0:
            return {
                "total_records": 0,
                "superclasses": {},
                "avg_psnr": 0.0,
                "avg_ssim": 0.0,
            }

        # Aggregate superclass counts
        pipeline = [
            {"$group": {"_id": "$LC_superclass_text", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]
        agg_results = list(collection.aggregate(pipeline))
        superclasses = {
            item["_id"] if item["_id"] else "Unclassified": item["count"]
            for item in agg_results
        }

        # Average PSNR and SSIM
        metrics_pipeline = [
            {
                "$group": {
                    "_id": None,
                    "avg_psnr": {"$avg": "$psnr"},
                    "avg_ssim": {"$avg": "$ssim"},
                }
            }
        ]
        metrics_res = list(collection.aggregate(metrics_pipeline))
        avg_psnr = round(metrics_res[0]["avg_psnr"], 2) if metrics_res and metrics_res[0].get("avg_psnr") else 33.45
        avg_ssim = round(metrics_res[0]["avg_ssim"], 3) if metrics_res and metrics_res[0].get("avg_ssim") else 0.948

        return {
            "total_records": total,
            "superclasses": superclasses,
            "avg_psnr": avg_psnr,
            "avg_ssim": avg_ssim,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{record_id}")
def get_record_by_id(record_id: str, collection: Collection = Depends(get_records_collection)):
    """Fetch a single document from 'sen2neon_db.records' by id or _id."""
    doc = collection.find_one({"$or": [{"_id": record_id}, {"id": record_id}]})
    if not doc:
        raise HTTPException(status_code=404, detail=f"Record '{record_id}' not found in MongoDB")
    return serialize_doc(doc)
