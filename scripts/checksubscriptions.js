require('dotenv').config()
const Stripe = require('stripe')

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const subscriptionIds = [
 'sub_1UGyetLyHmPH8TShfFmEeATX'
]

async function main() {
  const results = await Promise.all(
    subscriptionIds.map(async (id) => {
      try {
        const sub = await stripe.subscriptions.retrieve(id)
        return {
          id: sub.id,
          status: sub.status,
          current_period_end: sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null,
          current_period_start: sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null,
          cancel_at_period_end: sub.cancel_at_period_end,
          canceled_at: sub.canceled_at
            ? new Date(sub.canceled_at * 1000).toISOString()
            : null,
          customer: sub.customer,
          metadata: sub.metadata,
        }
      } catch (err) {
        return { id, error: err.message }
      }
    })
  )
  const sub = await stripe.subscriptions.retrieve('sub_1UGyetLyHmPH8TShfFmEeATX', {
    expand: ['items.data.price'],
  })
  console.log(sub.items.data.map(i => ({
    interval: i.price.recurring?.interval,
    interval_count: i.price.recurring?.interval_count,
    amount: i.price.unit_amount,
  })))
  console.log(JSON.stringify(results, null, 2))
}

main()