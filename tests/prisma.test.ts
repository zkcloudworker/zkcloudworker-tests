import { describe, expect, it } from "@jest/globals";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.POSTGRES_PRISMA_URL,
});

/*
datasource db {
  provider = "postgresql"
  url = env("POSTGRES_PRISMA_URL") // uses connection pooling
  directUrl = env("POSTGRES_URL_NON_POOLING") // uses a direct connection
}
  */

describe("Prisma", () => {
  it("should test prisma", async () => {
    const result = await prisma.aPIKey.findMany();
    console.log(result);
  });
});
