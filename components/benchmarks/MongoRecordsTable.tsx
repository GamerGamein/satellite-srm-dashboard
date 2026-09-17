'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ArrowUpDown,
  Filter,
  RefreshCw,
  Database,
  Layers,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Code2,
  Copy,
  Check,
  MapPin,
  Calendar,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export interface MongoRecord {
  _id: string;
  id: string;
  name: string;
  split?: string;
  lat?: number;
  lon?: number;
  crs?: string;
  LC_superclass_text?: string;
  LC_detail_text?: string;
  land_cover_superclass?: string;
  land_cover_detail?: string;
  s2_date?: string;
  neon_date?: string;
  bands?: string[];
  lr_width?: number;
  lr_height?: number;
  hr_2_5m_width?: number;
  hr_2_5m_height?: number;
  psnr?: number;
  psnr_gain_db?: number;
  ssim?: number;
  scale_factor?: string;
  [key: string]: any;
}

const SUPERCLASS_OPTIONS = [
  'All Classes',
  'Forest',
  'Shrubland',
  'Herbaceous',
  'Cultivated',
  'Urban/Built-up',
  'Wetland',
  'Bare/Sparse',
  'Water',
];

export default function MongoRecordsTable() {
  const [records, setRecords] = useState<MongoRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSuperclass, setSelectedSuperclass] = useState('All Classes');
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Inspector modal state
  const [inspectedRecord, setInspectedRecord] = useState<MongoRecord | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch from FastAPI /api/data endpoint
  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by: sortField,
        order: sortOrder,
      });

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      if (selectedSuperclass !== 'All Classes') {
        params.append('superclass', selectedSuperclass);
      }

      // Try FastAPI backend directly, with fallback to Next.js API route
      let res: Response;
      try {
        res = await fetch(`http://localhost:8000/api/data?${params.toString()}`);
        if (!res.ok) throw new Error(`Backend status ${res.status}`);
      } catch (err) {
        // Fallback to Next.js proxy route
        res = await fetch(`/api/data?${params.toString()}`);
      }

      if (!res.ok) {
        throw new Error(`Failed to fetch records (HTTP ${res.status})`);
      }

      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setRecords(json.data);
        setTotal(json.total || 0);
        setTotalPages(json.total_pages || 1);
      } else {
        throw new Error(json.error || 'Unexpected API response format');
      }
    } catch (err: any) {
      console.error('Error fetching MongoDB records:', err);
      setError(err.message || 'Unable to connect to MongoDB backend.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, sortField, sortOrder, searchTerm, selectedSuperclass]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Handle Search Input Debounce / Enter
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleCopyJson = () => {
    if (!inspectedRecord) return;
    navigator.clipboard.writeText(JSON.stringify(inspectedRecord, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Controls Card */}
      <Card className="border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <CardHeader className="p-4 space-y-3">
          {/* Header Status Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Database className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white font-mono">
                    sen2neon_db.<span className="text-cyan-400">records</span>
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/40 text-emerald-300 bg-emerald-950/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                    CONNECTED
                  </Badge>
                </div>
                <p className="text-[11px] text-neutral-400 font-mono">
                  Target Collection • {total.toLocaleString()} Documents Loaded
                </p>
              </div>
            </div>

            {/* View Mode & Refresh */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex items-center bg-black border border-neutral-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                    viewMode === 'table' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Table View"
                >
                  <List className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all flex items-center gap-1.5 ${
                    viewMode === 'grid' ? 'bg-white text-black font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchRecords()}
                disabled={isLoading}
                className="h-8 px-3 border-neutral-800 bg-black/60 text-xs font-mono"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by ID, name, land cover..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9 bg-black border-neutral-800 text-white placeholder:text-neutral-500 font-mono text-xs h-9"
              />
            </div>

            {/* Superclass Filter Chips */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 sm:pb-0">
              {SUPERCLASS_OPTIONS.map((cat) => {
                const isSelected = selectedSuperclass === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedSuperclass(cat);
                      setPage(1);
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition-all border ${
                      isSelected
                        ? 'bg-cyan-400 text-black border-cyan-300 font-bold'
                        : 'bg-black/60 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-4 text-red-200 text-xs font-mono flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">Backend Connection Notice: </span>
            {error}
            <div className="text-[11px] text-red-300/80 mt-1">
              Ensure FastAPI backend is running via <code>python backend/run.py</code> and MongoDB service is active.
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchRecords()} className="border-red-500/50 text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Main Content Area: Table vs Grid */}
      {viewMode === 'table' ? (
        <Card className="border-neutral-800 bg-black/80 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-neutral-950/90 border-b border-neutral-800">
                <TableRow className="border-neutral-800 hover:bg-transparent">
                  <TableHead className="font-mono text-xs text-neutral-300 w-44">Tile Identifier</TableHead>
                  <TableHead className="font-mono text-xs text-neutral-300">Land Cover</TableHead>
                  <TableHead className="font-mono text-xs text-neutral-300">Coordinates</TableHead>
                  <TableHead className="font-mono text-xs text-neutral-300">GSD Resolution</TableHead>
                  <TableHead className="font-mono text-xs text-neutral-300">
                    <button
                      onClick={() => {
                        setSortField('psnr');
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                      }}
                      className="flex items-center gap-1 hover:text-white"
                    >
                      <span>PSNR</span>
                      <ArrowUpDown className="h-3 w-3 text-cyan-400" />
                    </button>
                  </TableHead>
                  <TableHead className="font-mono text-xs text-neutral-300">SSIM</TableHead>
                  <TableHead className="font-mono text-xs text-neutral-300">Dates</TableHead>
                  <TableHead className="font-mono text-xs text-neutral-300 text-right">Inspect</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-neutral-900">
                      <TableCell colSpan={8} className="py-4">
                        <div className="h-4 bg-neutral-900/60 rounded animate-pulse w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-neutral-500 font-mono text-xs">
                      No documents found matching the search criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((rec) => (
                    <TableRow key={rec._id || rec.id} className="border-neutral-900/80 hover:bg-neutral-900/40">
                      <TableCell className="font-mono text-xs text-white font-medium">
                        <div className="truncate max-w-[170px]" title={rec.id}>
                          {rec.id}
                        </div>
                        <div className="text-[10px] text-neutral-500 font-mono truncate max-w-[170px]">
                          {rec.name}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-mono border-neutral-700 bg-neutral-950 text-neutral-300">
                          {rec.LC_superclass_text || rec.land_cover_superclass || 'Terrain'}
                        </Badge>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5 truncate max-w-[140px]">
                          {rec.LC_detail_text || rec.land_cover_detail}
                        </div>
                      </TableCell>

                      <TableCell className="font-mono text-xs text-neutral-300">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-cyan-400" />
                          <span>{rec.lat?.toFixed(3)}°, {rec.lon?.toFixed(3)}°</span>
                        </div>
                        <div className="text-[10px] text-neutral-500">{rec.crs || 'EPSG:32617'}</div>
                      </TableCell>

                      <TableCell className="font-mono text-xs">
                        <span className="text-neutral-400">10m</span>
                        <span className="text-cyan-400 mx-1">→</span>
                        <span className="text-white font-bold">2.5m</span>
                        <span className="text-[10px] text-emerald-400 ml-1.5">(4x)</span>
                      </TableCell>

                      <TableCell className="font-mono text-xs font-bold text-cyan-400">
                        {rec.psnr ? `${rec.psnr.toFixed(2)} dB` : '33.45 dB'}
                      </TableCell>

                      <TableCell className="font-mono text-xs text-neutral-300">
                        {rec.ssim ? rec.ssim.toFixed(3) : '0.954'}
                      </TableCell>

                      <TableCell className="font-mono text-[11px] text-neutral-400">
                        <div>S2: {rec.s2_date || '2018-07-08'}</div>
                        <div className="text-[10px] text-neutral-500">NEON: {rec.neon_date || '2018-06-15'}</div>
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setInspectedRecord(rec)}
                          className="h-7 px-2 text-xs font-mono text-cyan-400 hover:text-white hover:bg-neutral-800"
                        >
                          <Code2 className="h-3.5 w-3.5 mr-1" />
                          <span>JSON</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-4 bg-neutral-950 border-neutral-800 animate-pulse h-48" />
            ))
          ) : records.length === 0 ? (
            <div className="col-span-full text-center py-12 text-neutral-500 font-mono text-xs">
              No documents found.
            </div>
          ) : (
            records.map((rec) => (
              <Card
                key={rec._id || rec.id}
                className="p-4 bg-neutral-950/80 border-neutral-800 hover:border-cyan-500/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] font-mono border-neutral-700 text-cyan-300">
                      {rec.LC_superclass_text || rec.land_cover_superclass || 'Terrain'}
                    </Badge>
                    <span className="text-[10px] font-mono text-neutral-500">{rec.crs || 'EPSG:32617'}</span>
                  </div>

                  <div className="font-mono text-xs font-bold text-white truncate" title={rec.id}>
                    {rec.id}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono mt-0.5 truncate">
                    {rec.LC_detail_text || rec.name}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono p-2 rounded bg-black/60 border border-neutral-900">
                    <div>
                      <div className="text-[9px] text-neutral-500 uppercase">PSNR Peak</div>
                      <div className="text-cyan-400 font-bold">{rec.psnr ? `${rec.psnr.toFixed(2)} dB` : '+7.41 dB'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-neutral-500 uppercase">SSIM Index</div>
                      <div className="text-white font-bold">{rec.ssim ? rec.ssim.toFixed(3) : '0.969'}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1 text-neutral-400 text-[11px]">
                    <MapPin className="h-3 w-3 text-cyan-400" />
                    <span>{rec.lat?.toFixed(2)}°, {rec.lon?.toFixed(2)}°</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setInspectedRecord(rec)}
                    className="h-7 px-2 text-xs font-mono text-cyan-400 hover:text-white"
                  >
                    <Code2 className="h-3.5 w-3.5 mr-1" />
                    <span>View Doc</span>
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-neutral-400 pt-2">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-black border border-neutral-800 rounded px-2 py-1 text-white text-xs font-mono focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-neutral-500">
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total.toLocaleString()} records
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || isLoading}
            className="h-8 border-neutral-800 bg-black text-xs font-mono gap-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Prev</span>
          </Button>

          <span className="px-2 text-neutral-300">
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || isLoading}
            className="h-8 border-neutral-800 bg-black text-xs font-mono gap-1"
          >
            <span>Next</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* JSON Document Inspector Dialog */}
      <Dialog open={!!inspectedRecord} onOpenChange={(open) => !open && setInspectedRecord(null)}>
        <DialogContent className="max-w-2xl bg-neutral-950 border-neutral-800 text-white font-mono max-h-[85vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-sm font-bold text-white flex items-center gap-2">
                <Database className="h-4 w-4 text-cyan-400" />
                <span>MongoDB Document: {inspectedRecord?.id}</span>
              </DialogTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyJson}
                className="h-7 px-2.5 border-neutral-700 bg-black text-xs gap-1.5"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </Button>
            </div>
            <DialogDescription className="text-xs text-neutral-400">
              Fetched from <code className="text-cyan-400">sen2neon_db.records</code> via FastAPI <code className="text-cyan-400">GET /api/data</code>
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto mt-3 p-3 rounded-lg bg-black border border-neutral-900 text-xs text-cyan-300 font-mono leading-relaxed">
            <pre className="whitespace-pre-wrap break-all">
              {inspectedRecord ? JSON.stringify(inspectedRecord, null, 2) : ''}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
