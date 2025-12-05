import { Router, Request, Response } from 'express';
import { stripe, STRIPE_PLANS } from '../config/stripe';
import { supabaseAdmin } from '../config/database';
import { authenticate } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

const router = Router();

router.post(
  '/create-checkout-session',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { plan } = req.body;
    const userId = req.user!.id;
    const userEmail = req.user!.email;

    if (!STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS]) {
      throw new AppError('Invalid plan', 400);
    }

    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .maybeSingle();

    let customerId = existingSubscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId }
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_PLANS[plan as keyof typeof STRIPE_PLANS],
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing?cancelled=true`,
      metadata: {
        userId,
        plan
      }
    });

    res.json({ url: session.url });
  })
);

router.post('/webhook', asyncHandler(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    throw new AppError('No signature', 400);
  }

  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET || ''
  );

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;

      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan,
          status: 'active',
          current_period_start: new Date(session.created * 1000).toISOString(),
          current_period_end: new Date((session.created + 2592000) * 1000).toISOString()
        });
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as any;
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'cancelled', plan: 'free' })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }
  }

  res.json({ received: true });
}));

export default router;
