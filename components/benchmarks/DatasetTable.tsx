'use client';

import React, { useState } from 'react';
import { BENCHMARK_RECORDS } from '@/lib/presets';
import { Search, ArrowUpDown, Award, Sparkles, Filter, Database, BarChart3, Layers } from 'lucide-react';
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
import { Card, CardHeader } from '@/components/ui/card';
import MongoRecordsTable from './MongoRecordsTable';

export default function DatasetTable() {
  const [activeTab, setActiveTab] = useState<'mongodb' | 'benchmarks'>('mongodb');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'psnr' | 'ssim' | 'latency'>('psnr');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = BENCHMARK_RECORDS.filter((rec) =>
    rec.dataset.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rec.mission.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    let valA = a.dualBranchPsnr;
    let valB = b.dualBranchPsnr;
    if (sortField === 'ssim') {
      valA = a.dualBranchSsim;
      valB = b.dualBranchSsim;
    } else if (sortField === 'latency') {
      valA = a.latencyMs;
      valB = b.latencyMs;
    }
    return sortAsc ? valA - valB : valB - valA;
  });

  return (
    <div className="space-y-6">
      {/* Primary Tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div className="flex items-center gap-2 bg-black border border-neutral-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('mongodb')}
            className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
              activeTab === 'mongodb'
                ? 'bg-cyan-400 text-black font-bold shadow-md shadow-cyan-500/20'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            <span>MongoDB Records (sen2neon_db.records)</span>
          </button>
          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`px-4 py-2 rounded-lg text-xs font-mono transition-all flex items-center gap-2 ${
              activeTab === 'benchmarks'
                ? 'bg-white text-black font-bold'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Algorithm Benchmark Suite</span>
          </button>
        </div>

        <div className="text-xs font-mono text-neutral-400">
          Source: <span className="text-cyan-400 font-semibold">{activeTab === 'mongodb' ? 'FastAPI + MongoDB' : 'Static Validation Runs'}</span>
        </div>
      </div>

      {/* Tab 1: Live MongoDB Database Explorer */}
      {activeTab === 'mongodb' && (
        <MongoRecordsTable />
      )}

      {/* Tab 2: Comparative Architecture Benchmark Suite */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-4">
          <Card className="border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
            <CardHeader className="p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <Input
                    type="text"
                    placeholder="Filter by dataset or mission..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-black border-neutral-800 text-white placeholder:text-neutral-500 font-mono text-xs"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-neutral-400 w-full sm:w-auto justify-end">
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Filter className="h-3 w-3" />
                    Sort:
                  </span>
                  <Button
                    variant={sortField === 'psnr' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSortField('psnr');
                      setSortAsc(!sortAsc);
                    }}
                    className="h-8 text-xs font-mono"
                  >
                    <span>PSNR (dB)</span>
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </Button>
                  <Button
                    variant={sortField === 'ssim' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSortField('ssim');
                      setSortAsc(!sortAsc);
                    }}
                    className="h-8 text-xs font-mono"
                  >
                    <span>SSIM</span>
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </Button>
                  <Button
                    variant={sortField === 'latency' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSortField('latency');
                      setSortAsc(!sortAsc);
                    }}
                    className="h-8 text-xs font-mono"
                  >
                    <span>Latency</span>
                    <ArrowUpDown className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Table>
            <TableHeader>
              <TableRow className="border-b border-neutral-800 bg-neutral-950">
                <TableHead className="w-[200px] text-neutral-300 font-mono text-xs">Dataset / Mission</TableHead>
                <TableHead className="text-neutral-300 font-mono text-xs">Scale</TableHead>
                <TableHead className="text-neutral-400 font-mono text-xs">Bicubic Baseline</TableHead>
                <TableHead className="text-neutral-400 font-mono text-xs">SRCNN Baseline</TableHead>
                <TableHead className="text-neutral-300 font-mono text-xs">RCAN-Geo Net</TableHead>
                <TableHead className="text-white font-bold bg-neutral-900 font-mono text-xs">
                  Our Model (Dual-Branch)
                </TableHead>
                <TableHead className="text-neutral-300 font-mono text-xs">Inference Latency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-neutral-400 font-mono text-xs">
                    No matching datasets or missions found.
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((row) => (
                  <TableRow key={row.id} className="border-b border-neutral-900 hover:bg-neutral-900/50 font-mono text-xs">
                    <TableCell>
                      <div className="font-semibold text-white">{row.dataset}</div>
                      <div className="text-[10px] text-neutral-400 flex items-center gap-1 mt-0.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 inline-block"></span>
                        {row.mission}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] border-neutral-700 text-white font-mono">
                        {row.scale}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-400">
                      {row.bicubicPsnr} dB / {row.bicubicSsim}
                    </TableCell>
                    <TableCell className="text-neutral-300">
                      {row.srcnnPsnr} dB / {row.srcnnSsim}
                    </TableCell>
                    <TableCell className="text-white font-bold">
                      {row.rcanPsnr} dB / {row.rcanSsim}
                    </TableCell>
                    <TableCell className="font-bold text-white bg-neutral-900/80">
                      <div className="flex items-center gap-1.5">
                        <Award className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span>
                          {row.dualBranchPsnr} dB / {row.dualBranchSsim}
                        </span>
                      </div>
                      <div className="text-[10px] text-cyan-300 font-mono">
                        (+{(row.dualBranchPsnr - row.bicubicPsnr).toFixed(2)} dB gain)
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono">
                        {row.latencyMs} ms
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
