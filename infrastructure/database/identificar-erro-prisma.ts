import "server-only";

import { Prisma } from "@/generated/prisma/client";

export function erroPrismaTemCodigo(
  error: unknown,
  codigo: string
) {
  return (
    error instanceof
      Prisma.PrismaClientKnownRequestError &&
    error.code === codigo
  );
}