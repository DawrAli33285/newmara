const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const res = await prisma.directoryListingEdit.findMany({
    where: { id: 'cmu6ov78t000de2oxo6jcinvg' },
    include: {
      directoryListing: {
        select: {
          id: true,
          businessName: true,
          business: {
            select: {
              businessName: true,
              email: true,
              category: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  })
  console.log(JSON.stringify(res, null, 2))
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect())