import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.config import settings
from backend.app.database import mongo_manager, get_records_collection
from backend.app.routes.data import router as data_router
from backend.app.models import HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("sen2neon_backend")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager to establish MongoDB connection on startup and cleanup on shutdown."""
    logger.info("Starting up FastAPI application...")
    try:
        mongo_manager.connect()
    except Exception as e:
        logger.warning(f"MongoDB connection deferred or failed: {e}")
    yield
    logger.info("Shutting down FastAPI application...")
    mongo_manager.close()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack FastAPI server connecting to MongoDB (sen2neon_db.records) for Satellite Super-Resolution raster tiles.",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS) for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register REST API Routers
app.include_router(data_router, prefix="/api")


@app.get("/", tags=["root"])
def root():
    return {
        "message": "Welcome to SEN2NEON Satellite SRM MongoDB Backend API",
        "database": settings.MONGODB_DB_NAME,
        "collection": settings.MONGODB_COLLECTION,
        "docs_url": "/docs",
        "data_endpoint": "/api/data",
        "health_endpoint": "/api/health",
    }


@app.get("/api/health", response_model=HealthResponse, tags=["health"])
def health_check():
    """Verify MongoDB connectivity and return current document count."""
    try:
        col = get_records_collection()
        total_docs = col.count_documents({})
        return HealthResponse(
            status="healthy",
            database=settings.MONGODB_DB_NAME,
            collection=settings.MONGODB_COLLECTION,
            total_documents=total_docs,
            connected=True,
        )
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "database": settings.MONGODB_DB_NAME,
                "collection": settings.MONGODB_COLLECTION,
                "total_documents": 0,
                "connected": False,
                "error": str(e),
            },
        )
