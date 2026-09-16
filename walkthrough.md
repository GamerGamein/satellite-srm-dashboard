# SEN2NEON Dataset Ingestion & Dashboard Integration

We have ingested the **`isp-uv-es/SEN2NEON`** dataset into the local database and integrated it with the Satellite Super-Resolution dashboard. The development server is currently live and running at [http://localhost:3000](http://localhost:3000).

---

## 1. Database Ingestion Pipeline

Using [`scripts/ingest_sen2neon.py`](file:///c:/Users/krata/.gemini/antigravity-ide/scratch/satellite-srm-dashboard/scripts/ingest_sen2neon.py):
- Loaded all **2,269 paired Sentinel-2 (10m) and NEON AVIRIS-NG (2.5m/1m ground truth)** tiles using Hugging Face `datasets.load_dataset("isp-uv-es/SEN2NEON")`.
- Created an indexed SQLite database at [`data/sen2neon.db`](file:///c:/Users/krata/.gemini/antigravity-ide/scratch/satellite-srm-dashboard/data/sen2neon.db):
  - **`tiles` table** (2,269 rows): `id`, `lat`, `lon`, `crs`, `land_cover`, `land_cover_detail`, `land_cover_superclass`, `s2_date`, `neon_date`, `temporal_difference_days`, `cloud_score_plus_cdf`, `lr_path`, `hr_path`, `bands_json`.
  - **`benchmarks` table**: Quantitative super-resolution performance across stratified land-cover classes (Overall, Forest, Rural, Crops, Water, Developed).
  - **`dataset_metadata` table**: Dataset metadata, reference scales, and class distributions.
- Exported a high-speed JSON catalog to [`public/data/sen2neon_catalog.json`](file:///c:/Users/krata/.gemini/antigravity-ide/scratch/satellite-srm-dashboard/public/data/sen2neon_catalog.json) (0.79 MB) for instant client-side queries.

---

## 2. API Endpoints

- **`GET /api/sen2neon`**: Paginated tile queries with filters for search, land-cover classes, and superclasses:
  - Example: `http://localhost:3000/api/sen2neon?limit=10&superclass=Forest`
  - Benchmark records: `http://localhost:3000/api/sen2neon?benchmarks=true`
- **`GET /api/sen2neon/[id]`**: Single tile lookup by ID (e.g., `http://localhost:3000/api/sen2neon/2018_MLBS_3__0_2`).

---

## 3. UI & Workspace Features

- **SEN2NEON Database Explorer Dialog** ([`components/workspace/Sen2NeonDatabaseModal.tsx`](file:///c:/Users/krata/.gemini/antigravity-ide/scratch/satellite-srm-dashboard/components/workspace/Sen2NeonDatabaseModal.tsx)):
  - Accessible via the **"Browse SEN2NEON Database (2,269)"** button in the workspace sidebar.
  - Interactive search bar and land-cover filter tabs (*All*, *Forest*, *Rural*, *Water*, *Developed*).
  - Shows tile ID, coordinate badges, acquisition dates, temporal difference, CRS, and a **"Load Tile"** button.
- **Comparison Viewer Integration** ([`components/workspace/ComparisonViewer.tsx`](file:///c:/Users/krata/.gemini/antigravity-ide/scratch/satellite-srm-dashboard/components/workspace/ComparisonViewer.tsx)):
  - Loads real SEN2NEON tile metadata, 12 multispectral bands, and displays the **`SEN2NEON (10m → 2.5m)`** ground-truth badge.
- **Benchmarks Matrix** ([`components/benchmarks/DatasetTable.tsx`](file:///c:/Users/krata/.gemini/antigravity-ide/scratch/satellite-srm-dashboard/components/benchmarks/DatasetTable.tsx)):
  - Highlights `SEN2NEON Ground-Truth Benchmark` as the primary ground-truth benchmark (4x upscale, Sentinel-2 10m to NEON 2.5m).
- **3D Earth Globe Beacon** ([`components/3d/InteractiveEarthBackground.tsx`](file:///c:/Users/krata/.gemini/antigravity-ide/scratch/satellite-srm-dashboard/components/3d/InteractiveEarthBackground.tsx)):
  - Added ground target beacon for **SEN2NEON Mountain Lake (Virginia)**.

---

## 4. Verification Results

| Target | Status | Result |
| :--- | :--- | :--- |
| **SQLite Ingestion** | Passed | 2,269 tiles & 6 benchmark records in `data/sen2neon.db` |
| **TypeScript Check** | Passed | `npx tsc --noEmit` exited with 0 errors |
| **Next.js Production Build** | Passed | `npm run build` compiled all routes in 3.9s |
| **API Endpoints** | Passed | HTTP 200 on `/api/sen2neon`, `/api/sen2neon?benchmarks=true`, `/api/sen2neon/[id]` |
| **Development Server** | Running | Live on [http://localhost:3000](http://localhost:3000) |
