import { Router } from 'express';
import { jobController } from '../controllers/job.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { jobSchema } from '../utils/validators';

const router = Router();

router.use(authenticate);

router.post('/', authorize('employer', 'admin'), validate(jobSchema), asyncHandler(jobController.createJob.bind(jobController)));
router.get('/', asyncHandler(jobController.getJobs.bind(jobController)));
router.get('/my-jobs', authorize('employer', 'admin'), asyncHandler(jobController.getMyJobs.bind(jobController)));
router.get('/:jobId', asyncHandler(jobController.getJobById.bind(jobController)));
router.put('/:jobId', authorize('employer', 'admin'), asyncHandler(jobController.updateJob.bind(jobController)));
router.delete('/:jobId', authorize('employer', 'admin'), asyncHandler(jobController.deleteJob.bind(jobController)));
router.get('/:jobId/applicants', authorize('employer', 'admin'), asyncHandler(jobController.getJobApplicants.bind(jobController)));

export default router;
