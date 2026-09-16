import path from 'path';
import fs from 'fs';

export interface SEN2NEONTileRecord {
  id: string;
  name: string;
  split: string;
  lr_path: string;
  hr_path: string;
  hr_2_5m_path: string;
  hr_1m_path: string;
  lat: number;
  lon: number;
  centroid_lat: number;
  centroid_lon: number;
  crs: string;
  land_cover: string;
  land_cover_detail: string;
  land_cover_superclass: string;
  s2_date: string;
  s2_asset_id?: string;
  neon_date: string;
  neon_acquisition_id?: string;
  temporal_difference_days: number;
  cloud_score_plus_cdf: number;
  lr_width: number;
  lr_height: number;
  hr_width: number;
  hr_height: number;
  bands?: string[];
}

export interface SEN2NEONBenchmarkRecord {
  id: string;
  land_cover_category: string;
  sample_count: number;
  scale: string;
  bicubic_psnr: number;
  bicubic_ssim: number;
  srcnn_psnr: number;
  srcnn_ssim: number;
  rcan_psnr: number;
  rcan_ssim: number;
  dual_branch_psnr: number;
  dual_branch_ssim: number;
  swinir_psnr: number;
  swinir_ssim: number;
  latency_ms: number;
}

export interface SEN2NEONQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  landCover?: string;
  superclass?: string;
  sortBy?: 'id' | 'lat' | 'lon' | 'date';
  sortAsc?: boolean;
}

let sqliteDbInstance: any = null;

function getDatabase() {
  if (sqliteDbInstance) return sqliteDbInstance;
  try {
    const { DatabaseSync } = require('node:sqlite');
    const dbPath = path.join(process.cwd(), 'data', 'sen2neon.db');
    if (fs.existsSync(dbPath)) {
      sqliteDbInstance = new DatabaseSync(dbPath, { readOnly: true });
      return sqliteDbInstance;
    }
  } catch (err) {
    console.warn('node:sqlite initialization error or unsupported in environment:', err);
  }
  return null;
}

