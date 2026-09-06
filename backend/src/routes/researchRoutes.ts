import { Router } from 'express';
import { ResearchController } from '../controllers/researchController';

export const researchRouter = Router();

researchRouter.get('/evaluation/:id', ResearchController.getByEvaluationId);
researchRouter.post('/source/:id/refresh', (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.params.id,
      lastRefreshed: new Date().toISOString(),
      fetchStatus: 'SUCCESS'
    }
  });
});
