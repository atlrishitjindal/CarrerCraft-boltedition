// server/controllers/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '../config/database';
import { emailService } from '../services/email.service'; // optional - keep if available
import { supabase } from '../supabaseClient';


const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  // Fail early in dev so you don't chase weird errors later
  // (You can remove this runtime check in production if handled elsewhere)
  // eslint-disable-next-line no-console
  console.warn('WARNING: JWT_SECRET or JWT_REFRESH_SECRET not set in environment');
}

const signAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

const signRefreshToken = (payload: object) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { email, password, fullName, role = 'user' } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ message: 'email, password and fullName are required' });
    }

    // check existing user
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({ message: 'Database error checking user', detail: checkError });
    }

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // hash password
    const password_hash = await bcrypt.hash(password, 12);

    // create user
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash,
        full_name: fullName,
        role,
      })
      .select('id, email, role, full_name')
      .single();

    if (insertError || !newUser) {
      return res.status(500).json({ message: 'Failed to create user', detail: insertError });
    }

    // create default subscription/activity if you want — ignore error if present
    try {
      await supabaseAdmin.from('subscriptions').insert({
        user_id: newUser.id,
        plan: 'free',
        status: 'active',
      });
      await supabaseAdmin.from('activities').insert({
        user_id: newUser.id,
        type: 'account_created',
        title: 'Welcome to CareerCraft AI',
        description: 'Your account has been successfully created',
      });
      // optionally send welcome email if emailService exists
      if (emailService?.sendWelcomeEmail) {
        emailService.sendWelcomeEmail(newUser.email, newUser.full_name).catch(() => { });
      }
    } catch {
      // ignore non-fatal seed errors
    }

    const accessToken = signAccessToken({ id: newUser.id, email: newUser.email, role: newUser.role });
    const refreshToken = signRefreshToken({ id: newUser.id });

    return res.status(201).json({
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Signup error:', err);
    return res.status(500).json({ message: 'Signup failed', error: err?.message || err });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: 'Database error', detail: error });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        avatarUrl: user.avatar_url ?? null,
      },
      accessToken,
      refreshToken,
    });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Login failed', error: err?.message || err });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET as string) as { id: string };
    if (!decoded?.id) return res.status(401).json({ message: 'Invalid refresh token' });

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !user) return res.status(401).json({ message: 'Invalid refresh token' });

    const newAccessToken = signAccessToken({ id: user.id, email: user.email, role: user.role });
    return res.json({ accessToken: newAccessToken });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Refresh token error:', err);
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id || req.params.id;
    if (!userId) return res.status(400).json({ message: 'User id required' });

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, avatar_url, role, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({ message: 'User not found', detail: userError });
    }

    const { data: subscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return res.json({ user, subscription: subscription ?? null });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Get profile error:', err);
    return res.status(500).json({ message: 'Failed to fetch profile', error: err?.message || err });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { fullName } = req.body;
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ full_name: fullName })
      .eq('id', userId)
      .select('id, email, full_name, role')
      .maybeSingle();

    if (error) return res.status(500).json({ message: 'Failed to update profile', detail: error });

    return res.json({ user });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Update profile error:', err);
    return res.status(500).json({ message: 'Failed to update profile', error: err?.message || err });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .maybeSingle();

    if (error || !user) return res.status(404).json({ message: 'User not found' });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValidPassword) return res.status(401).json({ message: 'Invalid current password' });

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ password_hash: newPasswordHash })
      .eq('id', userId);

    if (updateError) return res.status(500).json({ message: 'Failed to update password', detail: updateError });

    return res.json({ message: 'Password updated successfully' });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Update password error:', err);
    return res.status(500).json({ message: 'Failed to update password', error: err?.message || err });
  }
};
