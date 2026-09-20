// lib/subscription-status.js
import { prisma } from '@/lib/prisma'

const ACTIVE_STATUSES = ['active', 'trialing']

export async function getBusinessSubscriptionStatus(businessId) {
  const subscription = await prisma.businessSubscription.findFirst({
    where: { businessId },
    orderBy: { createdAt: 'desc' },
  })

  if (!subscription) {
    return { hasSubscription: false, isActive: false, subscription: null }
  }

  return {
    hasSubscription: true,
    isActive: ACTIVE_STATUSES.includes(subscription.status),
    subscription,
  }
}