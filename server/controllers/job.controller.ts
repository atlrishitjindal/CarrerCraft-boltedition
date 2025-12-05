import { Response } from 'express';
import { AuthRequest } from '../types';
import { supabaseAdmin } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class JobController {
  async createJob(req: AuthRequest, res: Response) {
    const userId = req.user!.id;
    const { title, company, description, requirements, location, salaryMin, salaryMax, jobType } = req.body;

    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .insert({
        employer_id: userId,
        title,
        company,
        description,
        requirements,
        location,
        salary_min: salaryMin,
        salary_max: salaryMax,
        job_type: jobType
      })
      .select()
      .single();

    if (error || !job) {
      throw new AppError('Failed to create job', 500);
    }

    await supabaseAdmin.from('activities').insert({
      user_id: userId,
      type: 'job_posted',
      title: 'Job posted',
      description: `Posted ${title} position`,
      metadata: { jobId: job.id }
    });

    res.status(201).json({ job });
  }

  async getJobs(req: AuthRequest, res: Response) {
    const { page = 1, limit = 20, search, location, jobType } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company.ilike.%${search}%`);
    }

    if (location) {
      query = query.ilike('location', `%${location}%`);
    }

    if (jobType) {
      query = query.eq('job_type', jobType);
    }

    const { data: jobs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1);

    if (error) {
      throw new AppError('Failed to fetch jobs', 500);
    }

    res.json({
      jobs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  }

  async getJobById(req: AuthRequest, res: Response) {
    const { jobId } = req.params;

    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      throw new AppError('Job not found', 404);
    }

    res.json({ job });
  }

  async getMyJobs(req: AuthRequest, res: Response) {
    const userId = req.user!.id;

    const { data: jobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .eq('employer_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch jobs', 500);
    }

    res.json({ jobs });
  }

  async updateJob(req: AuthRequest, res: Response) {
    const { jobId } = req.params;
    const userId = req.user!.id;
    const updates = req.body;

    const { data: job, error } = await supabaseAdmin
      .from('jobs')
      .update(updates)
      .eq('id', jobId)
      .eq('employer_id', userId)
      .select()
      .single();

    if (error || !job) {
      throw new AppError('Failed to update job', 500);
    }

    res.json({ job });
  }

  async deleteJob(req: AuthRequest, res: Response) {
    const { jobId } = req.params;
    const userId = req.user!.id;

    const { error } = await supabaseAdmin
      .from('jobs')
      .delete()
      .eq('id', jobId)
      .eq('employer_id', userId);

    if (error) {
      throw new AppError('Failed to delete job', 500);
    }

    res.json({ message: 'Job deleted successfully' });
  }

  async getJobApplicants(req: AuthRequest, res: Response) {
    const { jobId } = req.params;
    const userId = req.user!.id;

    const { data: job } = await supabaseAdmin
      .from('jobs')
      .select('employer_id')
      .eq('id', jobId)
      .single();

    if (!job || job.employer_id !== userId) {
      throw new AppError('Unauthorized', 403);
    }

    const { data: matches, error } = await supabaseAdmin
      .from('matches')
      .select(`
        *,
        users:user_id (
          id,
          email,
          full_name
        )
      `)
      .eq('job_id', jobId)
      .order('compatibility_score', { ascending: false });

    if (error) {
      throw new AppError('Failed to fetch applicants', 500);
    }

    res.json({ applicants: matches });
  }
}

export const jobController = new JobController();
