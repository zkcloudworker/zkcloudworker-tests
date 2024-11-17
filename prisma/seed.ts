import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Define your initial data here
  // Create a user
  // await prisma.user.create({
  //   data: {
  //     name: "Alice",
  //     email: "alice@example.com",
  //   },
  // });
  // Create other entities
  // await prisma.post.create({ ... })
}

main()
  .then(() => {
    console.log("Database has been seeded. 🌱");
  })
  .catch((e) => {
    console.error("Seeding failed: ", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
