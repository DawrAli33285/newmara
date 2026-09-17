const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const PACKAGES = [
  {
    name: 'Essential',
    description: 'Logo only — the simplest digital presence.',
    priceCents: 1900,
    billingInterval: 'monthly',
    entitlements: {
      logoUrl: true,
      description: false,
      location: false,
      mapUrl: false,
      website: false,
      telephone: false,
      socialLinks: false,
      galleryUrls: false,
      promoVideoUrl: false,
      ctaText: false,
      ctaUrl: false,
      galleryLimit: 0,
    },
  },
  {
    name: 'Enhanced',
    description: 'Logo and website — a step up for businesses that want to drive traffic offsite.',
    priceCents: 4900,
    billingInterval: 'monthly',
    entitlements: {
      logoUrl: true,
      description: false,
      location: false,
      mapUrl: false,
      website: true,
      telephone: false,
      socialLinks: false,
      galleryUrls: false,
      promoVideoUrl: false,
      ctaText: false,
      ctaUrl: false,
      galleryLimit: 0,
    },
  },
  {
    name: 'Premier',
    description: 'Full business profile — every field unlocked.',
    priceCents: 9900,
    billingInterval: 'monthly',
    entitlements: {
      logoUrl: true,
      description: true,
      location: true,
      mapUrl: true,
      website: true,
      telephone: true,
      socialLinks: true,
      galleryUrls: true,
      promoVideoUrl: true,
      ctaText: true,
      ctaUrl: true,
      galleryLimit: 10,
    },
  },
]

async function main() {
  for (const pkg of PACKAGES) {
    const result = await prisma.digitalPackage.upsert({
      where: { name: pkg.name },
      update: {
        description: pkg.description,
        priceCents: pkg.priceCents,
        billingInterval: pkg.billingInterval,
        entitlements: pkg.entitlements,
        isActive: true,
      },
      create: pkg,
    })
    console.log(`Upserted package: ${result.name} (${result.id})`)
  }
}

main()
  .catch((err) => {
    console.error('SEED ERROR:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })