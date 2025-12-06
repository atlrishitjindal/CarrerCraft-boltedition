import { Response } from 'express';
import { AuthRequest } from '../types';
import { supabaseAdmin, supabase } from '../config/database';
import { aiService } from '../services/ai.service';
import { pdfService } from '../services/pdf.service';
import { AppError } from '../middleware/errorHandler';

export class ResumeController {
  async uploadResume(req: AuthRequest, res: Response) {
    console.log('📂 uploadResume called');
    try {
      if (!req.file) {
        console.error('❌ No file received in request');
        throw new AppError('No file uploaded', 400);
      }

      const userId = req.user!.id;
      const file = req.file;
      console.log(`📄 Processing file: ${file.originalname} (${file.mimetype}) for user: ${userId}`);

      // Extract text from resume
      let resumeText = '';
      try {
        resumeText = await this.extractText(file);
        console.log('📝 Extracted text length:', resumeText.length);
      } catch (extractError) {
        console.error('❌ Text extraction failed:', extractError);
        // Continue but warn? Or fail? Let's use empty string for now but log it.
      }

      const fileName = `${userId}/${Date.now()}-${file.originalname}`;
      // STORAGE BYPASS: Using mock URL
      // TODO: Implement actual Supabase Storage upload
      const mockUrl = `https://placeholder-storage.com/resumes/${fileName}`;

      // Prepare DB insert payload
      const resumeData = {
        user_id: userId,
        file_url: mockUrl,
        file_name: file.originalname,
        parsed_text: resumeText || ''
      };

      console.log('💾 Inserting into DB:', resumeData);

      // Save to database
      const { data: resume, error } = await supabaseAdmin
        .from('resumes')
        .insert(resumeData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database insert error details:', JSON.stringify(error, null, 2));
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      if (!resume) {
        console.error('❌ No resume returned after insert');
        throw new AppError('Failed to save resume', 500);
      }

      console.log('✅ Resume saved successfully:', resume.id);

      // Log activity (fire and forget)
      supabaseAdmin.from('activities').insert({
        user_id: userId,
        type: 'resume_upload',
        title: 'Resume uploaded',
        description: `Uploaded ${file.originalname}`,
        metadata: { resumeId: resume.id }
      }).then(({ error: actError }) => {
        if (actError) console.warn('⚠️ Failed to log activity:', actError.message);
      });

      res.status(201).json({ resume });

    } catch (error: any) {
      console.error('🔥 Exception in uploadResume:', error);
      // Pass to global error handler
      if (error instanceof AppError) throw error;
      throw new AppError(`Upload failed: ${error.message}`, 500);
    }
  }

  async uploadResumeText(req: AuthRequest, res: Response) {
    try {
      const { text, fileName, jobDescription } = req.body;
      const userId = req.user!.id;

      if (!text) {
        throw new AppError('Resume text is required', 400);
      }

      const name = fileName || `Imported-${Date.now()}.txt`;
      // Mock URL for text uploads
      const mockUrl = `https://placeholder-storage.com/resumes/${userId}/${name}`;

      const resumeData = {
        user_id: userId,
        file_url: mockUrl,
        file_name: name,
        parsed_text: text,
        // We could store job description if we had a column, but for now we'll just use it for immediate analysis or ignore it until analysis step
      };

      const { data: resume, error } = await supabaseAdmin
        .from('resumes')
        .insert(resumeData)
        .select()
        .single();

      if (error) {
        throw new AppError(`Database error: ${error.message}`, 500);
      }

      // Log activity
      await supabaseAdmin.from('activities').insert({
        user_id: userId,
        type: 'resume_upload',
        title: 'Resume text imported',
        description: `Imported ${name}`,
        metadata: { resumeId: resume.id }
      });

      res.status(201).json({ resume });
    } catch (error: any) {
      console.error('🔥 Exception in uploadResumeText:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(`Upload failed: ${error.message}`, 500);
    }
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
      throw new AppError('Resume has no parsed text. Please re-upload the resume.', 400);
    }

    // Use AI service for real analysis
    console.log('🤖 Starting AI analysis for resume:', resumeId);
    const analysis = await aiService.analyzeResume(resume.parsed_text);
    console.log('✅ AI analysis complete. ATS Score:', analysis.atsScore);

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
