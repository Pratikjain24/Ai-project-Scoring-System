import { Router } from 'express';
import { ProjectController } from '../controllers/projectController';
import { validateBody, CreateProjectSchema } from '../middleware/validator';

export const projectRouter = Router();

projectRouter.post('/', validateBody(CreateProjectSchema), ProjectController.create);
projectRouter.get('/', ProjectController.getAll);
projectRouter.get('/:id', ProjectController.getById);
projectRouter.patch('/:id', ProjectController.update);
projectRouter.delete('/:id', ProjectController.delete);
