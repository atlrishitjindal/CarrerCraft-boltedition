import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/database';
import { emailService } from '../services/email.service';
import { AppError } from '../middleware/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export class AuthController {
  async signup(req: Request, res: Response) {
    const { email, password, fullName, role = 'user' } = req.body;

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        full_name: fullName,
        role
      })
      .select('id, email, role, full_name')
      .single();

    if (error || !newUser) {
      throw new AppError('Failed to create user', 500);
    }

    await supabaseAdmin.from('subscriptions').insert({
      user_id: newUser.id,
      plan: 'free',
      status: 'active'
    });

    await supabaseAdmin.from('activities').insert({
      user_id: newUser.id,
      type: 'account_created',
      title: 'Welcome to CareerCraft AI',
      description: 'Your account has been successfully created'
    });

    await emailService.sendWelcomeEmail(email, fullName);

    const accessToken = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: newUser.id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role
      },
      accessToken,
      refreshToken
    });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url
      },
      accessToken,
      refreshToken
    });
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 400);
    }

    try {
      const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { id: string };

      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id, email, role, full_name')
        .eq('id', decoded.id)
        .single();

      if (error || !user) {
        throw new AppError('Invalid refresh token', 401);
      }

      const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({ accessToken });
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async getProfile(req: Request, res: Response) {
    const userId = (req as any).user.id;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, avatar_url, role, created_at')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new AppError('User not found', 404);
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    res.json({
      user,
      subscription
    });
  }
}

export const authController = new AuthController();
