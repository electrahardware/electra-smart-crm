import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";

async function main() {

  const exists =
    await prisma.user.findUnique({
      where: {
        email:
          "admin@electra.com",
      },
    });

  if (exists) {

    console.log(
      "Admin already exists."
    );

    return;

  }

  const password =
    await bcrypt.hash(
      "admin123",
      10
    );

  await prisma.user.create({
    data: {
      name: "Administrator",
      email:
        "admin@electra.com",
      password,
      role: "Admin",
    },
  });

  console.log(
    "✅ Admin user created."
  );

}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });