import os
import sys
import uvicorn
from pathlib import Path

# Add project root to sys.path so 'backend.app' can be imported reliably
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.config import settings

if __name__ == "__main__":
    print("=" * 65)
    print(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    print(f"MongoDB Target : {settings.MONGODB_URI} -> {settings.MONGODB_DB_NAME}.{settings.MONGODB_COLLECTION}")
    print(f"Host & Port    : http://{settings.BACKEND_HOST}:{settings.BACKEND_PORT}")
    print(f"Swagger Docs   : http://localhost:{settings.BACKEND_PORT}/docs")
    print(f"Data Endpoint  : http://localhost:{settings.BACKEND_PORT}/api/data")
    print("=" * 65)
    uvicorn.run(
        "backend.app.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=False,
    )
