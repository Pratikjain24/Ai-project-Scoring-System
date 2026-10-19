import { Router } from 'express';
import { VideoController } from '../controllers/videoController';

export const videoRouter = Router();

videoRouter.post('/', VideoController.upload);
videoRouter.get('/memory-profile', VideoController.getMemoryProfile);
videoRouter.get('/memory-guard/status', VideoController.getMemoryGuardStatus);
videoRouter.get('/:id', VideoController.getById);
videoRouter.post('/:id/analyze', VideoController.analyze);
videoRouter.get('/:id/status', VideoController.getStatus);
videoRouter.get('/:id/keyframes', VideoController.getKeyframes);
videoRouter.post('/:id/extract-keyframes', VideoController.extractKeyframes);
videoRouter.get('/:id/transcript', VideoController.getTranscript);
videoRouter.get('/:id/timeline', VideoController.getTimeline);
videoRouter.get('/:id/events', VideoController.getEvents);
videoRouter.get('/:id/observations', VideoController.getObservations);
videoRouter.get('/:id/demo', VideoController.getDemo);
videoRouter.get('/:id/milestones', VideoController.getMilestones);
videoRouter.get('/:id/anomalies', VideoController.getAnomalies);
videoRouter.get('/:id/presentation', VideoController.getPresentation);
