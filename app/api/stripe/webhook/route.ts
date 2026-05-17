import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      if (userId) {
        await getSupabaseAdmin().from('profiles').update({
          is_pro: true,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
        }).eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted':
    case 'customer.subscription.paused': {
      const sub = event.data.object as Stripe.Subscription
      await getSupabaseAdmin().from('profiles').update({
        is_pro: false,
        stripe_subscription_id: null,
      }).eq('stripe_customer_id', sub.customer as string)
      break
    }

    case 'customer.subscription.resumed':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const isActive = sub.status === 'active'
      await getSupabaseAdmin().from('profiles').update({
        is_pro: isActive,
      }).eq('stripe_customer_id', sub.customer as string)
      break
    }
  }

  return NextResponse.json({ received: true })
}
