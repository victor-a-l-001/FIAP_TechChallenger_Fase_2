import { execSync } from 'child_process';
import path from 'path';
import dotenv from 'dotenv';

export default async function globalSetup() {
  const envPath = path.resolve(process.cwd(), '.env.e2e');

  dotenv.config({ path: envPath });

  const cliEnv = {
    ...process.env,
    DOTENV_CONFIG_PATH: envPath,
  };

  const schema = path.resolve(process.cwd(), 'prisma-e2e', 'schema.prisma');

  execSync(`npx prisma migrate reset --force --schema="${schema}"`, {
    stdio: 'inherit',
    env: cliEnv,
  });

  execSync(`npx prisma db push --schema="${schema}"`, {
    stdio: 'inherit',
    env: cliEnv,
  });
}
