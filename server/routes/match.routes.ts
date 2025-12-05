import { Router } from 'express';
import { matchController } from '../controllers/match.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.post('/match-jobs', asyncHandler(matchController.matchJobs.bind(matchController)));
router.get('/', asyncHandler(matchController.getMatches.bind(matchController)));
router.post('/:matchId/cover-letter', asyncHandler(matchController.generateCoverLetter.bind(matchController)));
router.post('/:matchId/interview-questions', asyncHandler(matchController.generateInterviewQuestions.bind(matchController)));
router.post('/:matchId/apply', asyncHandler(matchController.applyToJob.bind(matchController)));
router.patch('/:matchId/status', asyncHandler(matchController.updateMatchStatus.bind(matchController)));

export default router;
