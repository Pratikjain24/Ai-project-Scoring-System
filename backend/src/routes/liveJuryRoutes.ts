import { Router } from 'express';
import { LiveJuryController } from '../controllers/liveJuryController';

export const liveJuryRouter = Router({ mergeParams: true });
const controller = new LiveJuryController();

// Session lifecycle
liveJuryRouter.post('/start', controller.startSession);
liveJuryRouter.get('/status', controller.getStatus);
liveJuryRouter.get('/score', controller.getScore);
liveJuryRouter.post('/pause', controller.pauseSession);
liveJuryRouter.post('/resume', controller.resumeSession);
liveJuryRouter.post('/end', controller.endSession);

// Streaming streams & observations
liveJuryRouter.get('/events', controller.getEvents);
liveJuryRouter.get('/transcript', controller.getTranscript);
liveJuryRouter.get('/observations', controller.getObservations);
liveJuryRouter.get('/claims', controller.getClaims);
liveJuryRouter.get('/demo', controller.getDemo);
liveJuryRouter.post('/telemetry', controller.ingestTelemetry);

// Judge interactions
liveJuryRouter.get('/questions', controller.getQuestions);
liveJuryRouter.post('/questions/:questionId/ask', controller.markQuestionAsked);
liveJuryRouter.post('/questions/:questionId/asked', controller.markQuestionAsked);
liveJuryRouter.post('/notes', controller.addNote);
