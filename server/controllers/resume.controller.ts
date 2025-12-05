import { Response } from 'express';
import { AuthRequest } from '../types';
import { supabaseAdmin, supabase } from '../config/database';
import { aiService } from '../services/ai.service';
import { pdfService } from '../services/pdf.service';
import { AppError } from '../middleware/errorHandler';

export class ResumeController {
  async uploadResume(req: AuthRequest, res: Response) {
    if (!req.file) {
      throw new AppError('No file uploaded', 400);
    }

    const userId = req.user!.id;
    const file = req.file;
    const fileName = `${userId}/${Date.now()}-${file.originalname}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      throw new AppError('Failed to upload file', 500);
    }

    const { data: urlData } = supabase.storage
      .from('resumes')
      .getPublicUrl(fileName);

    const resumeText = await this.extractText(file);

    const { data: resume, error } = await supabaseAdmin
      .from('resumes')
      .insert({
        user_id: userId,
        file_url: urlData.publicUrl,
        file_name: file.originalname,
        parsed_text: resumeText
      })
      .select()
      .single();

    if (error || !resume) {
      throw new AppError('Failed to save resume', 500);
    }

    await supabaseAdmin.from('activities').insert({
      user_id: userId,
      type: 'resume_upload',
      title: 'Resume uploaded',
      description: `Uploaded ${file.originalname}`,
      metadata: { resumeId: resume.id }
    });

    res.status(201).json({ resume });
  }

  async analyzeResume(req: AuthRequest, res: Response) {
    const { resumeId } = req.params;
    const userId = req.user!.id;

    const { data: resume, error } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (error || !resume) {
      throw new AppError('Resume not found', 404);
    }

    if (!resume.parsed_text) {
      throw new AppError('Resume has no text content', 400);
    }

    const analysis = await aiService.analyzeResume(resume.parsed_text);

    const { error: updateError } = await supabaseAdmin
      .from('resumes')
      .update({
        ats_score: analysis.atsScore,
        improvement_suggestions: analysis.improvementSuggestions,
        skill_suggestions: analysis.skillSuggestions,
        skills_extracted: analysis.skillsExtracted,
        experience_years: analysis.experienceYears
      })
      .eq('id', resumeId);

    if (updateError) {
      throw new AppError('Failed to save analysis', 500);
    }

    await supabaseAdmin.from('activities').insert({
      user_id: userId,
      type: 'resume_analyzed',
      title: 'Resume analyzed',
      description: `ATS Score: ${analysis.atsScore}/100`,
      metadata: { resumeId, atsScore: analysis.atsScore }
    });

    res.json({ analysis });
  }

  async improveResume(req: AuthRequest, res: Response) {
    const { resumeId } = req.params;
    const userId = req.user!.id;

    const { data: resume } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    const improvedText = await aiService.improveResume(resume.parsed_text);

    const improvedFileName = `${userId}/improved-${Date.now()}.txt`;
    const { data: uploadData } = await supabase.storage
      .from('resumes')
      .upload(improvedFileName, improvedText, {
        contentType: 'text/plain'
      });

    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(improvedFileName);

      await supabaseAdmin
        .from('resumes')
        .update({ rewritten_resume_url: urlData.publicUrl })
        .eq('id', resumeId);
    }

    res.json({ improvedText });
  }

  async getSkillsGap(req: AuthRequest, res: Response) {
    const { resumeId } = req.params;
    const { targetRole } = req.body;
    const userId = req.user!.id;

    const { data: resume } = await supabaseAdmin
      .from('resumes')
      .select('parsed_text')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    const skillSuggestions = await aiService.identifySkillsGap(
      resume.parsed_text,
      targetRole
    );

    res.json({ skillSuggestions });
  }

  async getResumes(req: AuthRequest, res: Response) {
    const userId = req.user!.id;

    const { data: resumes, error } = await supabaseAdmin
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch resumes', 500);
    }

    res.json({ resumes });
  }

  async deleteResume(req: AuthRequest, res: Response) {
    const { resumeId } = req.params;
    const userId = req.user!.id;

    const { error } = await supabaseAdmin
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (error) {
      throw new AppError('Failed to delete resume', 500);
    }

    res.json({ message: 'Resume deleted successfully' });
  }

  private async extractText(file: Express.Multer.File): Promise<string> {
    const mimeType = file.mimetype;

    if (mimeType === 'application/pdf') {
      return await pdfService.extractTextFromPDF(file.buffer);
    } else if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      return await pdfService.extractTextFromDOCX(file.buffer);
    }

    return file.buffer.toString('utf-8');
  }
}

export const resumeController = new ResumeController();