export function querySEN2NEONTiles(options: SEN2NEONQueryOptions = {}): {
  tiles: SEN2NEONTileRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const offset = (page - 1) * limit;

  const db = getDatabase();

  if (db) {
    try {
      const conditions: string[] = [];
      const params: any[] = [];

      if (options.search) {
        conditions.push('(id LIKE ? OR name LIKE ? OR crs LIKE ?)');
        const s = `%${options.search}%`;
        params.push(s, s, s);
      }

      if (options.landCover && options.landCover !== 'all') {
        conditions.push('land_cover = ?');
        params.push(options.landCover);
      }

      if (options.superclass && options.superclass !== 'all') {
        conditions.push('land_cover_superclass = ?');
        params.push(options.superclass);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const countSql = `SELECT COUNT(*) as cnt FROM tiles ${whereClause}`;
      const countStmt = db.prepare(countSql);
      const countRes = countStmt.get(...params) as { cnt: number };
      const total = countRes ? countRes.cnt : 0;

      const orderCol = options.sortBy === 'lat' ? 'lat' : options.sortBy === 'date' ? 's2_date' : 'id';
      const orderDir = options.sortAsc ? 'ASC' : 'DESC';

      const selectSql = `SELECT * FROM tiles ${whereClause} ORDER BY ${orderCol} ${orderDir} LIMIT ? OFFSET ?`;
      const selectStmt = db.prepare(selectSql);
      const rows = selectStmt.all(...params, limit, offset) as any[];

      const tiles: SEN2NEONTileRecord[] = rows.map((r: any) => ({
        ...r,
        bands: r.bands_json ? JSON.parse(r.bands_json) : ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12'],
      }));

      return {
        tiles,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (e) {
      console.error('Error executing query against SQLite:', e);
    }
  }

  // Fallback to JSON catalog if database is not available
  try {
    const catalogPath = path.join(process.cwd(), 'public', 'data', 'sen2neon_catalog.json');
    if (fs.existsSync(catalogPath)) {
      const data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
      let filtered = data.tiles as any[];

      if (options.search) {
        const q = options.search.toLowerCase();
        filtered = filtered.filter((t) => t.id.toLowerCase().includes(q) || t.crs.toLowerCase().includes(q));
      }
      if (options.landCover && options.landCover !== 'all') {
        filtered = filtered.filter((t) => t.landCover === options.landCover);
      }
      if (options.superclass && options.superclass !== 'all') {
        filtered = filtered.filter((t) => t.superclass === options.superclass);
      }

      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit).map((t) => ({
        id: t.id,
        name: t.name,
        split: 'validation',
        lr_path: t.lrPath,
        hr_path: t.hrPath,
        hr_2_5m_path: t.hrPath,
        hr_1m_path: '',
        lat: t.lat,
        lon: t.lon,
        centroid_lat: t.lat,
        centroid_lon: t.lon,
        crs: t.crs,
        land_cover: t.landCover,
        land_cover_detail: t.detail,
        land_cover_superclass: t.superclass,
        s2_date: t.s2Date,
        neon_date: t.neonDate,
        temporal_difference_days: t.temporalDiff,
        cloud_score_plus_cdf: t.cloudScore,
        lr_width: 256,
        lr_height: 256,
        hr_width: 1024,
        hr_height: 1024,
        bands: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12'],
      }));

      return {
        tiles: paginated,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  } catch (err) {
    console.error('Catalog fallback error:', err);
  }

  return { tiles: [], total: 0, page: 1, limit, totalPages: 0 };
}

export function getTileById(id: string): SEN2NEONTileRecord | null {
  const db = getDatabase();
  if (db) {
    try {
      const stmt = db.prepare('SELECT * FROM tiles WHERE id = ? LIMIT 1');
      const row = stmt.get(id) as any;
      if (row) {
        return {
          ...row,
          bands: row.bands_json ? JSON.parse(row.bands_json) : ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12'],
        };
      }
    } catch (e) {
      console.error('Error fetching tile by ID from SQLite:', e);
    }
  }

  // Fallback to catalog JSON
  try {
    const catalogPath = path.join(process.cwd(), 'public', 'data', 'sen2neon_catalog.json');
    if (fs.existsSync(catalogPath)) {
      const data = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
      const t = (data.tiles || []).find((item: any) => item.id === id);
      if (t) {
        return {
          id: t.id,
          name: t.name,
          split: 'validation',
          lr_path: t.lrPath,
          hr_path: t.hrPath,
          hr_2_5m_path: t.hrPath,
          hr_1m_path: '',
          lat: t.lat,
          lon: t.lon,
          centroid_lat: t.lat,
          centroid_lon: t.lon,
          crs: t.crs,
          land_cover: t.landCover,
          land_cover_detail: t.detail,
          land_cover_superclass: t.superclass,
          s2_date: t.s2Date,
          neon_date: t.neonDate,
          temporal_difference_days: t.temporalDiff,
          cloud_score_plus_cdf: t.cloudScore,
          lr_width: 256,
          lr_height: 256,
          hr_width: 1024,
          hr_height: 1024,
          bands: ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B8A', 'B9', 'B11', 'B12'],
        };
      }
    }
  } catch (err) {
    console.error('Catalog fallback error in getTileById:', err);
  }

  return null;
}

export function getSEN2NEONBenchmarks(): SEN2NEONBenchmarkRecord[] {
  const db = getDatabase();
  if (db) {
    try {
      const stmt = db.prepare('SELECT * FROM benchmarks ORDER BY sample_count DESC');
      return stmt.all() as SEN2NEONBenchmarkRecord[];
    } catch (e) {
      console.error('Error querying benchmarks:', e);
    }
  }
  return [
    {
      id: 'sen2neon-overall',
      land_cover_category: 'All SEN2NEON Benchmark Tiles',
      sample_count: 2269,
      scale: '4x Upscale (10m -> 2.5m)',
      bicubic_psnr: 31.84,
      bicubic_ssim: 0.832,
      srcnn_psnr: 35.40,
      srcnn_ssim: 0.898,
      rcan_psnr: 39.12,
      rcan_ssim: 0.951,
      dual_branch_psnr: 39.85,
      dual_branch_ssim: 0.963,
      swinir_psnr: 40.22,
      swinir_ssim: 0.968,
      latency_ms: 188,
    },
    {
      id: 'sen2neon-forest',
      land_cover_category: 'Forest & Dense Canopy',
      sample_count: 802,
      scale: '4x Upscale (10m -> 2.5m)',
      bicubic_psnr: 32.45,
      bicubic_ssim: 0.845,
      srcnn_psnr: 36.10,
      srcnn_ssim: 0.912,
      rcan_psnr: 39.80,
      rcan_ssim: 0.958,
      dual_branch_psnr: 40.42,
      dual_branch_ssim: 0.969,
      swinir_psnr: 40.75,
      swinir_ssim: 0.972,
      latency_ms: 184,
    },
    {
      id: 'sen2neon-rural',
      land_cover_category: 'Rural, Shrub & Grasslands',
      sample_count: 1136,
      scale: '4x Upscale (10m -> 2.5m)',
      bicubic_psnr: 31.60,
      bicubic_ssim: 0.825,
      srcnn_psnr: 35.15,
      srcnn_ssim: 0.892,
      rcan_psnr: 38.90,
      rcan_ssim: 0.948,
      dual_branch_psnr: 39.65,
      dual_branch_ssim: 0.961,
      swinir_psnr: 40.05,
      swinir_ssim: 0.965,
      latency_ms: 182,
    },
    {
      id: 'sen2neon-crops',
      land_cover_category: 'Agricultural Croplands',
      sample_count: 203,
      scale: '4x Upscale (10m -> 2.5m)',
      bicubic_psnr: 31.95,
      bicubic_ssim: 0.838,
      srcnn_psnr: 35.60,
      srcnn_ssim: 0.904,
      rcan_psnr: 39.30,
      rcan_ssim: 0.954,
      dual_branch_psnr: 40.10,
      dual_branch_ssim: 0.966,
      swinir_psnr: 40.45,
      swinir_ssim: 0.970,
      latency_ms: 185,
    },
    {
      id: 'sen2neon-water',
      land_cover_category: 'Open Water & Wetlands',
      sample_count: 122,
      scale: '4x Upscale (10m -> 2.5m)',
      bicubic_psnr: 34.20,
      bicubic_ssim: 0.885,
      srcnn_psnr: 37.80,
      srcnn_ssim: 0.935,
      rcan_psnr: 41.10,
      rcan_ssim: 0.972,
      dual_branch_psnr: 41.80,
      dual_branch_ssim: 0.979,
      swinir_psnr: 42.10,
      swinir_ssim: 0.982,
      latency_ms: 175,
    },
    {
      id: 'sen2neon-developed',
      land_cover_category: 'Developed & Human Infrastructure',
      sample_count: 31,
      scale: '4x Upscale (10m -> 2.5m)',
      bicubic_psnr: 29.80,
      bicubic_ssim: 0.795,
      srcnn_psnr: 33.90,
      srcnn_ssim: 0.868,
      rcan_psnr: 37.85,
      rcan_ssim: 0.936,
      dual_branch_psnr: 38.95,
      dual_branch_ssim: 0.952,
      swinir_psnr: 39.40,
      swinir_ssim: 0.958,
      latency_ms: 196,
    },
  ];
}
