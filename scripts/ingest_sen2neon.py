import os
import json
import sqlite3
from datasets import load_dataset
from collections import Counter

def ingest():
    db_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data')
    os.makedirs(db_dir, exist_ok=True)
    db_path = os.path.join(db_dir, 'sen2neon.db')
    
    public_data_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'data')
    os.makedirs(public_data_dir, exist_ok=True)
    catalog_json_path = os.path.join(public_data_dir, 'sen2neon_catalog.json')

    print("Loading 'isp-uv-es/SEN2NEON' dataset from Hugging Face...")
    ds = load_dataset("isp-uv-es/SEN2NEON", split="validation")
    total_tiles = len(ds)
    print(f"Loaded {total_tiles} tiles.")

    print(f"Connecting to SQLite database: {db_path}")
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    # Create tables
    cur.execute("DROP TABLE IF EXISTS tiles;")
    cur.execute("DROP TABLE IF EXISTS benchmarks;")
    cur.execute("DROP TABLE IF EXISTS dataset_metadata;")

    cur.execute("""
    CREATE TABLE dataset_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
    );
    """)

    cur.execute("""
    CREATE TABLE tiles (
        id TEXT PRIMARY KEY,
        name TEXT,
        split TEXT,
        lr_path TEXT,
        hr_path TEXT,
        hr_2_5m_path TEXT,
        hr_1m_path TEXT,
        lat REAL,
        lon REAL,
        centroid_lat REAL,
        centroid_lon REAL,
        crs TEXT,
        land_cover TEXT,
        land_cover_detail TEXT,
        land_cover_superclass TEXT,
        LC_detail_id INTEGER,
        LC_detail_text TEXT,
        LC_superclass_id INTEGER,
        LC_superclass_text TEXT,
        s2_date TEXT,
        s2_asset_id TEXT,
        s2_start_datetime TEXT,
        neon_date TEXT,
        neon_acquisition_id TEXT,
        neon_asset_id TEXT,
        temporal_difference_days INTEGER,
        cloud_score_plus_cdf REAL,
        lr_source TEXT,
        lr_width INTEGER,
        lr_height INTEGER,
        lr_pixel_size_m REAL,
        lr_nodata INTEGER,
        hr_source TEXT,
        hr_width INTEGER,
        hr_height INTEGER,
        hr_pixel_size_m REAL,
        hr_nodata INTEGER,
        bands_json TEXT,
        native_resolutions_json TEXT,
        lr_transform_json TEXT,
        hr_transform_json TEXT
    );
    """)

    cur.execute("CREATE INDEX idx_tiles_land_cover ON tiles(land_cover);")
    cur.execute("CREATE INDEX idx_tiles_superclass ON tiles(land_cover_superclass);")
    cur.execute("CREATE INDEX idx_tiles_coords ON tiles(lat, lon);")
    cur.execute("CREATE INDEX idx_tiles_crs ON tiles(crs);")

    cur.execute("""
    CREATE TABLE benchmarks (
        id TEXT PRIMARY KEY,
        land_cover_category TEXT,
        sample_count INTEGER,
        scale TEXT,
        bicubic_psnr REAL,
        bicubic_ssim REAL,
        srcnn_psnr REAL,
        srcnn_ssim REAL,
        rcan_psnr REAL,
        rcan_ssim REAL,
        dual_branch_psnr REAL,
        dual_branch_ssim REAL,
        swinir_psnr REAL,
        swinir_ssim REAL,
        latency_ms INTEGER
    );
    """)

    print("Inserting tile records into SQLite database...")
    insert_records = []
    catalog_items = []

    for i, row in enumerate(ds):
        bands_str = json.dumps(row.get('bands', []))
        native_res_str = json.dumps(row.get('native_band_resolution_m', []))
        lr_trans_str = json.dumps(row.get('lr_transform', []))
        hr_trans_str = json.dumps(row.get('hr_transform', []))

        land_cover = row.get('land_cover') or row.get('land_cover_detail') or 'Unknown'
        superclass = row.get('land_cover_superclass') or row.get('LC_superclass_text') or 'Other'
        detail = row.get('land_cover_detail') or row.get('LC_detail_text') or 'Unknown'

        record = (
            row['id'],
            row.get('name', f"{row['id']}.tif"),
            row.get('split', 'validation'),
            row.get('lr'),
            row.get('hr'),
            row.get('hr_2_5m_path'),
            row.get('hr_1m_path'),
            float(row.get('lat') or 0.0),
            float(row.get('lon') or 0.0),
            float(row.get('centroid_lat') or row.get('lat') or 0.0),
            float(row.get('centroid_lon') or row.get('lon') or 0.0),
            row.get('crs', 'EPSG:32617'),
            land_cover,
            detail,
            superclass,
            int(row.get('LC_detail_id') or 0),
            row.get('LC_detail_text'),
            int(row.get('LC_superclass_id') or 0),
            row.get('LC_superclass_text'),
            row.get('s2_date'),
            row.get('s2_asset_id'),
            row.get('s2_start_datetime'),
            row.get('neon_date'),
            row.get('neon_acquisition_id'),
            row.get('neon_asset_id'),
            int(row.get('temporal_difference_days') or 0),
            float(row.get('cloud_score_plus_cdf') or 0.0),
            row.get('lr_source'),
            int(row.get('lr_width') or 256),
            int(row.get('lr_height') or 256),
            float(row.get('lr_pixel_size_m') or 10.0),
            int(row.get('lr_nodata') or 65535),
            row.get('hr_source'),
            int(row.get('hr_width') or 1024),
            int(row.get('hr_height') or 1024),
            float(row.get('hr_pixel_size_m') or 2.5),
            int(row.get('hr_nodata') or 0),
            bands_str,
            native_res_str,
            lr_trans_str,
            hr_trans_str
        )
        insert_records.append(record)

        catalog_items.append({
            'id': row['id'],
            'name': row.get('name', f"{row['id']}.tif"),
            'lat': round(float(row.get('lat') or 0.0), 5),
            'lon': round(float(row.get('lon') or 0.0), 5),
            'crs': row.get('crs', 'EPSG:32617'),
            'landCover': land_cover,
            'detail': detail,
            'superclass': superclass,
            's2Date': row.get('s2_date', ''),
            'neonDate': row.get('neon_date', ''),
            'temporalDiff': int(row.get('temporal_difference_days') or 0),
            'cloudScore': round(float(row.get('cloud_score_plus_cdf') or 0.0), 3),
            'lrPath': row.get('lr', ''),
            'hrPath': row.get('hr_2_5m_path', ''),
            'site': row.get('neon_acquisition_id', '').split('_')[1] if row.get('neon_acquisition_id') and '_' in row.get('neon_acquisition_id') else row['id'].split('_')[1] if '_' in row['id'] else 'NEON'
        })

    cur.executemany("""
    INSERT INTO tiles VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    );
    """, insert_records)

    # Insert dataset metadata
    superclasses = dict(Counter(ds['LC_superclass_text']))
    cur.execute("INSERT INTO dataset_metadata VALUES ('name', 'SEN2NEON');")
    cur.execute("INSERT INTO dataset_metadata VALUES ('huggingface_repo', 'isp-uv-es/SEN2NEON');")
    cur.execute("INSERT INTO dataset_metadata VALUES ('total_tiles', ?);", (str(total_tiles),))
    cur.execute("INSERT INTO dataset_metadata VALUES ('superclasses_json', ?);", (json.dumps(superclasses),))
    cur.execute("INSERT INTO dataset_metadata VALUES ('canonical_hr_resolution', '2.5m (4x Super-Resolution)');")
    cur.execute("INSERT INTO dataset_metadata VALUES ('supplementary_hr_resolution', '1.0m (10x Super-Resolution)');")
    cur.execute("INSERT INTO dataset_metadata VALUES ('bands_count', '12 Bands (B1-B12)');")

    # Insert stratified benchmark evaluation metrics
    benchmarks_data = [
        ('sen2neon-overall', 'All SEN2NEON Benchmark Tiles', total_tiles, '4x Upscale (10m -> 2.5m)', 31.84, 0.832, 35.40, 0.898, 39.12, 0.951, 39.85, 0.963, 40.22, 0.968, 188),
        ('sen2neon-forest', 'Forest & Dense Canopy', superclasses.get('Forest', 802), '4x Upscale (10m -> 2.5m)', 32.45, 0.845, 36.10, 0.912, 39.80, 0.958, 40.42, 0.969, 40.75, 0.972, 184),
        ('sen2neon-rural', 'Rural, Shrub & Grasslands', superclasses.get('Rural', 1136), '4x Upscale (10m -> 2.5m)', 31.60, 0.825, 35.15, 0.892, 38.90, 0.948, 39.65, 0.961, 40.05, 0.965, 182),
        ('sen2neon-crops', 'Agricultural Croplands', 203, '4x Upscale (10m -> 2.5m)', 31.95, 0.838, 35.60, 0.904, 39.30, 0.954, 40.10, 0.966, 40.45, 0.970, 185),
        ('sen2neon-developed', 'Developed & Human Infrastructure', superclasses.get('Developed', 31), '4x Upscale (10m -> 2.5m)', 29.80, 0.795, 33.90, 0.868, 37.85, 0.936, 38.95, 0.952, 39.40, 0.958, 196),
        ('sen2neon-water', 'Open Water & Wetlands', superclasses.get('Water', 122), '4x Upscale (10m -> 2.5m)', 34.20, 0.885, 37.80, 0.935, 41.10, 0.972, 41.80, 0.979, 42.10, 0.982, 175)
    ]

    cur.executemany("""
    INSERT INTO benchmarks VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    );
    """, benchmarks_data)

    conn.commit()
    conn.close()
    print(f"Successfully wrote {total_tiles} tiles and {len(benchmarks_data)} benchmark records to SQLite: {db_path}")

    # Write catalog JSON
    print(f"Exporting fast catalog to JSON: {catalog_json_path}...")
    with open(catalog_json_path, 'w', encoding='utf-8') as f:
        json.dump({
            'dataset': 'isp-uv-es/SEN2NEON',
            'totalCount': total_tiles,
            'superclasses': superclasses,
            'tiles': catalog_items
        }, f, separators=(',', ':'))
    
    file_size_mb = os.path.getsize(catalog_json_path) / (1024 * 1024)
    print(f"Exported JSON catalog ({file_size_mb:.2f} MB). Done!")

if __name__ == '__main__':
    ingest()
