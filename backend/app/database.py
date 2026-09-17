import logging
from typing import Optional, Dict, Any
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.database import Database
from bson import ObjectId

from backend.app.config import settings

logger = logging.getLogger("sen2neon_backend")

class MongoDBManager:
    client: Optional[MongoClient] = None
    db: Optional[Database] = None
    collection: Optional[Collection] = None

    def connect(self) -> None:
        """Establish connection to MongoDB."""
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGODB_URI}...")
            self.client = MongoClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                connectTimeoutMS=5000,
            )
            # Verify server is reachable
            self.client.admin.command("ping")
            self.db = self.client[settings.MONGODB_DB_NAME]
            self.collection = self.db[settings.MONGODB_COLLECTION]
            logger.info(
                f"Successfully connected to MongoDB database '{settings.MONGODB_DB_NAME}', collection '{settings.MONGODB_COLLECTION}'"
            )
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            raise e

    def close(self) -> None:
        """Close connection to MongoDB."""
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB connection.")

    def get_collection(self) -> Collection:
        """Return the records collection instance."""
        if self.collection is None:
            self.connect()
        return self.collection

mongo_manager = MongoDBManager()

def get_records_collection() -> Collection:
    return mongo_manager.get_collection()

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB BSON objects (like ObjectId) to JSON-serializable primitives."""
    if not doc:
        return doc
    clean = dict(doc)
    if "_id" in clean and isinstance(clean["_id"], ObjectId):
        clean["_id"] = str(clean["_id"])
    return clean
