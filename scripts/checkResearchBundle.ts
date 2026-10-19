import { researchIntelligenceRepo } from '../backend/src/repositories/researchIntelligenceRepository';

console.log('eval_smart-road-vision plan:', researchIntelligenceRepo.findResearchPlanByEvaluationId('eval_smart-road-vision') ? 'EXISTS' : 'NULL');
console.log('smart-road-vision plan:', researchIntelligenceRepo.findResearchPlanByEvaluationId('smart-road-vision') ? 'EXISTS' : 'NULL');
console.log('Bundle for eval_smart-road-vision:', researchIntelligenceRepo.getResearchBundle('eval_smart-road-vision') ? 'EXISTS' : 'NULL');
console.log('Bundle for smart-road-vision:', researchIntelligenceRepo.getResearchBundle('smart-road-vision') ? 'EXISTS' : 'NULL');
