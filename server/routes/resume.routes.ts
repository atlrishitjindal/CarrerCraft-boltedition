import { Router } from 'express';
import multer from 'multer';
import { resumeController } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and DOC/DOCX allowed.'));
    }
  }
});

router.use(authenticate);

router.post('/upload', upload.single('resume'), asyncHandler(resumeController.uploadResume.bind(resumeController)));
router.get('/', asyncHandler(resumeController.getResumes.bind(resumeController)));
router.post('/:resumeId/analyze', asyncHandler(resumeController.analyzeResume.bind(resumeController)));
router.post('/:resumeId/improve', asyncHandler(resumeController.improveResume.bind(resumeController)));
router.post('/:resumeId/skills-gap', asyncHandler(resumeController.getSkillsGap.bind(resumeController)));
router.delete('/:resumeId', asyncHandler(resumeController.deleteResume.bind(resumeController)));

export default router;
