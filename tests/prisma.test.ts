import { describe, expect, it } from "@jest/globals";
import { PrivateKey } from "o1js";
import { PrismaClient } from "@prisma/client";
import { POSTGRES_PRISMA_URL } from "../env.json";

const prisma = new PrismaClient({
  datasourceUrl: POSTGRES_PRISMA_URL,
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
    
    const result = await prisma.user.findMany();
    console.log(result);
  });
});
