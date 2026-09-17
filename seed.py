from datasets import load_dataset
from pymongo import MongoClient
import numpy as np

print("Connecting to local MongoDB...")
client = MongoClient("mongodb://localhost:27017/")
db = client["sen2neon_db"]
collection = db["records"]

print("Downloading dataset from Hugging Face...")
ds = load_dataset("isp-uv-es/SEN2NEON")

# The SEN2NEON dataset publishes 'validation' as its primary split (2,269 paired satellite tiles)
split_name = "train" if "train" in ds else "validation"
print(f"Using split: '{split_name}' ({len(ds[split_name])} records)")

print("Converting and sanitizing data for MongoDB...")
data_to_insert = []

# Iterate directly through the dataset to preserve native Python types (avoiding numpy.ndarray BSON errors)
for row in ds[split_name]:
    clean_row = {}
    for k, v in row.items():
        if isinstance(v, np.ndarray) or hasattr(v, "tolist"):
            clean_row[k] = v.tolist()
        elif isinstance(v, (str, int, float, bool)) or v is None:
            clean_row[k] = v
        elif isinstance(v, list):
            clean_row[k] = [x.tolist() if hasattr(x, "tolist") else x for x in v]
        else:
            clean_row[k] = str(v)

    # Use dataset ID as MongoDB _id
    if "id" in clean_row and clean_row["id"]:
        clean_row["_id"] = clean_row["id"]

    data_to_insert.append(clean_row)

print("Inserting data into MongoDB...")
collection.delete_many({})
collection.insert_many(data_to_insert)

print(f"Success! {len(data_to_insert)} records are now in sen2neon_db.records.")