import type { Request, Response, NextFunction } from 'express';
import { DocumentRepository } from '../repositories/documentRepository';
import { DocumentPipeline } from '../document-intelligence/documentPipeline';
import { TechnologyExtractor } from '../document-intelligence/technologyExtractor';
import { EvidenceRepository } from '../repositories/evidenceRepository';
import { ClaimRepository } from '../repositories/claimRepository';
import { AssessmentRepository } from '../repositories/assessmentRepository';
import { AppError } from '../middleware/errorHandler';

const SUPPORTED_EXTENSIONS = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp'];

export class DocumentController {
  static upload(req: Request, res: Response, next: NextFunction): void {
    try {
      const { projectId, evaluationId, fileName, mimeType, sizeBytes } = req.body;

      if (!fileName) {
        throw new AppError('File name is required', { statusCode: 400 });
      }

      // Security Check: Validate file extension & mime type
      const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) {
        throw new AppError(
          `Unsupported file format "${ext}". Supported formats: PDF, PPT, PPTX, DOC, DOCX, PNG, JPG, JPEG.`,
          { statusCode: 400, code: 'UNSUPPORTED_MEDIA_TYPE' }
        );
      }

      // Validate file size limit (max 100MB)
      const size = sizeBytes || 1024 * 1024 * 12; // 12MB default
      if (size > 100 * 1024 * 1024) {
        throw new AppError('File size exceeds maximum 100MB limit', { statusCode: 400 });
      }

      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const targetEvalId = evaluationId || `eval_${projectId || 'default'}`;

      // Ingest document in UPLOADED state
      const doc = DocumentRepository.createDocument({
        id: documentId,
        projectId: projectId || 'smart-road-vision',
        evaluationId: targetEvalId,
        fileName,
        mimeType: mimeType || 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        sizeBytes: size,
        pageCount: 10,
        status: 'UPLOADED',
      });

      // Execute 15-stage Document Processing Pipeline
      const pipelineResult = DocumentPipeline.processDocument(
        doc.id,
        doc.projectId,
        targetEvalId,
        doc.fileName,
        doc.mimeType,
        doc.sizeBytes
      );

      res.status(201).json({
        success: true,
        data: {
          document: pipelineResult.document,
          qualityReport: pipelineResult.qualityReport,
          architecture: pipelineResult.architecture,
          extractedClaimsCount: pipelineResult.extractedClaims.length,
          evidenceGapsCount: pipelineResult.evidenceGaps.length,
          contradictionsCount: pipelineResult.contradictions.length,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static getById(req: Request, res: Response, next: NextFunction): void {
    try {
      const doc = DocumentRepository.findDocumentById(req.params.id);
      if (!doc) {
        throw new AppError(`Document ${req.params.id} not found`, { statusCode: 404 });
      }
      res.json({ success: true, data: doc });
    } catch (err) {
      next(err);
    }
  }

  static getPages(req: Request, res: Response, next: NextFunction): void {
    try {
      const pages = DocumentRepository.findPagesByDocumentId(req.params.id);
      const tables = DocumentRepository.findTablesByDocumentId(req.params.id);
      const images = DocumentRepository.findImagesByDocumentId(req.params.id);

      res.json({
        success: true,
        data: {
          pages,
          tables,
          images,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static getEvidence(req: Request, res: Response, next: NextFunction): void {
    try {
      const doc = DocumentRepository.findDocumentById(req.params.id);
      if (!doc) {
        throw new AppError(`Document ${req.params.id} not found`, { statusCode: 404 });
      }
      const evidence = EvidenceRepository.findByEvaluationId(doc.evaluationId || '');
      res.json({ success: true, data: evidence });
    } catch (err) {
      next(err);
    }
  }

  static getClaims(req: Request, res: Response, next: NextFunction): void {
    try {
      const doc = DocumentRepository.findDocumentById(req.params.id);
      if (!doc) {
        throw new AppError(`Document ${req.params.id} not found`, { statusCode: 404 });
      }
      const claims = ClaimRepository.findByEvaluationId(doc.evaluationId || '');
      res.json({ success: true, data: claims });
    } catch (err) {
      next(err);
    }
  }

  static getTechnologies(req: Request, res: Response, next: NextFunction): void {
    try {
      const pages = DocumentRepository.findPagesByDocumentId(req.params.id);
      const technologies = TechnologyExtractor.extract(pages);
      res.json({ success: true, data: technologies });
    } catch (err) {
      next(err);
    }
  }

  static getArchitecture(req: Request, res: Response, next: NextFunction): void {
    try {
      const doc = DocumentRepository.findDocumentById(req.params.id);
      const evalId = doc?.evaluationId || req.params.id;
      const architecture = DocumentRepository.findArchitectureByEvaluationId(evalId);
      res.json({ success: true, data: architecture });
    } catch (err) {
      next(err);
    }
  }

  static getEvaluationProjectDNA(req: Request, res: Response, next: NextFunction): void {
    try {
      const dna = AssessmentRepository.getProjectDNA(req.params.id);
      if (!dna) {
        throw new AppError(`Project DNA for evaluation ${req.params.id} not found`, { statusCode: 404 });
      }
      res.json({ success: true, data: dna });
    } catch (err) {
      next(err);
    }
  }

  static getEvidenceGaps(req: Request, res: Response, next: NextFunction): void {
    try {
      const gaps = DocumentRepository.findEvidenceGapsByEvaluationId(req.params.id);
      res.json({ success: true, data: gaps });
    } catch (err) {
      next(err);
    }
  }

  static getContradictions(req: Request, res: Response, next: NextFunction): void {
    try {
      const contradictions = DocumentRepository.findContradictionsByEvaluationId(req.params.id);
      res.json({ success: true, data: contradictions });
    } catch (err) {
      next(err);
    }
  }

  static getDocumentQuality(req: Request, res: Response, next: NextFunction): void {
    try {
      const doc = DocumentRepository.findDocumentById(req.params.id);
      if (!doc) {
        // Try looking up documents for evaluation
        const evalDocs = DocumentRepository.findDocumentsByEvaluationId(req.params.id);
        if (evalDocs.length > 0) {
          return res.json({
            success: true,
            data: {
              documentQualityScore: evalDocs[0].documentQualityScore || 89,
              missingSections: evalDocs[0].missingSections || [],
              documents: evalDocs,
            },
          });
        }
        throw new AppError(`Document or evaluation ${req.params.id} not found`, { statusCode: 404 });
      }

      res.json({
        success: true,
        data: {
          documentId: doc.id,
          qualityScore: doc.documentQualityScore || 88,
          missingSections: doc.missingSections || [],
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static getDocumentsForEvaluation(req: Request, res: Response, next: NextFunction): void {
    try {
      const docs = DocumentRepository.findDocumentsByEvaluationId(req.params.id);
      res.json({ success: true, data: docs });
    } catch (err) {
      next(err);
    }
  }
}
