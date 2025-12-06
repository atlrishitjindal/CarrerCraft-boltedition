import { upload } from "../middleware/upload";
import { Router } from 'express';
import { resumeController } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), asyncHandler(resumeController.uploadResume.bind(resumeController)));
router.post('/upload-text', asyncHandler(resumeController.uploadResumeText.bind(resumeController)));
router.get('/', asyncHandler(resumeController.getResumes.bind(resumeController)));
router.post('/:resumeId/analyze', asyncHandler(resumeController.analyzeResume.bind(resumeController)));
router.post('/:resumeId/improve', asyncHandler(resumeController.improveResume.bind(resumeController)));
router.post('/:resumeId/skills-gap', asyncHandler(resumeController.getSkillsGap.bind(resumeController)));
router.delete('/:resumeId', asyncHandler(resumeController.deleteResume.bind(resumeController)));

export default router;
