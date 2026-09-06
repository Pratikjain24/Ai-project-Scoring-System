import { Router } from 'express';
import { VideoController } from '../controllers/videoController';

export const videoRouter = Router();

videoRouter.post('/', VideoController.upload);
videoRouter.get('/:id', VideoController.getById);
videoRouter.post('/:id/analyze', VideoController.analyze);
videoRouter.get('/:id/status', VideoController.getStatus);
videoRouter.get('/:id/transcript', VideoController.getTranscript);
videoRouter.get('/:id/timeline', VideoController.getTimeline);
videoRouter.get('/:id/events', VideoController.getEvents);
videoRouter.get('/:id/observations', VideoController.getObservations);
videoRouter.get('/:id/demo', VideoController.getDemo);
videoRouter.get('/:id/presentation', VideoController.getPresentation);
