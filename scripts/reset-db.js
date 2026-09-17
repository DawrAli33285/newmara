// scripts/reset-db.js
import { prisma } from '../lib/prisma.js' // adjust path to your prisma client

async function main() {
  // Delete in dependency order: children before parents
  await prisma.adUnlock.deleteMany()
  await prisma.ad.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.ghlSyncLog.deleteMany()
  await prisma.featuredPlacement.deleteMany()
  await prisma.campaignLink.deleteMany()
  await prisma.engagementEvent.deleteMany()
  await prisma.enquiry.deleteMany()
  await prisma.directoryListingEdit.deleteMany()
  await prisma.directoryListing.deleteMany()
  await prisma.businessAssignment.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.digitalPartnerPublication.deleteMany()
  await prisma.digitalPartner.deleteMany()
  await prisma.businessSubscription.deleteMany()
  await prisma.printBooking.deleteMany()
  await prisma.advertiserPayment.deleteMany()
  await prisma.advertiser.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.issueView.deleteMany()
  await prisma.pageView.deleteMany()
  await prisma.issue.deleteMany()
  await prisma.destination.deleteMany()
  await prisma.publication.deleteMany()
  await prisma.digitalPackage.deleteMany()
  await prisma.printPackage.deleteMany()
  await prisma.businessProfileEdit.deleteMany()
  await prisma.businessProfile.deleteMany()
  await prisma.business.deleteMany()
  await prisma.passwordResetToken.deleteMany()

  console.log('All tables cleared except User and Category.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())