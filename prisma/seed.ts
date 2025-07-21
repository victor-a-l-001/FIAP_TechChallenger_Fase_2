import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);
  var professor = await prisma.userType.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'Professor',
      description: 'Professor',
      createdAt: new Date(),
    },
  });

  var aluno = await prisma.userType.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: 'Aluno',
      description: 'Aluno',
      createdAt: new Date(),
    },
  });

  await prisma.user.upsert({
    where: { email: 'professor@nulo.com.br' },
    update: {},
    create: {
      email: 'professor@nulo.com.br',
      userTypeId: professor.id,
      disabled: false,
      name: 'Professor',
      password: hashedPassword,
    },
  });
  
  await prisma.user.upsert({
    where: { email: 'aluno@nulo.com.br' },
    update: {},
    create: {
      email: 'aluno@nulo.com.br',
      userTypeId: aluno.id,
      disabled: false,
      name: 'Aluno',
      password: hashedPassword,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
