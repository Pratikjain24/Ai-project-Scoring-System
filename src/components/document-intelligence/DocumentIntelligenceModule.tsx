import React, { useState, useEffect } from 'react';
import {
  FileText,
  Layers,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Table as TableIcon,
  Image as ImageIcon,
  ArrowRight,
  ExternalLink,
  Split,
  Loader2,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { api } from '../../services/api';

interface DocumentIntelligenceModuleProps {
  evaluationId?: string;
  onBackToOverview?: () => void;
  onViewClaims?: () => void;
  onViewProjectDNA?: () => void;
}

export const DocumentIntelligenceModule: React.FC<DocumentIntelligenceModuleProps> = ({
  evaluationId = 'eval_smart-road-vision',
  onBackToOverview,
  onViewClaims,
  onViewProjectDNA,
}) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('doc_srv_pitchdeck');
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [pagesData, setPagesData] = useState<{ pages: any[]; tables: any[]; images: any[] }>({
    pages: [],
    tables: [],
    images: [],
  });
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [evidenceGaps, setEvidenceGaps] = useState<any[]>([]);
  const [contradictions, setContradictions] = useState<any[]>([]);
  const [qualityData, setQualityData] = useState<any>(null);
  const [highlightedSource, setHighlightedSource] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [docsRes, gapsRes, contrasRes, qualityRes] = await Promise.all([
          api.getDocumentsForEvaluation(evaluationId),
          api.getEvaluationEvidenceGaps(evaluationId),
          api.getEvaluationContradictions(evaluationId),
          api.getEvaluationDocumentQuality(evaluationId),
        ]);

        if (isMounted) {
          const docs = docsRes && docsRes.length > 0 ? docsRes : [
            {
              id: 'doc_srv_pitchdeck',
              fileName: 'SmartRoadVision_PitchDeck.pptx',
              mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              pageCount: 10,
              sizeBytes: 14200000,
              status: 'COMPLETED',
              documentQualityScore: 92,
            },
            {
              id: 'doc_srv_whitepaper',
              fileName: 'SmartRoadVision_Technical_Whitepaper.pdf',
              mimeType: 'application/pdf',
              pageCount: 4,
              sizeBytes: 4800000,
              status: 'COMPLETED',
              documentQualityScore: 88,
            },
          ];

          setDocuments(docs);
          setSelectedDocId(docs[0].id);
          setEvidenceGaps(gapsRes || []);
          setContradictions(contrasRes || []);
          setQualityData(qualityRes || { documentQualityScore: 90, missingSections: [] });
        }
      } catch (err) {
        console.warn('Failed to load Document Intelligence data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [evaluationId]);

  // Load pages, tables, images, technologies for selected document
  useEffect(() => {
    let isMounted = true;
    const loadDocPages = async () => {
      if (!selectedDocId) return;
      try {
        const [pagesRes, techRes] = await Promise.all([
          api.getDocumentPages(selectedDocId),
          api.getDocumentTechnologies(selectedDocId),
        ]);

        if (isMounted) {
          setPagesData(pagesRes);
          setTechnologies(techRes || []);
          setCurrentSlideIndex(0);
        }
      } catch (err) {
        console.warn('Failed to load document pages:', err);
      }
    };

    loadDocPages();
    return () => { isMounted = false; };
  }, [selectedDocId]);

  const activeDoc = documents.find(d => d.id === selectedDocId) || documents[0];
  const currentPage = pagesData.pages[currentSlideIndex] || {
    pageNumber: 1,
    title: 'Loading Slide Content...',
    text: 'Ingesting multimodal elements...',
    detectedTopics: [],
  };

  const currentTables = pagesData.tables.filter(t => t.pageNumber === currentPage.pageNumber);
  const currentImages = pagesData.images.filter(img => img.pageNumber === currentPage.pageNumber);

  const handleNextSlide = () => {
    if (currentSlideIndex < pagesData.pages.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleJumpToSlide = (slideNum: number) => {
    const idx = pagesData.pages.findIndex(p => p.pageNumber === slideNum);
    if (idx !== -1) {
      setCurrentSlideIndex(idx);
      setHighlightedSource(`Slide ${slideNum}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3 text-cyan-400 font-mono text-xs">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
        <span>Parsing multimodal document intelligence...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner with Quality Indicator & Back Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100">
                Document Intelligence Engine
              </h2>
              <Badge variant="cyan" dot>Autonomous Parser</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Structural multimodal extraction across presentations, whitepapers, schematics, and tabular benchmarks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Quality Score Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Doc Quality:
            </span>
            <span className="text-sm font-black font-mono text-emerald-400">
              {qualityData?.documentQualityScore || 90}/100
            </span>
          </div>

          {onBackToOverview && (
            <Button variant="outline" size="sm" onClick={onBackToOverview} className="text-xs">
              Overview
            </Button>
          )}
        </div>
      </div>

      {/* 3-COLUMN WORKBENCH */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================
            COLUMN 1: DOCUMENT SELECTOR (3 cols)
           ============================================================ */}
        <div className="lg:col-span-3 space-y-4">
          <Card className="p-4 border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
                Ingested Documents ({documents.length})
              </span>
              <Badge variant="neutral">{documents.length} Files</Badge>
            </div>

            {/* Document list */}
            <div className="space-y-2">
              {documents.map((doc) => {
                const isSelected = doc.id === selectedDocId;
                const isPpt = doc.fileName.toLowerCase().includes('.ppt');
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/50 shadow-md shadow-cyan-950/40'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-lg ${isPpt ? 'bg-amber-950/40 text-amber-400' : 'bg-cyan-950/40 text-cyan-400'}`}>
                        {isPpt ? <Layers className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-slate-200 truncate">
                          {doc.fileName}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                          <span>{doc.pageCount || 10} {isPpt ? 'slides' : 'pages'}</span>
                          <span>•</span>
                          <span>{(doc.sizeBytes / (1024 * 1024)).toFixed(1)} MB</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Fully Parsed
                      </span>
                      <span className="text-slate-400">
                        Score: {doc.documentQualityScore || 90}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Quick Stats on Active Document */}
          <Card className="p-4 border-slate-800 bg-slate-900/40 space-y-2.5 text-xs">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Document Structural Metrics
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Total Units</span>
                <span className="text-sm font-bold text-slate-200">{pagesData.pages.length} Pages</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Tables Found</span>
                <span className="text-sm font-bold text-cyan-400">{pagesData.tables.length} Tables</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Visual Schematics</span>
                <span className="text-sm font-bold text-emerald-400">{pagesData.images.length} Visuals</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Identified Tech</span>
                <span className="text-sm font-bold text-amber-400">{technologies.length} Stack Items</span>
              </div>
            </div>
          </Card>
        </div>

        {/* ============================================================
            COLUMN 2: SLIDE / PAGE INTERACTIVE CANVAS (5 cols)
           ============================================================ */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 sm:p-6 border-slate-800 bg-slate-900/80 shadow-xl space-y-5">
            {/* Slide Navigation Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-bold">
                  Slide {currentPage.pageNumber} of {pagesData.pages.length || 10}
                </span>
                <span className="text-xs text-slate-400 truncate max-w-[180px]">
                  {activeDoc.fileName}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevSlide}
                  disabled={currentSlideIndex === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNextSlide}
                  disabled={currentSlideIndex >= pagesData.pages.length - 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Slide Canvas Content */}
            <div className="space-y-4">
              {/* Title & Topic Badges */}
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                  {currentPage.title}
                </h3>
                {currentPage.detectedTopics && currentPage.detectedTopics.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2">
                    {currentPage.detectedTopics.map((topic: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Segmented Text Block with Highlight Sync */}
              <div
                className={`p-4 rounded-xl border transition-all text-xs leading-relaxed ${
                  highlightedSource === `Slide ${currentPage.pageNumber}`
                    ? 'bg-cyan-950/40 border-cyan-400/80 shadow-lg shadow-cyan-950/30 text-cyan-100 ring-1 ring-cyan-500'
                    : 'bg-slate-950/70 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-2">
                  <span>SEGMENTED TEXT BLOCK</span>
                  <span>CONFIDENCE: {(currentPage.confidence * 100).toFixed(0)}%</span>
                </div>
                <p>{currentPage.text}</p>
              </div>

              {/* Preserved Tables on this slide */}
              {currentTables.length > 0 && (
                <div className="space-y-3 pt-2">
                  {currentTables.map((tbl) => (
                    <div key={tbl.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 font-mono">
                        <TableIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{tbl.caption || 'Extracted Table Data'}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] font-mono">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400">
                              {tbl.headers.map((h: string, idx: number) => (
                                <th key={idx} className="py-1.5 px-2">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tbl.rows.map((row: string[], rIdx: number) => (
                              <tr key={rIdx} className="border-b border-slate-900 hover:bg-slate-900/50">
                                {row.map((cell: string, cIdx: number) => (
                                  <td key={cIdx} className="py-1.5 px-2 text-slate-300">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Extracted Diagram / Visuals on this slide */}
              {currentImages.length > 0 && (
                <div className="space-y-3 pt-2">
                  {currentImages.map((img) => (
                    <div key={img.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-300">
                          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{img.type.replace('_', ' ')}</span>
                        </span>
                        <Badge variant="emerald" dot>
                          {img.identificationState}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 italic">
                        "{img.caption}"
                      </p>

                      {img.details?.components && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
                          {img.details.components.map((c: string, cIdx: number) => (
                            <span key={cIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-300 border border-emerald-500/30">
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Slide Navigation Thumbnails Bar */}
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase mb-2">
                Slide Navigator:
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {pagesData.pages.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentSlideIndex(idx)}
                    className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                      idx === currentSlideIndex
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 scale-105'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {p.pageNumber}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* ============================================================
            COLUMN 3: AI INTELLIGENCE PANEL (4 cols)
           ============================================================ */}
        <div className="lg:col-span-4 space-y-4">
          {/* Extracted Project Claims (Marked as CLAIMED) */}
          <Card className="p-4 border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
                  Extracted Claims (Status: CLAIMED)
                </span>
              </div>
              {onViewClaims && (
                <button
                  onClick={onViewClaims}
                  className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Verify</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              <div
                onClick={() => handleJumpToSlide(7)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="amber" dot>CLAIMED</Badge>
                  <span className="text-[10px] font-mono text-cyan-400 underline">Slide 7</span>
                </div>
                <p className="text-xs text-slate-200">
                  "Model achieves 95.4% mAP50 anomaly detection accuracy across 12 distinct asphalt crack patterns."
                </p>
                <div className="text-[10px] font-mono text-slate-500">
                  Type: ACCURACY • Importance: CRITICAL
                </div>
              </div>

              <div
                onClick={() => handleJumpToSlide(7)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="amber" dot>CLAIMED</Badge>
                  <span className="text-[10px] font-mono text-cyan-400 underline">Slide 7</span>
                </div>
                <p className="text-xs text-slate-200">
                  "Edge inference pipeline sustains 54 FPS throughput with &lt;18ms latency on NVIDIA Jetson Orin Nano."
                </p>
                <div className="text-[10px] font-mono text-slate-500">
                  Type: PERFORMANCE • Importance: HIGH
                </div>
              </div>

              <div
                onClick={() => handleJumpToSlide(9)}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="amber" dot>CLAIMED</Badge>
                  <span className="text-[10px] font-mono text-cyan-400 underline">Slide 9</span>
                </div>
                <p className="text-xs text-slate-200">
                  "Reduces municipal reactive repair expenditure by up to $4.2M annually."
                </p>
                <div className="text-[10px] font-mono text-slate-500">
                  Type: FEASIBILITY • Importance: HIGH
                </div>
              </div>
            </div>
          </Card>

          {/* Evidence Gaps Alert Card */}
          {evidenceGaps.length > 0 && (
            <Card className="p-4 border-amber-500/30 bg-amber-950/20 space-y-2.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase font-mono tracking-wider text-amber-300">
                  Detected Evidence Gaps ({evidenceGaps.length})
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Empirical claims identified without complete test dataset distributions or independent field benchmarks.
              </p>
              <div className="space-y-1.5 text-[10px] font-mono text-amber-200/90">
                {evidenceGaps.slice(0, 2).map((gap, i) => (
                  <div key={i} className="p-2 rounded bg-slate-950/60 border border-amber-500/20">
                    <span className="text-amber-400 font-bold block">[{gap.severity} GAP] {gap.claimText.slice(0, 45)}...</span>
                    <span className="text-slate-400">Missing: {gap.missingElements?.[0] || 'Validation dataset sample count'}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Internal Contradictions Card */}
          {contradictions.length > 0 && (
            <Card className="p-4 border-rose-500/30 bg-rose-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase font-mono tracking-wider text-rose-300 flex items-center gap-1.5">
                  <Split className="w-3.5 h-3.5 text-rose-400" />
                  Internal Discrepancy Flagged
                </span>
                <Badge variant="rose">Investigate</Badge>
              </div>
              <div className="text-xs text-slate-200 p-2.5 rounded bg-slate-950/70 border border-rose-500/20 space-y-1">
                <div className="text-[10px] font-mono text-rose-400 font-bold">
                  {contradictions[0].difference}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                  <button onClick={() => handleJumpToSlide(7)} className="text-cyan-400 hover:underline">
                    Slide 7: 95.4%
                  </button>
                  <span>vs</span>
                  <button onClick={() => handleJumpToSlide(8)} className="text-cyan-400 hover:underline">
                    Slide 8: 91.2%
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* Identified Technologies on this Document */}
          <Card className="p-4 border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase font-mono tracking-wider text-slate-300">
                  Extracted Tech Stack
                </span>
              </div>
              {onViewProjectDNA && (
                <button
                  onClick={onViewProjectDNA}
                  className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Project DNA</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {technologies.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const slideMatch = t.evidenceLocation?.match(/\d+/);
                    if (slideMatch) handleJumpToSlide(parseInt(slideMatch[0]));
                  }}
                  className="text-[10px] font-mono px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 hover:border-cyan-500 hover:text-cyan-300 transition-all flex items-center gap-1"
                >
                  <span>{t.name}</span>
                  <span className="text-slate-600 text-[9px]">{t.evidenceLocation}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
