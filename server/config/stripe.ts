import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('Warning: STRIPE_SECRET_KEY not set. Payment features will not work.');
}

export const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2024-11-20.acacia'
});

export const STRIPE_PLANS = {
  basic: process.env.STRIPE_BASIC_PRICE_ID || '',
  pro: process.env.STRIPE_PRO_PRICE_ID || '',
  enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || ''
};
