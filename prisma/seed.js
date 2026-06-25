const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

async function main() {
  const publications = [
    {
      title: "The Skipper",
      slug: "the-skipper",
      description: "Monthly maritime publication",
    },
    {
      title: "Take Off",
      slug: "take-off",
      description: "Annual aviation publication",
    },
    {
      title: "Go West",
      slug: "go-west",
      description: "Annual western lifestyle publication",
    },
    {
      title: "The Business",
      slug: "the-business",
      description: "Annual business publication",
    },
    {
      title: "Due South",
      slug: "due-south",
      description: "Annual southern lifestyle publication",
    },
  ];

  for (const pub of publications) {
    await prisma.publication.upsert({
      where: { slug: pub.slug },
      update: {},
      create: pub,
    });
  }
  console.log("✅ 5 publications seeded");

  const passwordHash = await bcrypt.hash("Admin1234!", 12);
  await prisma.user.upsert({
    where: { email: "admin@maramedia.ie" },
    update: {},
    create: { email: "admin@maramedia.ie", passwordHash, role: "admin" },
  });
  await prisma.user.upsert({
    where: { email: "marketing@maramedia.ie" },
    update: {},
    create: { email: "marketing@maramedia.ie", passwordHash, role: "admin" },
  });
  console.log("✅ Admin users created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
