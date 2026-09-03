import "dotenv/config";
import { hash } from "bcryptjs";
import { prisma } from "./infrastructure/database/prisma.ts";

const senha = "SenhaTesteQA123!";
const senhaHash = await hash(senha, 12);

const usuario = await prisma.usuario.create({
  data: {
    usu_nome: "QA Temp Admin",
    usu_email: "qa-temp-admin@example.com",
    usu_senha: senhaHash,
    usu_perfil_acesso: "ADMIN",
    usu_status: "ATIVO",
  },
});

console.log(JSON.stringify({ id: usuario.usu_id, email: usuario.usu_email, senha }));
await prisma.$disconnect();
