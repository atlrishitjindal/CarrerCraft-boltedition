import { Response } from 'express';
import { AuthRequest } from '../types';
import { supabaseAdmin } from '../config/database';
import { aiService } from '../services/ai.service';
import { emailService } from '../services/email.service';
import { AppError } from '../middleware/errorHandler';

export class MatchController {
  async matchJobs(req: AuthRequest, res: Response) {
    const { resumeId } = req.body;
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

    const { data: jobs } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .limit(20);

    if (!jobs || jobs.length === 0) {
      return res.json({ matches: [] });
    }

    const matches = [];

    for (const job of jobs) {
      const matchResult = await aiService.matchJobToResume(
        resume.parsed_text,
        job.description,
        job.title
      );

      if (matchResult.compatibilityScore > 50) {
        const { data: existingMatch } = await supabaseAdmin
          .from('matches')
          .select('id')
          .eq('user_id', userId)
          .eq('job_id', job.id)
          .maybeSingle();

        if (!existingMatch) {
          const { data: newMatch } = await supabaseAdmin
            .from('matches')
            .insert({
              user_id: userId,
              job_id: job.id,
              compatibility_score: matchResult.compatibilityScore,
              matching_skills: matchResult.matchingSkills,
              missing_keywords: matchResult.missingKeywords
            })
            .select()
            .single();

          if (newMatch) {
            matches.push({ ...newMatch, job });
          }
        }
      }
    }

    res.json({ matches });
  }

  async getMatches(req: AuthRequest, res: Response) {
    const userId = req.user!.id;

    const { data: matches, error } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        jobs (*)
      `)
      .eq('user_id', userId)
      .order('compatibility_score', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch matches', 500);
    }

    res.json({ matches });
  }

  async generateCoverLetter(req: AuthRequest, res: Response) {
    const { matchId } = req.params;
    const userId = req.user!.id;

    const { data: match } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        jobs (*),
        resumes:user_id (parsed_text)
      `)
      .eq('id', matchId)
      .eq('user_id', userId)
      .single();

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    const { data: resume } = await supabaseAdmin
      .from('resumes')
      .select('parsed_text')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    const coverLetter = await aiService.generateCoverLetter(
      resume.parsed_text,
      match.jobs.description,
      match.jobs.title,
      match.jobs.company
    );

    await supabaseAdmin
      .from('matches')
      .update({ cover_letter: coverLetter })
      .eq('id', matchId);

    res.json({ coverLetter });
  }

  async generateInterviewQuestions(req: AuthRequest, res: Response) {
    const { matchId } = req.params;
    const userId = req.user!.id;

    const { data: match } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        jobs (*)
      `)
      .eq('id', matchId)
      .eq('user_id', userId)
      .single();

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    const { data: resume } = await supabaseAdmin
      .from('resumes')
      .select('parsed_text')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!resume) {
      throw new AppError('Resume not found', 404);
    }

    const questions = await aiService.generateInterviewQuestions(
      match.jobs.description,
      match.jobs.title,
      resume.parsed_text
    );

    await supabaseAdmin
      .from('matches')
      .update({ interview_questions: questions })
      .eq('id', matchId);

    res.json({ questions });
  }

  async applyToJob(req: AuthRequest, res: Response) {
    const { matchId } = req.params;
    const userId = req.user!.id;

    const { data: match } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        jobs (*)
      `)
      .eq('id', matchId)
      .eq('user_id', userId)
      .single();

    if (!match) {
      throw new AppError('Match not found', 404);
    }

    const { error } = await supabaseAdmin
      .from('matches')
      .update({
        status: 'applied',
        applied_at: new Date().toISOString()
      })
      .eq('id', matchId);

    if (error) {
      throw new AppError('Failed to apply to job', 500);
    }

    await supabaseAdmin.from('activities').insert({
      user_id: userId,
      type: 'job_applied',
      title: 'Applied to job',
      description: `Applied to ${match.jobs.title} at ${match.jobs.company}`,
      metadata: { matchId, jobId: match.jobs.id }
    });

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (user) {
      await emailService.sendJobApplicationConfirmation(
        user.email,
        match.jobs.title,
        match.jobs.company
      );
    }

    res.json({ message: 'Application submitted successfully' });
  }

  async updateMatchStatus(req: AuthRequest, res: Response) {
    const { matchId } = req.params;
    const { status } = req.body;
    const userId = req.user!.id;

    const { data: match, error } = await supabaseAdmin
      .from('matches')
      .update({ status })
      .eq('id', matchId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !match) {
      throw new AppError('Failed to update match status', 500);
    }

    res.json({ match });
  }
}

export const matchController = new MatchController();
