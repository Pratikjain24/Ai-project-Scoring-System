import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { DataTable } from '../components/ui/DataTable';
import type { Column } from '../components/ui/DataTable';
import { MOCK_EVALUATIONS } from '../data/mockEvaluationsList';
import type { ProjectEvaluationItem } from '../data/mockEvaluationsList';
import { api } from '../services/api';

export const EvaluationsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [projectsList, setProjectsList] = useState<ProjectEvaluationItem[]>(MOCK_EVALUATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Software' | 'Hardware'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Analyzing' | 'Needs Review' | 'Failed'>('All');
  const [scoreFilter, setScoreFilter] = useState<'All' | 'high' | 'mid' | 'low'>('All');
  const [sortBy, setSortBy] = useState<'updated' | 'score' | 'originality' | 'impact' | 'technical'>('updated');

  React.useEffect(() => {
    let mounted = true;
    api.getProjects().then((data) => {
      if (mounted && data && data.length > 0) {
        setProjectsList(data.map((p: any) => ({
          ...p,
          overallScore: p.overallScore || 84.7,
          originalityScore: p.originalityScore || 68,
          impactScore: p.impactScore || 92,
          technicalScore: p.technicalScore || 87,
          status: p.status || 'Completed',
          updatedAt: p.updatedAt || 'Recently',
        })));
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const filteredProjects = useMemo(() => {
    return projectsList.filter((item) => {
      // Search query
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.team.toLowerCase().includes(searchQuery.toLowerCase());

      // Type
      const matchesType = typeFilter === 'All' || item.type === typeFilter;

      // Status
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;

      // Score
      let matchesScore = true;
      if (scoreFilter === 'high') matchesScore = item.overallScore >= 85;
      else if (scoreFilter === 'mid') matchesScore = item.overallScore >= 70 && item.overallScore < 85;
      else if (scoreFilter === 'low') matchesScore = item.overallScore < 70;

      return matchesSearch && matchesType && matchesStatus && matchesScore;
    }).sort((a, b) => {
      if (sortBy === 'score') return b.overallScore - a.overallScore;
      if (sortBy === 'originality') return b.originalityScore - a.originalityScore;
      if (sortBy === 'impact') return b.impactScore - a.impactScore;
      if (sortBy === 'technical') return b.technicalScore - a.technicalScore;
      return 0; // Default ordering
    });
  }, [searchQuery, typeFilter, statusFilter, scoreFilter, sortBy]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="emerald" dot>Completed</Badge>;
      case 'Analyzing':
        return <Badge variant="cyan" dot pulse>Analyzing</Badge>;
      case 'Needs Review':
        return <Badge variant="amber" dot>Needs Review</Badge>;
      case 'Failed':
        return <Badge variant="rose" dot>Failed</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-cyan-400';
    if (score >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const columns: Column<ProjectEvaluationItem>[] = [
    {
      key: 'name',
      header: 'Project',
      sortable: true,
      render: (item) => (
        <div>
          <span className="font-semibold text-slate-100 dark:text-slate-100 light:text-slate-900 group-hover:text-cyan-400 transition-colors block text-sm">
            {item.name}
          </span>
          <span className="text-[11px] text-slate-400 truncate max-w-xs block font-sans">
            {item.domain} • <span className="text-slate-500">{item.team}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (item) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
          {item.type}
        </span>
      ),
    },
    {
      key: 'overallScore',
      header: 'Overall Score',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5">
          <span className={`font-mono text-sm font-bold ${getScoreColor(item.overallScore)}`}>
            {item.overallScore.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">/100</span>
        </div>
      ),
    },
    {
      key: 'originalityScore',
      header: 'Originality',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-slate-300">{item.originalityScore}%</span>
      ),
    },
    {
      key: 'impactScore',
      header: 'Impact',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-slate-300">{item.impactScore}%</span>
      ),
    },
    {
      key: 'technicalScore',
      header: 'Technical',
      sortable: true,
      render: (item) => (
        <span className="font-mono text-slate-300">{item.technicalScore}%</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => getStatusBadge(item.status),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: (item) => (
        <span className="text-slate-400 font-mono text-[11px]">{item.updatedAt}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 dark:text-slate-100 light:text-slate-900 tracking-tight">
            Evaluation Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and inspect evidence dossiers across all software and hardware cohorts
          </p>
        </div>

        <Link to="/new-evaluation">
          <Button variant="primary" size="sm" className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" />
            <span>+ New Evaluation</span>
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 bg-slate-900/60 border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search query input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name, domain, team, or problem keywords..."
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Quick Filter Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Project Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              aria-label="Filter by project type"
              className="text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Types</option>
              <option value="Software">Software Only</option>
              <option value="Hardware">Hardware Only</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              aria-label="Filter by evaluation status"
              className="text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Analyzing">Analyzing</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Failed">Failed</option>
            </select>

            {/* Score Range */}
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value as any)}
              aria-label="Filter by score tier"
              className="text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="All">All Scores</option>
              <option value="high">&gt; 85 (Exceptional)</option>
              <option value="mid">70 - 85 (Strong)</option>
              <option value="low">&lt; 70 (Needs Review)</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Sort evaluations by"
              className="text-xs px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="updated">Sort: Recent</option>
              <option value="score">Sort: Score</option>
              <option value="originality">Sort: Originality</option>
              <option value="impact">Sort: Impact</option>
              <option value="technical">Sort: Technical</option>
            </select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <div>
            Showing <strong className="text-slate-200">{filteredProjects.length}</strong> of{' '}
            <strong className="text-slate-200">{MOCK_EVALUATIONS.length}</strong> evaluated projects
          </div>
          {(searchQuery || typeFilter !== 'All' || statusFilter !== 'All' || scoreFilter !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('All');
                setStatusFilter('All');
                setScoreFilter('All');
              }}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </Card>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredProjects}
        keyField="id"
        onRowClick={(item) => navigate(`/evaluations/${item.id}`)}
        emptyTitle="No evaluations matched your search"
        emptyDescription="Try clearing your filters or changing the search keyword."
      />
    </div>
  );
};
